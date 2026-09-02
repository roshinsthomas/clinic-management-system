from django.contrib.auth import authenticate

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Department, Staff
from .serializers import (
    DepartmentSerializer,
    StaffSerializer,
    LoginSerializer,
)
from .permissions import IsAdmin, IsAdminOrReceptionist


# ============================================================
# DEPARTMENT LIST + CREATE
# ============================================================

class DepartmentListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [
                IsAuthenticated(),
                IsAdminOrReceptionist()
            ]

        return [
            IsAuthenticated(),
            IsAdmin()
        ]

    def get(self, request):

        departments = Department.objects.all()

        serializer = DepartmentSerializer(
            departments,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):

        serializer = DepartmentSerializer(
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

        serializer = DepartmentSerializer(department)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
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

    def delete(self, request, pk):

        department = self.get_object(pk)

        if not department:

            return Response(
                {
                    "detail": "Department not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        department.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# STAFF LIST + CREATE
# ============================================================

class StaffListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get(self, request):

        staff = Staff.objects.select_related(
            'user',
            'department'
        )

        serializer = StaffSerializer(
            staff,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):

        serializer = StaffSerializer(
            data=request.data
        )

        if serializer.is_valid():

            staff = serializer.save()

            return Response(
                StaffSerializer(staff).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# DOCTOR LIST
# ============================================================

class DoctorListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminOrReceptionist
    ]

    def get(self, request):

        doctors = Staff.objects.filter(
            role='DOCTOR'
        ).select_related(
            'user',
            'department'
        )

        serializer = StaffSerializer(
            doctors,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
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
            return Staff.objects.get(
                pk=pk,
                role='DOCTOR'
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

        serializer = StaffSerializer(doctor)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
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

    def delete(self, request, pk):

        doctor = self.get_object(pk)

        if not doctor:

            return Response(
                {
                    "detail": "Doctor not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        doctor.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
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
            return Staff.objects.get(pk=pk)

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

        serializer = StaffSerializer(staff)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
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

    def delete(self, request, pk):

        staff = self.get_object(pk)

        if not staff:

            return Response(
                {
                    "detail": "Staff member not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        staff.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
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

            user = serializer.validated_data['user']
            staff = serializer.validated_data['staff']

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