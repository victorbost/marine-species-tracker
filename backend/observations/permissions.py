from rest_framework import permissions


class IsAdminOrResearcher(permissions.BasePermission):
    """
    Custom permission to only allow admin or researcher users
    to validate observations.
    """

    def has_permission(self, request, view):
        user = request.user
        if user and user.is_authenticated:
            return user.is_staff or getattr(user, "role", None) == "researcher"
        return False


class IsOwnerOrAdminOrResearcher(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object, or admin/researcher users,
    to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the observation,
        # or to admin/researcher users.
        user = request.user
        return (
            obj.user == user
            or user.is_staff
            or getattr(user, "role", None) == "researcher"
        )
