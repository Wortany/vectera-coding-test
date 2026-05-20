import pytest

from meetings.models import Meeting, Note, Summary

@pytest.mark.django_db
class TestMeetingValidation:
    def test_normal_meeting_validation(self):
        meeting = Meeting(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        meeting.full_clean()  # Should not raise

    def test_meeting_started_at_required(self):
        meeting = Meeting(title="Test Meeting")
        with pytest.raises(Exception):
            meeting.full_clean()  # Should raise due to missing started_at

    def test_meeting_title_required(self):
        meeting = Meeting(started_at="2024-01-01T10:00:00Z")
        with pytest.raises(Exception):
            meeting.full_clean()  # Should raise due to missing title
    
    def test_meeting_title_max_length(self):
        meeting = Meeting(title="A" * 201, started_at="2024-01-01T10:00:00Z")
        with pytest.raises(Exception):
            meeting.full_clean()  # Should raise due to title exceeding max_length

    def test_meeting_ordering(self):
        Meeting.objects.create(title="Meeting 1", started_at="2024-10-01T10:00:00Z")
        Meeting.objects.create(title="Meeting 2", started_at="2024-03-01T10:00:00Z")
        Meeting.objects.create(title="Meeting 3", started_at="2024-07-01T10:00:00Z")
        meetings = Meeting.objects.all()
        assert meetings[0].started_at >= meetings[1].started_at >= meetings[2].started_at  # Newest first

@pytest.mark.django_db
class TestNoteValidation:
    def test_note_validation(self):
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        note = Note(meeting=meeting, author="Alice", text="This is a note.")
        note.full_clean()  # Should not raise

    def test_note_meeting_required(self):
        note = Note(author="Alice", text="This is a note.")
        with pytest.raises(Exception):
            note.full_clean()  # Should raise due to missing meeting    
    
    def test_note_author_required(self):
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        note = Note(meeting=meeting, text="This is a note.")
        with pytest.raises(Exception):
            note.full_clean()  # Should raise due to missing author

    def test_note_text_required(self):
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        note = Note(meeting=meeting, author="Alice")
        with pytest.raises(Exception):
            note.full_clean()  # Should raise due to missing text

    def test_note_ordering(self):
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        n1 = Note.objects.create(meeting=meeting, author="Alice", text="First note")
        n2 = Note.objects.create(meeting=meeting, author="Bob", text="Second note")
        notes = meeting.notes.all()
        assert notes[0] == n1  # Oldest first
        assert notes[1] == n2

    def test_note_indexing(self):
        # check a complex composite Index array wrapper:
        index_fields = [idx.fields for idx in Note._meta.indexes]
        assert ['meeting', 'created_at'] in index_fields

@pytest.mark.django_db
class TestSummaryValidation:
    def test_summary_validation(self):
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        summary = Summary(meeting=meeting, content="This is a summary.", status=Summary.READY)
        summary.full_clean()  # Should not raise

    def test_summary_status_choices(self):
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        summary = Summary(meeting=meeting, content="This is a summary.", status="invalid_status")
        with pytest.raises(Exception):
            summary.full_clean()  # Should raise due to invalid status choice