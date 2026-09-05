from django.urls import path
from .views import (
    doctor_appointments,
    today_appointments,
    patient_history,
    create_consultation,
    create_medicine_prescription,
    create_lab_prescription,
    view_consultation,  # Read-only completed consultation.
)

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
    
    # Create and lock a consultation for a specific appointment.
    path(
        "appointments/<int:appointment_id>/consultation/",
        create_consultation,
        name="create-consultation",
    ),
    
    # Add a medicine prescription to an existing consultation.
    path(
        "consultations/<int:consultation_id>/medicine-prescriptions/",
        create_medicine_prescription,
        name="create-medicine-prescription",
    ),
    
    # Add a lab test prescription to an existing consultation.
    path(
        "consultations/<int:consultation_id>/lab-prescriptions/",
        create_lab_prescription,
        name="create-lab-prescription",
    ),
    
    # View a completed consultation for a specific appointment.
    path(
        "appointments/<int:appointment_id>/consultation/view/",
        view_consultation,
        name="view-consultation",
    ),
    
    ]