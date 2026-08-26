import pytest
from rest_framework.exceptions import ValidationError
from apps.users.models import User
from apps.projects.models import Project, ProjectMember
from apps.projects.repositories import ProjectRepository
from apps.projects.services import ProjectService


@pytest.mark.django_db
class TestProjectRepository:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.member = User.objects.create_user(
            email="member@example.com", username="member", password="password123"
        )
        self.other_user = User.objects.create_user(
            email="other@example.com", username="other", password="password123"
        )
        self.repo = ProjectRepository()

    def test_create_and_get_by_id(self):
        project = self.repo.create(name="Project A", description="Desc", owner=self.owner)
        assert project.id is not None
        assert project.name == "Project A"

        fetched = self.repo.get_by_id(project.id)
        assert fetched is not None
        assert fetched.owner == self.owner

    def test_list_for_user(self):
        proj1 = self.repo.create(name="Owned Project", description="", owner=self.owner)
        proj2 = self.repo.create(name="Member Project", description="", owner=self.other_user)
        self.repo.add_member(project=proj2, user=self.owner)

        proj3 = self.repo.create(name="Unrelated Project", description="", owner=self.other_user)

        user_projects = list(self.repo.list_for_user(self.owner))
        assert proj1 in user_projects
        assert proj2 in user_projects
        assert proj3 not in user_projects

    def test_membership_methods(self):
        project = self.repo.create(name="Team Project", description="", owner=self.owner)
        assert self.repo.is_owner(project, self.owner) is True
        assert self.repo.is_owner(project, self.member) is False
        assert self.repo.is_member(project, self.owner) is True
        assert self.repo.is_member(project, self.member) is False

        member_obj = self.repo.add_member(project, self.member)
        assert member_obj.id is not None
        assert self.repo.is_member(project, self.member) is True

        members = list(self.repo.list_members(project))
        assert member_obj in members

        self.repo.remove_member(project, self.member)
        assert self.repo.is_member(project, self.member) is False


@pytest.mark.django_db
class TestProjectService:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.owner = User.objects.create_user(
            email="service_owner@example.com", username="srv_owner", password="password123"
        )
        self.member = User.objects.create_user(
            email="service_member@example.com", username="srv_member", password="password123"
        )
        self.service = ProjectService()

    def test_create_project_auto_adds_owner_as_member(self):
        project = self.service.create_project(
            name="Alpha", description="Test Project", owner=self.owner
        )

        assert project.id is not None
        assert project.owner == self.owner

        # Verify owner is automatically in ProjectMember
        members = list(self.service.list_members(project))
        assert len(members) == 1
        assert members[0].user == self.owner

    def test_add_member_duplicate_raises_validation_error(self):
        project = self.service.create_project(name="Beta", owner=self.owner)

        # Owner is already a member
        with pytest.raises(ValidationError):
            self.service.add_member(project=project, user=self.owner)

        # Add member once
        self.service.add_member(project=project, user=self.member)

        # Add member second time -> raises
        with pytest.raises(ValidationError):
            self.service.add_member(project=project, user=self.member)

    def test_remove_member_owner_raises_validation_error(self):
        project = self.service.create_project(name="Gamma", owner=self.owner)

        with pytest.raises(ValidationError):
            self.service.remove_member(project=project, user=self.owner)

    def test_update_and_delete_project(self):
        project = self.service.create_project(name="Delta", description="Old", owner=self.owner)
        updated = self.service.update_project(project=project, name="Delta Updated", description="New")
        assert updated.name == "Delta Updated"
        assert updated.description == "New"

        self.service.delete_project(project=updated)
        assert Project.objects.filter(id=project.id).exists() is False
