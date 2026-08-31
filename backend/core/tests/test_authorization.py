import pytest
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.projects.models import Project, ProjectMember
from apps.tasks.models import Task
from apps.comments.models import Comment

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def owner(db):
    return User.objects.create_user(username="owner", email="owner@test.com", password="password123")

@pytest.fixture
def member(db):
    return User.objects.create_user(username="member", email="member@test.com", password="password123")

@pytest.fixture
def stranger(db):
    return User.objects.create_user(username="stranger", email="stranger@test.com", password="password123")

@pytest.fixture
def project(db, owner, member):
    p = Project.objects.create(name="Alpha Project", description="Test Workspace", owner=owner)
    ProjectMember.objects.create(project=p, user=owner, role="OWNER")
    ProjectMember.objects.create(project=p, user=member, role="COLLABORATOR")
    return p

@pytest.fixture
def task(db, project, owner):
    return Task.objects.create(
        project=project,
        title="Initial Task",
        description="Task scope",
        creator=owner,
        status="TODO",
        priority="HIGH"
    )

@pytest.mark.django_db
class TestAuthenticationNegativePaths:
    def test_anonymous_access_returns_401(self, api_client, project, task):
        assert api_client.get("/api/v1/projects/").status_code == status.HTTP_401_UNAUTHORIZED
        assert api_client.get(f"/api/v1/projects/{project.id}/").status_code == status.HTTP_401_UNAUTHORIZED
        assert api_client.get(f"/api/v1/tasks/{task.id}/").status_code == status.HTTP_401_UNAUTHORIZED
        assert api_client.get(f"/api/v1/tasks/{task.id}/comments/").status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
class TestProjectAuthorization:
    def test_stranger_cannot_access_project(self, api_client, stranger, project):
        api_client.force_authenticate(user=stranger)
        # Should not be in project list
        res = api_client.get("/api/v1/projects/")
        assert res.status_code == status.HTTP_200_OK
        assert len(res.data.get('results', res.data)) == 0

        # Direct access is forbidden / not found
        res_detail = api_client.get(f"/api/v1/projects/{project.id}/")
        assert res_detail.status_code == status.HTTP_404_NOT_FOUND

    def test_member_cannot_delete_or_update_project(self, api_client, member, project):
        api_client.force_authenticate(user=member)
        # Update forbidden
        res = api_client.patch(f"/api/v1/projects/{project.id}/", {"name": "Hacked"})
        assert res.status_code == status.HTTP_403_FORBIDDEN

        # Delete forbidden
        res_del = api_client.delete(f"/api/v1/projects/{project.id}/")
        assert res_del.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_add_duplicate_member(self, api_client, owner, member, project):
        api_client.force_authenticate(user=owner)
        res = api_client.post(f"/api/v1/projects/{project.id}/members/", {"email": member.email})
        assert res.status_code == status.HTTP_409_CONFLICT

    def test_cannot_remove_project_owner(self, api_client, owner, project):
        api_client.force_authenticate(user=owner)
        res = api_client.delete(f"/api/v1/projects/{project.id}/members/{owner.id}/")
        assert res.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
class TestTaskAuthorizationAndIntegrity:
    def test_cannot_assign_task_to_non_member(self, api_client, owner, stranger, project):
        api_client.force_authenticate(user=owner)
        res = api_client.post(f"/api/v1/projects/{project.id}/tasks/", {
            "title": "Invalid Assignee Task",
            "assignee_id": stranger.id
        })
        assert res.status_code == status.HTTP_400_BAD_REQUEST

    def test_stranger_cannot_view_or_modify_task(self, api_client, stranger, task):
        api_client.force_authenticate(user=stranger)
        assert api_client.get(f"/api/v1/tasks/{task.id}/").status_code == status.HTTP_403_FORBIDDEN
        assert api_client.patch(f"/api/v1/tasks/{task.id}/", {"title": "Changed"}).status_code == status.HTTP_403_FORBIDDEN
        assert api_client.delete(f"/api/v1/tasks/{task.id}/").status_code == status.HTTP_403_FORBIDDEN

    def test_member_cannot_delete_owner_task(self, api_client, member, task):
        api_client.force_authenticate(user=member)
        # Member can update status
        res_update = api_client.patch(f"/api/v1/tasks/{task.id}/", {"status": "IN_PROGRESS"})
        assert res_update.status_code == status.HTTP_200_OK

        # But member cannot delete task created by owner
        res_del = api_client.delete(f"/api/v1/tasks/{task.id}/")
        assert res_del.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestCommentOwnership:
    def test_stranger_cannot_post_or_read_comments(self, api_client, stranger, task):
        api_client.force_authenticate(user=stranger)
        assert api_client.get(f"/api/v1/tasks/{task.id}/comments/").status_code == status.HTTP_403_FORBIDDEN
        assert api_client.post(f"/api/v1/tasks/{task.id}/comments/", {"content": "Spam"}).status_code == status.HTTP_403_FORBIDDEN

    def test_member_cannot_edit_another_users_comment(self, api_client, owner, member, task):
        # Owner creates comment
        c = Comment.objects.create(task=task, author=owner, content="Owner's Note")

        # Member tries to edit owner's comment -> 403
        api_client.force_authenticate(user=member)
        res = api_client.patch(f"/api/v1/comments/{c.id}/", {"content": "Tampered"})
        assert res.status_code == status.HTTP_403_FORBIDDEN

        # Author can edit their own comment -> 200
        api_client.force_authenticate(user=owner)
        res_author = api_client.patch(f"/api/v1/comments/{c.id}/", {"content": "Updated Note"})
        assert res_author.status_code == status.HTTP_200_OK
        assert res_author.data['content'] == "Updated Note"

    def test_owner_can_delete_member_comment_for_moderation(self, api_client, owner, member, task):
        # Member creates comment
        c = Comment.objects.create(task=task, author=member, content="Member's Note")

        # Owner deletes it -> 204
        api_client.force_authenticate(user=owner)
        res = api_client.delete(f"/api/v1/comments/{c.id}/")
        assert res.status_code == status.HTTP_204_NO_CONTENT
