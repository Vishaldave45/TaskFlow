from rest_framework.permissions import BasePermission
from .models import Comment


class IsCommentAuthor(BasePermission):
    """
    Ensures that only the author of a comment can update or delete it.
    Project owners are also allowed to delete comments on tasks within their project.
    """

    def has_object_permission(self, request, view, obj: Comment) -> bool:
        if request.method in ["DELETE"]:
            return obj.author_id == request.user.id or obj.task.project.owner_id == request.user.id
        return obj.author_id == request.user.id
