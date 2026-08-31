from rest_framework import permissions

class IsProjectMemberForTask(permissions.BasePermission):
    """
    Object-level permission for tasks:
    - View/Edit: Allowed for project owner and project collaborators.
    - Delete: Allowed only for project owner or the creator of the task.
    """

    def has_object_permission(self, request, view, obj):
        is_owner = obj.project.owner == request.user
        is_member = obj.project.members.filter(user=request.user).exists()

        if not (is_owner or is_member):
            return False

        if request.method in permissions.SAFE_METHODS or request.method in ['PUT', 'PATCH']:
            return True

        if request.method == 'DELETE':
            return is_owner or (obj.creator == request.user)

        return False
