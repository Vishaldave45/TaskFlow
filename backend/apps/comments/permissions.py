from rest_framework import permissions

class IsCommentAuthorOrProjectOwner(permissions.BasePermission):
    """
    Object-level permission for comments:
    - View: Allowed for any project member/owner.
    - Update (PATCH/PUT): Allowed ONLY for the comment author.
    - Delete: Allowed for comment author OR project owner (moderation).
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        project = obj.task.project
        is_owner = project.owner == user
        is_member = project.members.filter(user=user).exists()

        if not (is_owner or is_member):
            return False

        # SAFE_METHODS (GET, HEAD, OPTIONS): all project members can read
        if request.method in permissions.SAFE_METHODS:
            return True

        # UPDATE (PUT, PATCH): Author only
        if request.method in ['PUT', 'PATCH']:
            return obj.author == user

        # DELETE: Author or Project Owner
        if request.method == 'DELETE':
            return (obj.author == user) or is_owner

        return False
