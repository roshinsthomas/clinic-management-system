from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Medicine, MedicineBill
from .serializers import (
    MedicineSerializer,
    MedicineStockSerializer,
    MedicineBillSerializer,
    MedicinePrescriptionSerializer
)

from .permissions import IsAdmin, IsPharmacist,IsAdminOrPharmacist
from doctor.models import MedicinePrescription


class MedicineViewSet(viewsets.ModelViewSet):

    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    def get_permissions(self):

        # Anyone authenticated can view medicines
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]

        # Only admin can create/delete medicine
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]

        # Normal update is only for admin
        if self.action in ['update', 'partial_update']:
            return [IsAdmin()]
        if self.action == 'update_stock':
            return [IsAdminOrPharmacist()]
    
        return [IsAuthenticated()]

    @action(
        detail=True,
        methods=['put', 'patch'],
        url_path='stock',
        
    )
    def update_stock(self, request, pk=None):
        medicine = self.get_object()

        serializer = MedicineStockSerializer(
            medicine,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class MedicineBillViewSet(viewsets.ModelViewSet):

    queryset = MedicineBill.objects.all()
    serializer_class = MedicineBillSerializer

    permission_classes = [IsAuthenticated]


class MedicinePrescriptionViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = MedicinePrescription.objects.filter(
        dispensed_status='PENDING'
    )

    serializer_class = MedicinePrescriptionSerializer

    permission_classes = [IsAuthenticated]