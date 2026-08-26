from typing import Optional
from django.db import transaction
from django.db.models import QuerySet
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.activity.models import ActivityAction
from apps.activity.services import ActivityService
from apps.projects.repositories import ProjectRepository
from apps.tasks.models import Task
from apps.users.models import User
from .models import Comment
from .repositories import CommentRepository


class CommentService:
    def __init__(
        self,
        comment_repository: CommentRepository | None = None,
        project_repository: ProjectRepository | None = None,
    ):
        self.comment_repository = comment_repository or CommentRepository()
        self.project_repository = project_repository or ProjectRepository()

    @transaction.atomic
    def create_comment(self, *, task: Task, author: User, content: str) -> Comment:
        if not content or not content.strip():
            raise ValidationError({"content": "Comment content cannot be empty."})

        # Ensure user is member of project
        if not self.project_repository.is_member(task.project, author):
            raise PermissionDenied("You must be a member of the project to comment on this task.")

        comment = self.comment_repository.create(
            task=task,
            author=author,
            content=content.strip(),
        )

        ActivityService.log(
            task=task,
            user=author,
            action=ActivityAction.COMMENT_ADDED,
            details={"comment_id": comment.id},
        )

        return comment

    def get_comment(self, comment_id: int) -> Optional[Comment]:
        return self.comment_repository.get_by_id(comment_id)

    def list_comments_for_task(self, task_id: int) -> QuerySet[Comment]:
        return self.comment_repository.list_for_task(task_id)

    @transaction.atomic
    def update_comment(self, *, comment: Comment, user: User, content: str) -> Comment:
        if not content or not content.strip():
            raise ValidationError({"content": "Comment content cannot be empty."})

        if comment.author_id != user.id:
            raise PermissionDenied("You can only edit your own comments.")

        return self.comment_repository.update(comment, content=content.strip())

    @transaction.atomic
    def delete_comment(self, *, comment: Comment, user: User) -> None:
        if comment.author_id != user.id and comment.task.project.owner_id != user.id:
            raise PermissionDenied("You can only delete your own comments or comments within your project.")

        self.comment_repository.delete(comment)
