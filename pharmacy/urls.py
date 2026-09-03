from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MedicineViewSet,
    MedicineBillViewSet,
    MedicinePrescriptionViewSet,
    DispenseMedicineView,PharmacyPatientSearchView,
    PharmacyAppointmentView,
    PharmacyAppointmentPrescriptionView,
    PharmacySalesReportView
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
      path(
        'dispense/',
        DispenseMedicineView.as_view(),
        name='dispense-medicine'
    ),

    path(
    'patients/search/',
    PharmacyPatientSearchView.as_view(),
    name='pharmacy-patient-search'
    ),

    path(
        'patients/<int:patient_id>/appointments/',
        PharmacyAppointmentView.as_view(),
        name='pharmacy-patient-appointments'
    ),

    path(
            'appointments/<int:appointment_id>/prescriptions/',
            PharmacyAppointmentPrescriptionView.as_view(),
            name='pharmacy-appointments-prescriptions'
        ),
        path(
    'reports/sales/',
    PharmacySalesReportView.as_view(),
    name='pharmacy-sales-report'
),

    path('', include(router.urls)),
]