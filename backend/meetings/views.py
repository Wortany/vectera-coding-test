import logging
import threading
from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from .models import Meeting, Note, Summary
from .serializers import MeetingSerializer, NoteSerializer, SummarySerializer
from .paginations import MeetingPagination, NotePagination
from .services import ai

log = logging.getLogger(__name__)

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)

class MeetingViewSet(viewsets.ModelViewSet):
    """
    - list with pagination (newest first)
    - retrieve (include latest summary if any)
    - create
    """
    queryset = Meeting.objects.all().order_by("-started_at").annotate(note_count=Count("notes"))
    serializer_class = MeetingSerializer
    pagination_class = MeetingPagination

    @action(detail=True, methods=["get", "post"], url_path="notes", serializer_class=NoteSerializer)
    def notes(self, request, pk=None):
        if request.method == "POST":
            return self.add_note(request, pk)
        elif request.method == "GET":
            return self.list_notes(request, pk)

    def add_note(self, request, pk=None):
        """
        Validate and create a Note for this meeting.
        """
        meeting = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(meeting=meeting)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def list_notes(self, request, pk=None):
        """
        Return paginated notes, ordered oldest..newest.
        """
        meeting = self.get_object()
        notes = meeting.notes.all().order_by("created_at")
        self.pagination_class = NotePagination
        serializer = self.get_serializer(notes, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="summarize", serializer_class=Serializer)
    def summarize(self, request, pk=None):
        """
        - Create or update a Summary with status 'pending'
        - Simulate async job: concatenate notes, call services.ai.summarize, then set 'ready'/'failed'
        - Log meeting_id and note_count
        - Return 202 Accepted
        """
        log.info("Summarize Requested; Meeting Id = %s", pk)

        meeting = self.get_object()
        Summary.objects.update_or_create(meeting=meeting, defaults={'status': Summary.PENDING, 'content': ''})
        log.info("Summarize Pending; Meeting Id = %s; Note Count = %s", pk, str(meeting.note_count))

        threading.Thread(
            target=self.summarize_background,
            args=(meeting,)
        ).start()

        return Response({"detail": "Summarization in progress"}, status=status.HTTP_202_ACCEPTED)
    
    def summarize_background(self, meeting):
        summary = Summary.objects.get(meeting=meeting)
        concatenated_notes = " ".join(meeting.notes.values_list("text", flat=True))
        try:
            summary_text = ai.summarize(concatenated_notes)
            summary.status = Summary.READY
            summary.content = summary_text
            summary.save()
            log.info("Summarize Ready; Meeting Id = %s", meeting.id)
        except Exception as e:
            summary.status = Summary.FAILED
            summary.save()
            log.error("Summarize Failed; Meeting Id = %s; Error = %s", meeting.id, str(e))


    @action(detail=True, methods=["get"], url_path="summary", serializer_class=SummarySerializer)
    def get_summary(self, request, pk=None):
        """
        Return the summary or 404 if none.
        """
        meeting = self.get_object()

        try:
            summary = meeting.summary
            serializer = self.get_serializer(summary)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Summary.DoesNotExist:
            return Response({"detail": "Summary not found"}, status=status.HTTP_404_NOT_FOUND)
