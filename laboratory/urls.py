from rest_framework.routers import DefaultRouter

from .views import (
    LabTestViewSet,
    LabPrescriptionViewSet,
    LabResultViewSet,
    LabBillViewSet,
)


router = DefaultRouter()


router.register(
    r'tests',
    LabTestViewSet,
    basename='lab-test'
)


router.register(
    r'prescriptions',
    LabPrescriptionViewSet,
    basename='lab-prescription'
)


router.register(
    r'results',
    LabResultViewSet,
    basename='lab-result'
)


router.register(
    r'bills',
    LabBillViewSet,
    basename='lab-bill'
)


urlpatterns = router.urls