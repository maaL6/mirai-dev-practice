from rest_framework.permissions import BasePermission

from .models import User


class IsAdmin(BasePermission):
    """Allow access only to users with the *admin* role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class IsManagerOrAdmin(BasePermission):
    """Allow access to users with the *admin* or *manager* role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in {User.Role.ADMIN, User.Role.MANAGER}
        )


def is_owner_or_assignee(user, obj):
    """Return ``True`` if *user* is the owner or assignee of *obj*.

    The helper inspects common attribute names used across modules:
    ``owner``, ``created_by``, ``assignee``, ``assigned_to``.
    """
    for attr in ("owner", "created_by", "assignee", "assigned_to"):
        value = getattr(obj, attr, None)
        if value is not None and value == user:
            return True
    return False
