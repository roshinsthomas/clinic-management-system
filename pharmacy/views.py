from rest_framework import viewsets

from .models import Medicine, MedicineBill
from .serializers import (
    MedicineSerializer,
    MedicineBillSerializer,
    MedicinePrescriptionSerializer
)

from doctor.models import MedicinePrescription


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer


class MedicineBillViewSet(viewsets.ModelViewSet):
    queryset = MedicineBill.objects.all()
    serializer_class = MedicineBillSerializer


class MedicinePrescriptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MedicinePrescription.objects.filter(
        dispensed_status='PENDING'
    )
    serializer_class = MedicinePrescriptionSerializer