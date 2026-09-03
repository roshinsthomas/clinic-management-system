from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Department, Staff, Medicine

from .serializers import (
    DepartmentSerializer,
    StaffSerializer,
    DoctorSerializer,
    LoginSerializer,
    MedicineSerializer,
)

from .permissions import IsAdmin, IsAdminOrReceptionist


# ============================================================
# DEPARTMENT MANAGEMENT
# ============================================================

class DepartmentListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [
                IsAuthenticated(),
                IsAdminOrReceptionist(),
            ]

        return [
            IsAuthenticated(),
            IsAdmin(),
        ]

    def get(self, request):
        try:
            departments = Department.objects.all()

            serializer = DepartmentSerializer(
                departments,
                many=True
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve departments."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        serializer = DepartmentSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                serializer.save()

            return Response(
                {
                    "message": "Department created successfully.",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Department could not be created. "
                        "Please try again."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# DEPARTMENT DETAIL
# ============================================================

class DepartmentDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get_object(self, pk):
        try:
            return Department.objects.get(pk=pk)
        except Department.DoesNotExist:
            return None

    def get(self, request, pk):
        department = self.get_object(pk)

        if not department:
            return Response(
                {
                    "detail": "Department not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            serializer = DepartmentSerializer(department)

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve department."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, pk):
        department = self.get_object(pk)

        if not department:
            return Response(
                {
                    "detail": "Department not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DepartmentSerializer(
            department,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                serializer.save()

            return Response(
                {
                    "message": "Department updated successfully.",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Department could not be updated. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        department = self.get_object(pk)

        if not department:
            return Response(
                {
                    "detail": "Department not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                department.delete()

            return Response(
                {
                    "message": "Department deleted successfully."
                },
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Department could not be deleted. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# STAFF MANAGEMENT
# ============================================================

class StaffListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get(self, request):
        try:
            staff = Staff.objects.exclude(
                role="ADMIN"
            ).select_related(
                "user",
                "department"
            )

            search = request.query_params.get(
                "search",
                ""
            ).strip()

            if search:
                staff = staff.filter(
                    Q(user__first_name__icontains=search)
                    |
                    Q(user__last_name__icontains=search)
                    |
                    Q(user__username__icontains=search)
                    |
                    Q(user__email__icontains=search)
                    |
                    Q(phone__icontains=search)
                    |
                    Q(role__icontains=search)
                    |
                    Q(
                        department__department_name__icontains=search
                    )
                )

            serializer = StaffSerializer(
                staff,
                many=True
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve staff records."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):

        if request.data.get("role") == "ADMIN":
            return Response(
                {
                    "role": (
                        "Administrator accounts cannot be created "
                        "through Staff Management."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = StaffSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                staff = serializer.save()

            return Response(
                {
                    "message": "Staff member created successfully.",
                    "data": StaffSerializer(staff).data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Staff member could not be created. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# STAFF DETAIL
# ============================================================

class StaffDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get_object(self, pk):
        try:
            return Staff.objects.exclude(
                role="ADMIN"
            ).select_related(
                "user",
                "department"
            ).get(pk=pk)

        except Staff.DoesNotExist:
            return None

    def get(self, request, pk):
        staff = self.get_object(pk)

        if not staff:
            return Response(
                {
                    "detail": "Staff member not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            serializer = StaffSerializer(staff)

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve staff member."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, pk):
        staff = self.get_object(pk)

        if not staff:
            return Response(
                {
                    "detail": "Staff member not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if request.data.get("role") == "ADMIN":
            return Response(
                {
                    "role": (
                        "Administrator accounts cannot be "
                        "assigned through Staff Management."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = StaffSerializer(
            staff,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                updated_staff = serializer.save()

            return Response(
                {
                    "message": "Staff member updated successfully.",
                    "data": StaffSerializer(updated_staff).data
                },
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Staff member could not be updated. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        staff = self.get_object(pk)

        if not staff:
            return Response(
                {
                    "detail": "Staff member not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                staff.delete()

            return Response(
                {
                    "message": "Staff member deleted successfully."
                },
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Staff member could not be deleted. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# DOCTOR MANAGEMENT
# ============================================================

class DoctorListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminOrReceptionist
    ]

    def get(self, request):
        try:
            doctors = Staff.objects.filter(
                role="DOCTOR"
            ).select_related(
                "user",
                "department"
            )

            search = request.query_params.get(
                "search",
                ""
            ).strip()

            if search:
                doctors = doctors.filter(
                    Q(user__first_name__icontains=search)
                    |
                    Q(user__last_name__icontains=search)
                    |
                    Q(user__username__icontains=search)
                    |
                    Q(user__email__icontains=search)
                    |
                    Q(phone__icontains=search)
                    |
                    Q(
                        department__department_name__icontains=search
                    )
                    |
                    Q(specialization__icontains=search)
                )

            serializer = DoctorSerializer(
                doctors,
                many=True
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve doctor records."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):

        serializer = DoctorSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                doctor = serializer.save()

            return Response(
                {
                    "message": "Doctor created successfully.",
                    "data": DoctorSerializer(doctor).data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Doctor could not be created. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# DOCTOR DETAIL
# ============================================================

class DoctorDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get_object(self, pk):
        try:
            return Staff.objects.select_related(
                "user",
                "department"
            ).get(
                pk=pk,
                role="DOCTOR"
            )

        except Staff.DoesNotExist:
            return None

    def get(self, request, pk):
        doctor = self.get_object(pk)

        if not doctor:
            return Response(
                {
                    "detail": "Doctor not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            serializer = DoctorSerializer(doctor)

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve doctor."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, pk):
        doctor = self.get_object(pk)

        if not doctor:
            return Response(
                {
                    "detail": "Doctor not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if "role" in request.data:
            if request.data.get("role") != "DOCTOR":
                return Response(
                    {
                        "role": "Doctor role cannot be changed."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = DoctorSerializer(
            doctor,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                updated_doctor = serializer.save()

            return Response(
                {
                    "message": "Doctor updated successfully.",
                    "data": DoctorSerializer(
                        updated_doctor
                    ).data
                },
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Doctor could not be updated. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        doctor = self.get_object(pk)

        if not doctor:
            return Response(
                {
                    "detail": "Doctor not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                doctor.delete()

            return Response(
                {
                    "message": "Doctor deleted successfully."
                },
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Doctor could not be deleted. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# MEDICINE MANAGEMENT
# ============================================================

class MedicineListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get(self, request):
        try:
            medicines = Medicine.objects.all()

            search = request.query_params.get(
                "search",
                ""
            ).strip()

            if search:
                medicines = medicines.filter(
                    Q(medicine_name__icontains=search)
                    |
                    Q(medicine_type__icontains=search)
                    |
                    Q(manufacturer__icontains=search)
                    |
                    Q(batch_number__icontains=search)
                )

            serializer = MedicineSerializer(
                medicines,
                many=True
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve medicine records."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):

        serializer = MedicineSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                medicine = serializer.save()

            return Response(
                {
                    "message": "Medicine created successfully.",
                    "data": MedicineSerializer(
                        medicine
                    ).data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Medicine could not be created. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# MEDICINE DETAIL
# ============================================================

class MedicineDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get_object(self, pk):
        try:
            return Medicine.objects.get(pk=pk)
        except Medicine.DoesNotExist:
            return None

    def get(self, request, pk):
        medicine = self.get_object(pk)

        if not medicine:
            return Response(
                {
                    "detail": "Medicine not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            serializer = MedicineSerializer(medicine)

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": "Unable to retrieve medicine."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, pk):
        medicine = self.get_object(pk)

        if not medicine:
            return Response(
                {
                    "detail": "Medicine not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicineSerializer(
            medicine,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                updated_medicine = serializer.save()

            return Response(
                {
                    "message": "Medicine updated successfully.",
                    "data": MedicineSerializer(
                        updated_medicine
                    ).data
                },
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {
                    "error": (
                        "Medicine could not be updated. "
                        "Changes were rolled back."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# LOGIN
# ============================================================

class LoginView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.validated_data["user"]
            staff = serializer.validated_data["staff"]

            return Response(
                {
                    "detail": "Login successful.",
                    "username": user.username,
                    "role": staff.role
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )