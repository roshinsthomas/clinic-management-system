from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Department, Staff
from .serializers import (
    DepartmentSerializer,
    StaffSerializer,
    LoginSerializer
)

from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin


# ============================================================
# DEPARTMENT MANAGEMENT
# ============================================================

class DepartmentListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    # --------------------------------------------------------
    # GET - View all departments
    # --------------------------------------------------------
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

    # --------------------------------------------------------
    # POST - Add new department
    # --------------------------------------------------------
    def post(self, request):

        serializer = DepartmentSerializer(
            data=request.data
        )

        if serializer.is_valid():

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

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# DEPARTMENT DETAIL
# ============================================================

class DepartmentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    # --------------------------------------------------------
    # GET - View single department
    # --------------------------------------------------------
    def get(self, request, pk):

        department = get_object_or_404(
            Department,
            pk=pk
        )

        try:

            serializer = DepartmentSerializer(
                department
            )

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

    # --------------------------------------------------------
    # PATCH - Update department
    # --------------------------------------------------------
    def patch(self, request, pk):

        department = get_object_or_404(
            Department,
            pk=pk
        )

        serializer = DepartmentSerializer(
            department,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

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

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------------
    # DELETE - Permanently delete department
    # --------------------------------------------------------
    def delete(self, request, pk):

        department = get_object_or_404(
            Department,
            pk=pk
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
    permission_classes = [IsAuthenticated, IsAdmin]

    # --------------------------------------------------------
    # GET - View staff
    # --------------------------------------------------------
    def get(self, request):

        staff = Staff.objects.exclude(
            role='ADMIN'
        )

        serializer = StaffSerializer(
            staff,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # POST - Add staff
    # --------------------------------------------------------
    def post(self, request):

        serializer = StaffSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# DOCTOR MANAGEMENT
# ============================================================

class DoctorListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    # --------------------------------------------------------
    # GET - View all doctors
    # --------------------------------------------------------
    def get(self, request):

        doctors = Staff.objects.filter(
            role='DOCTOR'
        )

        serializer = StaffSerializer(
            doctors,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class DoctorDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    # --------------------------------------------------------
    # GET - View single doctor
    # --------------------------------------------------------
    def get(self, request, pk):

        doctor = get_object_or_404(
            Staff,
            pk=pk,
            role='DOCTOR'
        )

        serializer = StaffSerializer(
            doctor
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # PATCH - Update doctor
    # --------------------------------------------------------
    def patch(self, request, pk):

        doctor = get_object_or_404(
            Staff,
            pk=pk,
            role='DOCTOR'
        )

        serializer = StaffSerializer(
            doctor,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# STAFF DETAIL
# ============================================================

class StaffDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    # --------------------------------------------------------
    # GET - View single staff
    # --------------------------------------------------------
    def get(self, request, pk):

        staff = get_object_or_404(
            Staff,
            pk=pk
        )

        serializer = StaffSerializer(
            staff
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # PATCH - Update staff
    # --------------------------------------------------------
    def patch(self, request, pk):

        staff = get_object_or_404(
            Staff,
            pk=pk
        )

        serializer = StaffSerializer(
            staff,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# LOGIN
# ============================================================

class LoginView(APIView):

    # --------------------------------------------------------
    # POST - Login
    # --------------------------------------------------------
    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            staff = serializer.validated_data['staff']

            return Response(
                {
                    "message": "Login successful.",
                    "staff_id": staff.staff_id,
                    "username": staff.user.username,
                    "role": staff.role,
                    "status": staff.status
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )