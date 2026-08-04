from rest_framework import permissions


class IsCustomerOwnerOrManagerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object, managers, or admins to view/edit it.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role in ["admin", "manager"]:
            return True

        # Member: must be the owner of the customer (or contact's customer owner)
        if hasattr(obj, "owner"):
            return obj.owner == request.user
        elif hasattr(obj, "customer"):
            return obj.customer.owner == request.user

        return False
