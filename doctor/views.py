from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from django.utils import timezone

# Doctor-owned model used when saving consultation details.
from .models import Consultation, MedicinePrescription, LabPrescription

from receptionist.models import Appointment, Patient
from pharmacy.models import Medicine
from laboratory.models import LabTest

#to list the appointments of the particular doctor
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


#function to list today's appointments of the particular doctor
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


#function to list the patients history
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


#function to create consultation
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_consultation(request, appointment_id):
    # Make sure the appointment exists and belongs to the logged-in doctor.
    try:
        appointment = Appointment.objects.get(
            appointment_id=appointment_id,
            doctor__user=request.user
        )
    except Appointment.DoesNotExist:
        return Response(
            {"error": "Appointment not found or not assigned to this doctor."},
            status=status.HTTP_404_NOT_FOUND
        )

    # A OneToOneField allows only one consultation per appointment.
    # This check gives a clearer API response before hitting a database error.
    if Consultation.objects.filter(appointment=appointment).exists():
        return Response(
            {"error": "Consultation already exists for this appointment."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Read consultation details sent from the frontend/API client.
    symptoms = request.data.get("symptoms")
    diagnosis = request.data.get("diagnosis")
    notes = request.data.get("notes")

    # Symptoms and diagnosis are required by the project requirements.
    if not symptoms or not symptoms.strip():
        return Response(
            {"error": "Symptoms are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not diagnosis or not diagnosis.strip():
        return Response(
            {"error": "Diagnosis is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save the consultation and immediately lock it so it cannot
    # be edited later.
    consultation = Consultation.objects.create(
        appointment=appointment,
        symptoms=symptoms.strip(),
        diagnosis=diagnosis.strip(),
        notes=notes.strip() if notes else None,
        locked=True
    )

    # Once the consultation is completed, update the appointment status.
    appointment.status = "Completed"
    appointment.save()

    return Response(
        {
            "message": "Consultation saved successfully.",
            "consultation_id": consultation.consultation_id,
            "appointment_id": appointment.appointment_id,
            "status": appointment.status,
            "locked": consultation.locked,
        },
        status=status.HTTP_201_CREATED
    )
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_medicine_prescription(request, consultation_id):
    # Find the consultation and ensure that its appointment
    # belongs to the currently logged-in doctor.
    try:
        consultation = Consultation.objects.get(
            consultation_id=consultation_id,
            appointment__doctor__user=request.user
        )
    except Consultation.DoesNotExist:
        return Response(
            {
                "error": (
                    "Consultation not found or does not belong "
                    "to this doctor."
                )
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Read the prescription details sent by the frontend.
    medicine_id = request.data.get("medicine_id")
    dosage = request.data.get("dosage")
    frequency = request.data.get("frequency")
    duration = request.data.get("duration")

    # All four values are required for a medicine prescription.
    if not medicine_id:
        return Response(
            {"error": "Medicine is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not dosage or not dosage.strip():
        return Response(
            {"error": "Dosage is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not frequency or not frequency.strip():
        return Response(
            {"error": "Frequency is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not duration or not duration.strip():
        return Response(
            {"error": "Duration is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify that the selected medicine exists in the
    # pharmacy medicine master.
    try:
        medicine = Medicine.objects.get(pk=medicine_id)
    except Medicine.DoesNotExist:
        return Response(
            {"error": "Medicine not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Create the prescription.
    # dispensed_status automatically becomes PENDING because
    # that is the default value defined in the model.
    prescription = MedicinePrescription.objects.create(
        consultation=consultation,
        medicine=medicine,
        dosage=dosage.strip(),
        frequency=frequency.strip(),
        duration=duration.strip()
    )

    return Response(
        {
            "message": "Medicine prescribed successfully.",
            "prescription_id": prescription.prescription_id,
            "consultation_id": consultation.consultation_id,
            "medicine_id": medicine.pk,
            "medicine_name": medicine.name,
            "dosage": prescription.dosage,
            "frequency": prescription.frequency,
            "duration": prescription.duration,
            "dispensed_status": prescription.dispensed_status,
        },
        status=status.HTTP_201_CREATED
    )
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_lab_prescription(request, consultation_id):
    # Find the consultation and make sure it belongs to
    # the currently logged-in doctor.
    try:
        consultation = Consultation.objects.get(
            consultation_id=consultation_id,
            appointment__doctor__user=request.user
        )
    except Consultation.DoesNotExist:
        return Response(
            {
                "error": (
                    "Consultation not found or does not belong "
                    "to this doctor."
                )
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Read the selected lab test ID from the request.
    lab_test_id = request.data.get("lab_test_id")

    # A lab test must be selected before creating the prescription.
    if not lab_test_id:
        return Response(
            {"error": "Lab test is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Make sure the selected lab test exists in the
    # laboratory test master.
    try:
        lab_test = LabTest.objects.get(pk=lab_test_id)
    except LabTest.DoesNotExist:
        return Response(
            {"error": "Lab test not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Create the lab prescription.
    # Status automatically starts as PENDING based on the model default.
    lab_prescription = LabPrescription.objects.create(
        consultation=consultation,
        lab_test=lab_test
    )

    return Response(
        {
            "message": "Lab test prescribed successfully.",
            "lab_prescription_id": lab_prescription.lab_prescription_id,
            "consultation_id": consultation.consultation_id,
            "lab_test_id": lab_test.pk,
            "lab_test_name": lab_test.test_name,
            "status": lab_prescription.status,
        },
        status=status.HTTP_201_CREATED
    )