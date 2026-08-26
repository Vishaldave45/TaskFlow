from typing import Optional
from django.db.models import QuerySet

from apps.tasks.models import Task
from apps.users.models import User
from .models import Comment


class CommentRepository:
    def create(self, *, task: Task, author: User, content: str) -> Comment:
        return Comment.objects.create(
            task=task,
            author=author,
            content=content,
        )

    def get_by_id(self, comment_id: int) -> Optional[Comment]:
        try:
            return Comment.objects.select_related("author", "task", "task__project").get(id=comment_id)
        except Comment.DoesNotExist:
            return None

    def list_for_task(self, task_id: int) -> QuerySet[Comment]:
        return Comment.objects.filter(task_id=task_id).select_related("author").order_by("created_at")

    def update(self, comment: Comment, *, content: str) -> Comment:
        comment.content = content
        comment.save(update_fields=["content", "updated_at"])
        return comment

    def delete(self, comment: Comment) -> None:
        comment.delete()
