import pytest
from unittest.mock import MagicMock
from apps.projects.models import Project, ProjectMember
from apps.projects.permissions import IsProjectOwner, IsProjectMember
from apps.users.models import User


@pytest.mark.django_db
class TestProjectPermissions:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.owner = User.objects.create_user(
            email="perm_owner@example.com", username="perm_owner", password="Password123!"
        )
        self.member_user = User.objects.create_user(
            email="perm_member@example.com", username="perm_member", password="Password123!"
        )
        self.outsider = User.objects.create_user(
            email="perm_outsider@example.com", username="perm_outsider", password="Password123!"
        )
        self.project = Project.objects.create(name="Perm Project", owner=self.owner)
        self.project_member = ProjectMember.objects.create(
            project=self.project, user=self.member_user
        )

    def _mock_request(self, user):
        request = MagicMock()
        request.user = user
        return request

    def test_is_project_owner_with_project(self):
        permission = IsProjectOwner()
        owner_req = self._mock_request(self.owner)
        outsider_req = self._mock_request(self.outsider)

        assert permission.has_object_permission(owner_req, None, self.project) is True
        assert permission.has_object_permission(outsider_req, None, self.project) is False

    def test_is_project_owner_with_project_member(self):
        permission = IsProjectOwner()
        owner_req = self._mock_request(self.owner)
        member_req = self._mock_request(self.member_user)

        assert permission.has_object_permission(owner_req, None, self.project_member) is True
        assert permission.has_object_permission(member_req, None, self.project_member) is False

    def test_is_project_owner_with_unsupported_object(self):
        permission = IsProjectOwner()
        req = self._mock_request(self.owner)
        assert permission.has_object_permission(req, None, object()) is False

    def test_is_project_member_with_project(self):
        permission = IsProjectMember()
        owner_req = self._mock_request(self.owner)
        member_req = self._mock_request(self.member_user)
        outsider_req = self._mock_request(self.outsider)

        # Owner is considered member (via auto-membership or repo check)
        ProjectMember.objects.create(project=self.project, user=self.owner)
        assert permission.has_object_permission(owner_req, None, self.project) is True
        assert permission.has_object_permission(member_req, None, self.project) is True
        assert permission.has_object_permission(outsider_req, None, self.project) is False

    def test_is_project_member_with_project_member(self):
        permission = IsProjectMember()
        member_req = self._mock_request(self.member_user)
        outsider_req = self._mock_request(self.outsider)

        assert permission.has_object_permission(member_req, None, self.project_member) is True
        assert permission.has_object_permission(outsider_req, None, self.project_member) is False

    def test_is_project_member_with_unsupported_object(self):
        permission = IsProjectMember()
        req = self._mock_request(self.owner)
        assert permission.has_object_permission(req, None, object()) is False
