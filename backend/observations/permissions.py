from rest_framework import permissions

class IsAdminOrResearcher(permissions.BasePermission):
    """
    Custom permission to only allow admin or researcher users to validate observations.
    """

    def has_permission(self, request, view):
        user = request.user
        if user and user.is_authenticated:
            return user.is_staff or getattr(user, 'role', None) == 'researcher'
        return False
