
from rest_framework.routers import DefaultRouter

from .views import (
    PatientViewSet,
    AppointmentViewSet,
    ConsultationBillViewSet,
    DoctorScheduleViewSet,
)


router = DefaultRouter()

router.register(
    "patients",
    PatientViewSet,
    basename="patient"
)

router.register(
    "appointments",
    AppointmentViewSet,
    basename="appointment"
)

router.register(
    "consultation-bills",
    ConsultationBillViewSet,
    basename="consultation-bill"
)

router.register(
    "doctor-schedules",
    DoctorScheduleViewSet,
    basename="doctor-schedule"
)


urlpatterns = router.urls

