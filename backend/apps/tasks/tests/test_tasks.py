import pytest
from rest_framework.test import APIClient
from apps.projects.services import ProjectService
from apps.users.models import User
from apps.tasks.models import TaskPriority, TaskStatus
from apps.tasks.services import TaskService


@pytest.mark.django_db
class TestTaskAPIEndpoints:
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
            name="TaskFlow Backend", owner=self.owner
        )
        self.project_service.add_member(project=self.project, user=self.member)
        self.task_service = TaskService()
        self.client = APIClient()

    def test_create_task_success(self):
        self.client.force_authenticate(user=self.member)
        payload = {
            "title": "Build Auth Layer",
            "description": "Implement JWT and token blacklist",
            "priority": "HIGH",
            "assignee_id": self.member.id,
            "due_date": "2026-12-31",
        }

        response = self.client.post(
            f"/api/v1/projects/{self.project.id}/tasks/", payload, format="json"
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Build Auth Layer"
        assert data["status"] == "TODO"
        assert data["priority"] == "HIGH"
        assert data["creator"]["id"] == self.member.id
        assert data["assignee"]["id"] == self.member.id
        assert data["project_id"] == self.project.id

    def test_create_task_non_member_forbidden(self):
        self.client.force_authenticate(user=self.outsider)
        payload = {"title": "Intruder Task"}

        response = self.client.post(
            f"/api/v1/projects/{self.project.id}/tasks/", payload, format="json"
        )

        assert response.status_code == 403

    def test_create_task_invalid_assignee_rejected(self):
        self.client.force_authenticate(user=self.owner)
        payload = {
            "title": "Invalid Task",
            "assignee_id": self.outsider.id,
        }

        response = self.client.post(
            f"/api/v1/projects/{self.project.id}/tasks/", payload, format="json"
        )

        assert response.status_code == 400
        assert "assignee" in response.json().get("error", {}).get("details", {})

    def test_list_and_filter_tasks(self):
        # Create a few tasks with different statuses and priorities
        t1 = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Task 1", "status": TaskStatus.TODO, "priority": TaskPriority.LOW},
        )
        t2 = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Task 2", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH},
        )
        t3 = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Task 3", "status": TaskStatus.DONE, "priority": TaskPriority.LOW},
        )

        self.client.force_authenticate(user=self.member)

        # Unfiltered list (paginated response)
        resp = self.client.get(f"/api/v1/projects/{self.project.id}/tasks/")
        assert resp.status_code == 200
        results = resp.json()["results"] if "results" in resp.json() else resp.json()
        assert len(results) == 3

        # Filter by status=DONE and priority=HIGH
        resp_filtered = self.client.get(
            f"/api/v1/projects/{self.project.id}/tasks/?status=DONE&priority=HIGH"
        )
        assert resp_filtered.status_code == 200
        filtered_results = (
            resp_filtered.json()["results"]
            if "results" in resp_filtered.json()
            else resp_filtered.json()
        )
        assert len(filtered_results) == 1
        assert filtered_results[0]["id"] == t2.id

    def test_get_task_detail(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Inspect Me"},
        )

        # Member access -> 200
        self.client.force_authenticate(user=self.member)
        resp = self.client.get(f"/api/v1/tasks/{task.id}/")
        assert resp.status_code == 200
        assert resp.json()["title"] == "Inspect Me"

        # Outsider access -> 403
        self.client.force_authenticate(user=self.outsider)
        resp = self.client.get(f"/api/v1/tasks/{task.id}/")
        assert resp.status_code == 403

    def test_update_task(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Task to update", "status": TaskStatus.TODO},
        )

        self.client.force_authenticate(user=self.member)
        resp = self.client.patch(
            f"/api/v1/tasks/{task.id}/",
            {"status": "IN_PROGRESS", "priority": "HIGH"},
            format="json",
        )

        assert resp.status_code == 200
        assert resp.json()["status"] == "IN_PROGRESS"
        assert resp.json()["priority"] == "HIGH"

    def test_delete_task(self):
        task = self.task_service.create_task(
            project=self.project,
            creator=self.owner,
            data={"title": "Task to delete"},
        )

        # Outsider delete -> 403
        self.client.force_authenticate(user=self.outsider)
        assert self.client.delete(f"/api/v1/tasks/{task.id}/").status_code == 403

        # Member delete -> 204
        self.client.force_authenticate(user=self.member)
        assert self.client.delete(f"/api/v1/tasks/{task.id}/").status_code == 204
