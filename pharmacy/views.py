from rest_framework import viewsets

from .models import Medicine, MedicineBill
from .serializers import MedicineSerializer, MedicineBillSerializer


class MedicineViewSet(viewsets.ModelViewSet):

    serializer_class = MedicineSerializer

    def get_queryset(self):
        queryset = Medicine.objects.all()

        search = self.request.query_params.get('search')

        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset


class MedicineBillViewSet(viewsets.ModelViewSet):

    queryset = MedicineBill.objects.all()
    serializer_class = MedicineBillSerializer