from django.urls import path
from . import views


urlpatterns = [
    path(
        "register-patient/",
        views.register_patient,
        name="register_patient",
    ),

    path(
        "schedule-appointment/<int:patient_id>/",
        views.schedule_appointment,
        name="schedule_appointment",
    ),

    path(
        "consultation-bill/<int:appointment_id>/",
        views.create_consultation_bill,
        name="create_consultation_bill",
    ),
]