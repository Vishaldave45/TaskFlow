import pytest
from rest_framework.test import APIClient
from apps.users.models import User
from apps.projects.services import ProjectService


@pytest.mark.django_db
class TestProjectEndpoints:
    @pytest.fixture(autouse=True)
    def setup_users(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.member = User.objects.create_user(
            email="member@example.com", username="member", password="password123"
        )
        self.stranger = User.objects.create_user(
            email="stranger@example.com", username="stranger", password="password123"
        )
        self.client = APIClient()
        self.service = ProjectService()

    def test_create_project_authenticated(self):
        self.client.force_authenticate(user=self.owner)
        payload = {"name": "TaskFlow Core", "description": "Backend services"}

        response = self.client.post("/api/v1/projects/", payload, format="json")

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "TaskFlow Core"
        assert data["description"] == "Backend services"
        assert data["owner"]["id"] == self.owner.id
        assert data["members_count"] == 1

    def test_create_project_unauthenticated(self):
        payload = {"name": "TaskFlow Core"}
        response = self.client.post("/api/v1/projects/", payload, format="json")
        assert response.status_code == 401

    def test_list_projects_isolation(self):
        proj1 = self.service.create_project(name="Owner Project", owner=self.owner)
        proj2 = self.service.create_project(name="Other Project", owner=self.stranger)
        self.service.add_member(project=proj2, user=self.owner)
        proj3 = self.service.create_project(name="Secret Project", owner=self.stranger)

        self.client.force_authenticate(user=self.owner)
        response = self.client.get("/api/v1/projects/")

        assert response.status_code == 200
        data = response.json()
        project_ids = [p["id"] for p in data]
        assert proj1.id in project_ids
        assert proj2.id in project_ids
        assert proj3.id not in project_ids

    def test_get_project_detail_permissions(self):
        project = self.service.create_project(name="Project X", owner=self.owner)
        self.service.add_member(project=project, user=self.member)

        # Owner access -> 200
        self.client.force_authenticate(user=self.owner)
        assert self.client.get(f"/api/v1/projects/{project.id}/").status_code == 200

        # Member access -> 200
        self.client.force_authenticate(user=self.member)
        assert self.client.get(f"/api/v1/projects/{project.id}/").status_code == 200

        # Stranger access -> 403
        self.client.force_authenticate(user=self.stranger)
        assert self.client.get(f"/api/v1/projects/{project.id}/").status_code == 403

    def test_update_project_permissions(self):
        project = self.service.create_project(name="Project Y", owner=self.owner)
        self.service.add_member(project=project, user=self.member)

        # Member attempts update -> 403
        self.client.force_authenticate(user=self.member)
        resp = self.client.patch(
            f"/api/v1/projects/{project.id}/",
            {"name": "Hacked Name"},
            format="json",
        )
        assert resp.status_code == 403

        # Owner attempts update -> 200
        self.client.force_authenticate(user=self.owner)
        resp = self.client.patch(
            f"/api/v1/projects/{project.id}/",
            {"name": "Updated Name"},
            format="json",
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    def test_delete_project_permissions(self):
        project = self.service.create_project(name="Project Z", owner=self.owner)
        self.service.add_member(project=project, user=self.member)

        # Member attempts delete -> 403
        self.client.force_authenticate(user=self.member)
        assert self.client.delete(f"/api/v1/projects/{project.id}/").status_code == 403

        # Owner deletes -> 204
        self.client.force_authenticate(user=self.owner)
        assert self.client.delete(f"/api/v1/projects/{project.id}/").status_code == 204


@pytest.mark.django_db
class TestProjectMemberEndpoints:
    @pytest.fixture(autouse=True)
    def setup_project(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.member = User.objects.create_user(
            email="member@example.com", username="member", password="password123"
        )
        self.candidate = User.objects.create_user(
            email="candidate@example.com", username="candidate", password="password123"
        )
        self.stranger = User.objects.create_user(
            email="stranger@example.com", username="stranger", password="password123"
        )
        self.service = ProjectService()
        self.project = self.service.create_project(name="Membership App", owner=self.owner)
        self.client = APIClient()

    def test_list_members_permission(self):
        self.service.add_member(project=self.project, user=self.member)

        # Member can view member list -> 200
        self.client.force_authenticate(user=self.member)
        resp = self.client.get(f"/api/v1/projects/{self.project.id}/members/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2  # owner + member

        # Stranger cannot view member list -> 403
        self.client.force_authenticate(user=self.stranger)
        resp = self.client.get(f"/api/v1/projects/{self.project.id}/members/")
        assert resp.status_code == 403

    def test_add_member_by_owner(self):
        self.client.force_authenticate(user=self.owner)
        resp = self.client.post(
            f"/api/v1/projects/{self.project.id}/members/",
            {"email": "candidate@example.com"},
            format="json",
        )

        assert resp.status_code == 201
        assert resp.json()["user"]["email"] == "candidate@example.com"

    def test_add_member_by_non_owner_forbidden(self):
        self.service.add_member(project=self.project, user=self.member)

        self.client.force_authenticate(user=self.member)
        resp = self.client.post(
            f"/api/v1/projects/{self.project.id}/members/",
            {"email": "candidate@example.com"},
            format="json",
        )

        assert resp.status_code == 403

    def test_add_duplicate_member_rejected(self):
        self.service.add_member(project=self.project, user=self.member)

        self.client.force_authenticate(user=self.owner)
        resp = self.client.post(
            f"/api/v1/projects/{self.project.id}/members/",
            {"email": "member@example.com"},
            format="json",
        )

        assert resp.status_code == 400

    def test_remove_member_by_owner(self):
        self.service.add_member(project=self.project, user=self.member)

        self.client.force_authenticate(user=self.owner)
        resp = self.client.delete(
            f"/api/v1/projects/{self.project.id}/members/{self.member.id}/"
        )
        assert resp.status_code == 204

    def test_remove_owner_from_members_rejected(self):
        self.client.force_authenticate(user=self.owner)
        resp = self.client.delete(
            f"/api/v1/projects/{self.project.id}/members/{self.owner.id}/"
        )
        assert resp.status_code == 400

    def test_member_can_leave_project(self):
        self.service.add_member(project=self.project, user=self.member)

        self.client.force_authenticate(user=self.member)
        resp = self.client.delete(
            f"/api/v1/projects/{self.project.id}/members/{self.member.id}/"
        )
        assert resp.status_code == 204
