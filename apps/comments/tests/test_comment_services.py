import pytest
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.comments.models import Comment
from apps.comments.services import CommentService
from apps.projects.services import ProjectService
from apps.tasks.models import TaskPriority, TaskStatus
from apps.tasks.services import TaskService
from apps.users.models import User


@pytest.mark.django_db
class TestCommentService:
    @pytest.fixture(autouse=True)
    def setup(self):
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
                "title": "Review Comments Feature",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.MEDIUM,
            },
        )
        self.comment_service = CommentService()

    def test_create_comment_success(self):
        comment = self.comment_service.create_comment(
            task=self.task,
            author=self.member,
            content="Looking good!",
        )

        assert comment.id is not None
        assert comment.content == "Looking good!"
        assert comment.author == self.member
        assert comment.task == self.task

    def test_create_comment_empty_content_fails(self):
        with pytest.raises(ValidationError):
            self.comment_service.create_comment(
                task=self.task,
                author=self.member,
                content="   ",
            )

    def test_create_comment_non_member_fails(self):
        with pytest.raises(PermissionDenied):
            self.comment_service.create_comment(
                task=self.task,
                author=self.outsider,
                content="I shouldn't be here",
            )

    def test_update_comment_by_author_success(self):
        comment = self.comment_service.create_comment(
            task=self.task,
            author=self.member,
            content="Original comment",
        )

        updated = self.comment_service.update_comment(
            comment=comment,
            user=self.member,
            content="Updated comment",
        )

        assert updated.content == "Updated comment"

    def test_update_comment_by_non_author_fails(self):
        comment = self.comment_service.create_comment(
            task=self.task,
            author=self.member,
            content="Original comment",
        )

        with pytest.raises(PermissionDenied):
            self.comment_service.update_comment(
                comment=comment,
                user=self.owner,
                content="Trying to edit someone else's comment",
            )

    def test_delete_comment_by_author(self):
        comment = self.comment_service.create_comment(
            task=self.task,
            author=self.member,
            content="To be deleted",
        )

        self.comment_service.delete_comment(comment=comment, user=self.member)
        assert Comment.objects.filter(id=comment.id).count() == 0

    def test_delete_comment_by_project_owner(self):
        comment = self.comment_service.create_comment(
            task=self.task,
            author=self.member,
            content="Moderated content",
        )

        self.comment_service.delete_comment(comment=comment, user=self.owner)
        assert Comment.objects.filter(id=comment.id).count() == 0

    def test_delete_comment_by_outsider_fails(self):
        comment = self.comment_service.create_comment(
            task=self.task,
            author=self.member,
            content="Cannot delete me",
        )

        with pytest.raises(PermissionDenied):
            self.comment_service.delete_comment(comment=comment, user=self.outsider)
