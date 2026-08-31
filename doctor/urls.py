from django.urls import path
from .views import doctor_appointments,today_appointments,patient_history

urlpatterns = [
    # List all appointments assigned to the logged-in doctor.
    path("appointments/", doctor_appointments, name="doctor-appointments"),

    # List only today's appointments for the logged-in doctor.
    path("appointments/today/", today_appointments, name="today-appointments"),

    # Show a patient's details and previous appointment/consultation history.
    path(
        "patients/<int:patient_id>/history/",
        patient_history,
        name="patient-history",
    ),
]