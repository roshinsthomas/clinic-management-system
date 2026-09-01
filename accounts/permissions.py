from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return request.user.staff.role == 'ADMIN'
        except:
            return False


class IsDoctor(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return request.user.staff.role == 'DOCTOR'
        except:
            return False


class IsReceptionist(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return request.user.staff.role == 'RECEPTIONIST'
        except:
            return False


class IsPharmacist(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return request.user.staff.role == 'PHARMACIST'
        except:
            return False


class IsLabTechnician(BasePermission):

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return request.user.staff.role == 'LAB_TECHNICIAN'
        except:
            return False