from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MedicineViewSet,
    MedicineBillViewSet,
    MedicinePrescriptionViewSet
)


router = DefaultRouter()

router.register(
    r'medicines',
    MedicineViewSet,
    basename='medicine'
)

router.register(
    r'prescriptions',
    MedicinePrescriptionViewSet,
    basename='prescription'
)

router.register(
    r'bills',
    MedicineBillViewSet,
    basename='bill'
)

urlpatterns = [
    path('', include(router.urls)),
]