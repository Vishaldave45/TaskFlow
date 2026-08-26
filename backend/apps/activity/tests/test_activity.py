import pytest
from rest_framework.test import APIClient

from apps.projects.services import ProjectService
from apps.tasks.models import TaskPriority, TaskStatus
from apps.tasks.services import TaskService
from apps.users.models import User


@pytest.mark.django_db
class TestActivityAPIEndpoints:
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
            name="Activity API Project", owner=self.owner
        )
        self.project_service.add_member(project=self.project, user=self.member)

        self.task_service = TaskService()
        self.task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={
                "title": "Task with Activity Logs",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.MEDIUM,
            },
        )
        self.client = APIClient()

    def test_list_activity_logs_member_success(self):
        # Generate activity logs by updating the task
        self.task_service.update_task(
            task=self.task,
            data={"status": TaskStatus.IN_PROGRESS},
            user=self.member,
        )

        self.client.force_authenticate(user=self.member)
        response = self.client.get(f"/api/v1/tasks/{self.task.id}/activity/")

        assert response.status_code == 200
        data = response.json()
        results = data.get("results", data)
        # Should have TASK_CREATED and STATUS_CHANGED logs
        assert len(results) >= 2
        actions = [log["action"] for log in results]
        assert "STATUS_CHANGED" in actions
        assert "TASK_CREATED" in actions

    def test_list_activity_logs_unauthenticated(self):
        response = self.client.get(f"/api/v1/tasks/{self.task.id}/activity/")
        assert response.status_code == 401

    def test_list_activity_logs_outsider_forbidden(self):
        self.client.force_authenticate(user=self.outsider)
        response = self.client.get(f"/api/v1/tasks/{self.task.id}/activity/")
        assert response.status_code == 403

    def test_list_activity_logs_task_not_found(self):
        self.client.force_authenticate(user=self.member)
        response = self.client.get("/api/v1/tasks/999999/activity/")
        assert response.status_code == 404
