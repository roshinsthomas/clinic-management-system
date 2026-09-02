from rest_framework import viewsets

from .models import LabTest, LabResult, LabBill
from .serializers import (
    LabTestSerializer,
    LabResultSerializer,
    LabBillSerializer
)


class LabTestViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer


class LabResultViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = LabResult.objects.all()
    serializer_class = LabResultSerializer


class LabBillViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = LabBill.objects.all()
    serializer_class = LabBillSerializer