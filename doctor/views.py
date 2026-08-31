from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from django.utils import timezone

from receptionist.models import Appointment, Patient

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    appointments = Appointment.objects.filter(
        doctor__user=request.user
    ).order_by(
        "appointment_date",
        "appointment_time"
    )

    data = []

    for appointment in appointments:
        data.append({
            "appointment_id": appointment.appointment_id,
            "patient_id": appointment.patient.patient_id,
            "patient_name": f"{appointment.patient.first_name} {appointment.patient.last_name}",
            "department": appointment.department.department_name,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "token_no": appointment.token_no,
            "status": appointment.status,
        })

    return Response(data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_appointments(request):
    today = timezone.localdate()

    appointments = Appointment.objects.filter(
        doctor__user=request.user,
        appointment_date=today
    ).order_by(
        "appointment_time"
    )

    data = []

    for appointment in appointments:
        data.append({
            "appointment_id": appointment.appointment_id,
            "patient_id": appointment.patient.patient_id,
            "patient_name": f"{appointment.patient.first_name} {appointment.patient.last_name}",
            "department": appointment.department.department_name,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "token_no": appointment.token_no,
            "status": appointment.status,
        })

    return Response(data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_history(request, patient_id):
    # Find the patient using the patient ID provided in the URL.
    try:
        patient = Patient.objects.get(patient_id=patient_id)
    except Patient.DoesNotExist:
        return Response(
            {"error": "Patient not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get all appointments of the patient.
    # Newest appointments are shown first.
    appointments = Appointment.objects.filter(
        patient=patient
    ).order_by(
        "-appointment_date",
        "-appointment_time"
    )

    history = []

    for appointment in appointments:
        # A consultation may not exist yet for a scheduled appointment.
        # getattr() safely returns None instead of raising an exception.
        consultation = getattr(appointment, "consultation", None)

        history.append({
            "appointment_id": appointment.appointment_id,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "doctor": appointment.doctor.user.get_full_name(),
            "department": appointment.department.department_name,
            "status": appointment.status,

            # Include consultation details only if the consultation exists.
            "consultation": {
                "symptoms": consultation.symptoms,
                "diagnosis": consultation.diagnosis,
                "notes": consultation.notes,
                "consultation_date": consultation.consultation_date,
            } if consultation else None
        })

    # Return patient information together with their appointment
    # and consultation history.
    data = {
        "patient": {
            "patient_id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "dob": patient.dob,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "phone": patient.phone,
            "email": patient.email,
            "address": patient.address,
            "status": patient.status,
        },
        "history": history
    }

    return Response(data, status=status.HTTP_200_OK)