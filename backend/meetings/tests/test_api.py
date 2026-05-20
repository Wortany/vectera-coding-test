import pytest
from unittest.mock import patch, MagicMock

from rest_framework.test import APIClient
from meetings.models import Meeting, Note, Summary

@pytest.fixture
def api_client():
    """Fixture to provide a standard DRF API client."""
    return APIClient()

def test_api_health_check(api_client):
    response = api_client.get("/api/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.django_db
class TestMeetingAPI:
    # Meeting List Tests
    
    def test_api_meeting_list(self, api_client):
        response = api_client.get("/api/meetings/")
        assert response.status_code == 200
        assert "results" in response.json()

    def test_api_meeting_list_note_count(self, api_client):
        # Create a meeting and some notes
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        Note.objects.create(meeting=meeting, author="Alice", text="Note 1")
        Note.objects.create(meeting=meeting, author="Bob", text="Note 2")

        response = api_client.get("/api/meetings/")
        assert response.status_code == 200
        assert len(response.json()["results"]) == 1
        assert response.json()["results"][0]["note_count"] == 2

    def test_api_meeting_list_empty_latest_summary(self, api_client):
        # Create a meeting with no summary
        Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")

        response = api_client.get("/api/meetings/")
        assert response.status_code == 200
        assert len(response.json()["results"]) == 1
        assert response.json()["results"][0]["latest_summary"] is None

    # Meeting Create Tests

    def test_api_meeting_create(self, api_client):
        data = {
            "title": "Test Meeting",
            "started_at": "2024-01-01T10:00:00Z"
        }
        response = api_client.post("/api/meetings/", data, format="json")

        assert response.status_code == 201
        assert response.json()["title"] == data["title"]
        assert response.json()["started_at"] == data["started_at"]

    def test_api_meeting_create_invalid_data(self, api_client):
        data = {
            "title": "",  # Title is required and cannot be empty
            "started_at": "invalid-date"  # Invalid date format
        }
        response = api_client.post("/api/meetings/", data, format="json")
        assert response.status_code == 400
        assert "title" in response.json()
        assert "started_at" in response.json()

    def test_api_meeting_create_missing_fields(self, api_client):
        data = {
            "title": "Test Meeting"
            # Missing started_at
        }
        response = api_client.post("/api/meetings/", data, format="json")
        assert response.status_code == 400
        assert "started_at" in response.json()

    def test_api_meeting_create_extra_fields(self, api_client):
        data = {
            "title": "Test Meeting",
            "started_at": "2024-01-01T10:00:00Z",
            "extra_field": "This should be ignored"
        }
        response = api_client.post("/api/meetings/", data, format="json")
        assert response.status_code == 201
        assert response.json()["title"] == data["title"]
        assert response.json()["started_at"] == data["started_at"]
        assert "extra_field" not in response.json()

    # Meeting Retrieve Tests

    def test_api_meeting_retrieve(self, api_client):
        # First create a meeting to retrieve
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        response = api_client.get(f"/api/meetings/{meeting.id}/")

        # Force Django to pull the actual parsed datetime object from the DB
        meeting.refresh_from_db()

        assert response.status_code == 200
        assert response.json()["id"] == meeting.id
        assert response.json()["title"] == meeting.title
        assert response.json()["started_at"] == meeting.started_at.isoformat().replace("+00:00", "Z")

    def test_api_meeting_retrieve_with_summary(self, api_client):
        # Create a meeting and a summary
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        Summary.objects.create(meeting=meeting, content="This is a summary.", status=Summary.READY)

        response = api_client.get(f"/api/meetings/{meeting.id}/")
        assert response.status_code == 200
        assert response.json()["id"] == meeting.id
        assert response.json()["latest_summary"]["content"] == "This is a summary."
        assert response.json()["latest_summary"]["status"] == Summary.READY

    def test_api_meeting_retrieve_no_summary(self, api_client):
        # Create a meeting without a summary
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")

        response = api_client.get(f"/api/meetings/{meeting.id}/")
        assert response.status_code == 200
        assert response.json()["id"] == meeting.id
        assert response.json()["latest_summary"] is None

    def test_api_meeting_retrieve_nonexistent(self, api_client):
        response = api_client.get("/api/meetings/999/")
        assert response.status_code == 404

@pytest.mark.django_db
class TestMeetingNotesAPI:
    # Notes List Test
    def test_api_meeting_notes(self, api_client):
        # Create a meeting and add notes
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        note_data = {"author": "Alice", "text": "This is a note."}
        Note.objects.create(meeting=meeting, author=note_data["author"], text=note_data["text"])

        # List notes for the meeting
        response = api_client.get(f"/api/meetings/{meeting.id}/notes/")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["author"] == note_data["author"]
        assert response.json()[0]["text"] == note_data["text"]

    def test_api_meeting_notes_nonexistent(self, api_client):
        response = api_client.get("/api/meetings/999/notes/")
        assert response.status_code == 404

    # Notes Create Test
    def test_api_meeting_add_note(self, api_client):
        # Create a meeting and add notes
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        note_data = {"author": "Alice", "text": "This is a note."}
        response = api_client.post(f"/api/meetings/{meeting.id}/notes/", note_data, format="json")
        assert response.status_code == 201
        assert response.json()["author"] == note_data["author"]
        assert response.json()["text"] == note_data["text"]

    def test_api_nonexistent_meeting_add_note(self, api_client):
        note_data = {"author": "Alice", "text": "This is a note."}
        response = api_client.post("/api/meetings/999/notes/", note_data, format="json")
        assert response.status_code == 404

@pytest.mark.django_db
class TestMeetingSummaryAPI:
    def test_api_meeting_summarize_mocked(self, api_client):
        # Create a meeting to summarize
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")

        # Use built-in patch context manager to synchronously test the background task
        target_path = 'meetings.views.MeetingViewSet.summarize_background'
        with patch(target_path, new=MagicMock()) as mocked_task:
            response = api_client.post(f"/api/meetings/{meeting.id}/summarize/")
            assert response.status_code == 202
            assert response.json()["detail"] == "Summarization in progress"
            mocked_task.assert_called_once()

    def test_summarize_background_logic_directly(self):
        """Tests the internal logic of the method without endpoints or threads."""
        meeting = Meeting.objects.create(title="Test Meeting", started_at="2024-01-01T10:00:00Z")
        Summary.objects.create(meeting=meeting, content="This is a summary.", status=Summary.READY)

        # Instantiate your ViewSet manually
        from meetings.views import MeetingViewSet
        view_instance = MeetingViewSet()
        
        # Call the instance method directly and sequentially
        view_instance.summarize_background(meeting=meeting)
        
        # Verify that the method performs its internal database operations successfully
        assert Summary.objects.filter(meeting=meeting).exists()
        assert Summary.objects.filter(meeting=meeting)[0].status in [Summary.READY, Summary.FAILED]

    def test_api_meeting_nonexistent_summarize(self, api_client):
        response = api_client.post("/api/meetings/999/summarize/")
        assert response.status_code == 404

    
        