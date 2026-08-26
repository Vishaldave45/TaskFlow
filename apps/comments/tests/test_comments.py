import pytest
from rest_framework.test import APIClient

from apps.comments.services import CommentService
from apps.projects.services import ProjectService
from apps.tasks.models import TaskPriority, TaskStatus
from apps.tasks.services import TaskService
from apps.users.models import User


@pytest.mark.django_db
class TestCommentAPIEndpoints:
    @pytest.fixture(autouse=True)
    def setup_entities(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.member = User.objects.create_user(
            email="member@example.com", username="member", password="password123"
        )
        self.outsider = User.objects.create_user(
            email="outsider@example.com", username="outsider", password="password123"
        )
        self.project_service = ProjectService()
        self.project = self.project_service.create_project(
            name="Project With Comments", owner=self.owner
        )
        self.project_service.add_member(project=self.project, user=self.member)

        self.task_service = TaskService()
        self.task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={
                "title": "Task 1",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.MEDIUM,
            },
        )
        self.comment_service = CommentService()
        self.client = APIClient()

    def test_create_comment_success(self):
        self.client.force_authenticate(user=self.member)
        payload = {"content": "Great progress on this task!"}

        response = self.client.post(
            f"/api/v1/tasks/{self.task.id}/comments/", payload, format="json"
        )

        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "Great progress on this task!"
        assert data["author"]["id"] == self.member.id
        assert data["task"] == self.task.id

    def test_create_comment_unauthenticated(self):
        payload = {"content": "No auth"}
        response = self.client.post(
            f"/api/v1/tasks/{self.task.id}/comments/", payload, format="json"
        )
        assert response.status_code == 401

    def test_create_comment_outsider_forbidden(self):
        self.client.force_authenticate(user=self.outsider)
        payload = {"content": "Intruder comment"}

        response = self.client.post(
            f"/api/v1/tasks/{self.task.id}/comments/", payload, format="json"
        )
        assert response.status_code == 403

    def test_list_comments_for_task(self):
        self.comment_service.create_comment(
            task=self.task, author=self.owner, content="First comment"
        )
        self.comment_service.create_comment(
            task=self.task, author=self.member, content="Second comment"
        )

        self.client.force_authenticate(user=self.member)
        response = self.client.get(f"/api/v1/tasks/{self.task.id}/comments/")

        assert response.status_code == 200
        data = response.json()
        results = data.get("results", data)
        assert len(results) == 2

    def test_update_comment_author_only(self):
        comment = self.comment_service.create_comment(
            task=self.task, author=self.member, content="Initial comment"
        )

        # Other user trying to edit -> 403
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(
            f"/api/v1/comments/{comment.id}/",
            {"content": "Owner edited"},
            format="json",
        )
        assert response.status_code == 403

        # Author editing -> 200
        self.client.force_authenticate(user=self.member)
        response = self.client.patch(
            f"/api/v1/comments/{comment.id}/",
            {"content": "Author edited"},
            format="json",
        )
        assert response.status_code == 200
        assert response.json()["content"] == "Author edited"

        # Empty payload -> 400 Bad Request
        response = self.client.patch(
            f"/api/v1/comments/{comment.id}/",
            {},
            format="json",
        )
        assert response.status_code == 400

    def test_delete_comment_by_author(self):
        comment = self.comment_service.create_comment(
            task=self.task, author=self.member, content="Delete me"
        )

        self.client.force_authenticate(user=self.member)
        response = self.client.delete(f"/api/v1/comments/{comment.id}/")
        assert response.status_code == 204

    def test_delete_comment_by_project_owner(self):
        comment = self.comment_service.create_comment(
            task=self.task, author=self.member, content="Owner will delete this"
        )

        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(f"/api/v1/comments/{comment.id}/")
        assert response.status_code == 204
