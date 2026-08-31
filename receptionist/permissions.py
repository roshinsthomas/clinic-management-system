from rest_framework.permissions import BasePermission


class IsReceptionist(BasePermission):
    """
    Allows access only to authenticated users
    whose Staff role is RECEPTIONIST.
    """

    message = "Only receptionists are allowed to access this API."

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        try:
            staff = request.user.staff
        except AttributeError:
            return False

        return staff.role == "RECEPTIONIST"