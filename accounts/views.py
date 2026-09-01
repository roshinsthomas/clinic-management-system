from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Department ,Staff
from .serializers import DepartmentSerializer,StaffSerializer,LoginSerializer
from django.shortcuts import get_object_or_404

class DepartmentListCreateView(APIView):

    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)

        return Response(serializer.data)

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)

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
class DepartmentDetailView(APIView):

    def get(self, request, pk):
        department = get_object_or_404(Department, pk=pk)
        serializer = DepartmentSerializer(department)

        return Response(serializer.data)

    def patch(self, request, pk):
        department = get_object_or_404(Department, pk=pk)
        serializer = DepartmentSerializer(
            department,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
class StaffListCreateView(APIView):

    def get(self, request):
        staff = Staff.objects.all()
        serializer = StaffSerializer(staff, many=True)

        return Response(serializer.data)

    def post(self, request):
        serializer = StaffSerializer(data=request.data)

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
class DoctorListView(APIView):

    def get(self, request):
        doctors = Staff.objects.filter(
            role='DOCTOR',
            status=True
        )

        serializer = StaffSerializer(doctors, many=True)

        return Response(serializer.data)
class DoctorDetailView(APIView):

    def get(self, request, pk):
        doctor = get_object_or_404(
            Staff,
            pk=pk,
            role='DOCTOR'
        )

        serializer = StaffSerializer(doctor)

        return Response(serializer.data)

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
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
class StaffDetailView(APIView):

    def get(self, request, pk):
        staff = get_object_or_404(Staff, pk=pk)
        serializer = StaffSerializer(staff)

        return Response(serializer.data)

    def patch(self, request, pk):
        staff = get_object_or_404(Staff, pk=pk)

        serializer = StaffSerializer(
            staff,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
class LoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            staff = serializer.validated_data['staff']

            return Response({
                "message": "Login successful.",
                "staff_id": staff.staff_id,
                "username": staff.user.username,
                "role": staff.role,
                "status": staff.status
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
