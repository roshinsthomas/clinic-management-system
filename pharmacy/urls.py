from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet,MedicineBillViewSet


router = DefaultRouter()

router.register(
    r'medicines',
    MedicineViewSet,
    basename='medicine'
)

router.register(
    r'medicine-bills',
    MedicineBillViewSet,
    basename='medicine-bill'
)

urlpatterns = [
    path('', include(router.urls)),
]