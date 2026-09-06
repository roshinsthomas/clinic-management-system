from rest_framework.permissions import BasePermission
from accounts.models import Staff

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_staff
        )


class IsPharmacist(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name='Pharmacist').exists()
        )
class IsAdminOrPharmacist(BasePermission):

    def has_permission(self, request, view):
        # User must first be authenticated.
        if not request.user.is_authenticated:
            return False

        # Check the role stored in the CMS Staff profile.
        try:
            return (
                request.user.staff.role in ["ADMIN", "PHARMACIST"]
                and request.user.staff.status
            )
        except Staff.DoesNotExist:
            return False