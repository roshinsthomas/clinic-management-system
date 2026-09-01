from rest_framework import viewsets

from .models import LabTest, LabResult, LabBill
from .serializers import (
    LabTestSerializer,
    LabResultSerializer,
    LabBillSerializer
)


class LabTestViewSet(viewsets.ModelViewSet):

    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer


class LabResultViewSet(viewsets.ModelViewSet):

    queryset = LabResult.objects.all()
    serializer_class = LabResultSerializer


class LabBillViewSet(viewsets.ModelViewSet):

    queryset = LabBill.objects.all()
    serializer_class = LabBillSerializer