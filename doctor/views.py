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
from accounts.permissions import IsDoctor

#to list the appointments of the particular doctor
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDoctor])
def doctor_appointments(request):
    
    # Get today's local date.
    today = timezone.localdate()

    # Any previous-day appointment that was never started/completed
    # is automatically considered missed.
    Appointment.objects.filter(
        doctor__user=request.user,
        appointment_date__lt=today,
        status="Scheduled"
    ).update(status="Missed")
    
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
@permission_classes([IsAuthenticated, IsDoctor])
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
@permission_classes([IsAuthenticated, IsDoctor])
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
@permission_classes([IsAuthenticated, IsDoctor])
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
@permission_classes([IsAuthenticated, IsDoctor])
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

    # Read prescription details sent by the frontend.
    medicine_id = request.data.get("medicine_id")
    other_medicine_name = request.data.get("other_medicine_name")
    other_medicine_type = request.data.get("other_medicine_type")
    dosage = request.data.get("dosage")
    quantity = request.data.get("quantity")
    frequency = request.data.get("frequency")
    duration = request.data.get("duration")

    # Remove unnecessary spaces from manual medicine details.
    if isinstance(other_medicine_name, str):
        other_medicine_name = other_medicine_name.strip()

    if isinstance(other_medicine_type, str):
        other_medicine_type = other_medicine_type.strip()

    # A prescription must use either a medicine from the clinic
    # master OR a manually entered outside medicine, never both.
    if medicine_id and other_medicine_name:
        return Response(
            {
                "error": (
                    "Select a clinic medicine or enter an outside "
                    "medicine, not both."
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not medicine_id and not other_medicine_name:
        return Response(
            {"error": "Medicine is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Medicine type is required when prescribing an outside medicine.
    if other_medicine_name and not other_medicine_type:
        return Response(
            {"error": "Medicine type is required for an outside medicine."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate the common prescription fields.
    if not dosage or not str(dosage).strip():
        return Response(
            {"error": "Dosage is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not frequency or not str(frequency).strip():
        return Response(
            {"error": "Frequency is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not duration or not str(duration).strip():
        return Response(
            {"error": "Duration is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Quantity must be a positive whole number.
    try:
        quantity = int(quantity)
        if quantity < 1:
            raise ValueError
    except (TypeError, ValueError):
        return Response(
            {"error": "Quantity must be at least 1."},
            status=status.HTTP_400_BAD_REQUEST
        )

    medicine = None

    # Clinic medicines must exist in the Pharmacy medicine master.
    if medicine_id:
        try:
            medicine = Medicine.objects.get(pk=medicine_id)
        except Medicine.DoesNotExist:
            return Response(
                {"error": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Clinic medicines are sent to Pharmacy for dispensing.
        dispensed_status = "PENDING"

    else:
        # Outside medicines are purchased externally and should
        # not enter the clinic Pharmacy dispensing workflow.
        dispensed_status = "OUTSIDE"

    # Create either a clinic or outside medicine prescription.
    prescription = MedicinePrescription.objects.create(
        consultation=consultation,
        medicine=medicine,
        other_medicine_name=(
            other_medicine_name if medicine is None else None
        ),
        other_medicine_type=(
            other_medicine_type if medicine is None else None
        ),
        dosage=str(dosage).strip(),
        quantity=quantity,
        frequency=str(frequency).strip(),
        duration=str(duration).strip(),
        dispensed_status=dispensed_status
    )

    # Return whichever medicine name/type applies to this prescription.
    medicine_name = (
        medicine.name
        if medicine
        else prescription.other_medicine_name
    )

    medicine_type = (
        medicine.type
        if medicine
        else prescription.other_medicine_type
    )

    return Response(
        {
            "message": "Medicine prescribed successfully.",
            "prescription_id": prescription.prescription_id,
            "consultation_id": consultation.consultation_id,
            "medicine_id": medicine.pk if medicine else None,
            "medicine_name": medicine_name,
            "medicine_type": medicine_type,
            "dosage": prescription.dosage,
            "quantity": prescription.quantity,
            "frequency": prescription.frequency,
            "duration": prescription.duration,
            "dispensed_status": prescription.dispensed_status,
        },
        status=status.HTTP_201_CREATED
    )
    
    
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsDoctor])
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
    

# Returns a completed consultation with its prescriptions for read-only display.
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDoctor])
def view_consultation(request, appointment_id):
    try:
        # Make sure the appointment belongs to the logged-in doctor.
        consultation = Consultation.objects.select_related(
            "appointment",
            "appointment__patient",
            "appointment__doctor__user",
            "appointment__department",
        ).prefetch_related(
            "medicine_prescriptions__medicine",
            "lab_prescriptions__lab_test",
        ).get(
            appointment__appointment_id=appointment_id,
            appointment__doctor__user=request.user,
        )
    except Consultation.DoesNotExist:
        return Response(
            {"error": "Consultation not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    appointment = consultation.appointment
    patient = appointment.patient

    # Build medicine prescription data for the frontend.
    medicines = []
    for prescription in consultation.medicine_prescriptions.all():
        medicines.append({
            "prescription_id": prescription.prescription_id,
            "medicine_name": (
                prescription.medicine.name
                if prescription.medicine
                else prescription.other_medicine_name
            ),
            "medicine_type": (
                prescription.medicine.type
                if prescription.medicine
                else prescription.other_medicine_type
            ),
            "dosage": prescription.dosage,
            "quantity": prescription.quantity,
            "frequency": prescription.frequency,
            "duration": prescription.duration,
            "status": prescription.dispensed_status,
        })

    # Build lab prescription data for the frontend.
    lab_tests = []
    for prescription in consultation.lab_prescriptions.all():
        lab_tests.append({
            "lab_prescription_id": prescription.lab_prescription_id,
            "lab_test_id": prescription.lab_test_id,
            "lab_test_name": prescription.lab_test.test_name,
            "status": prescription.status,
        })

    return Response({
        "appointment_id": appointment.appointment_id,
        "patient_id": patient.patient_id,
        "patient_name": f"{patient.first_name} {patient.last_name}".strip(),
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "department": appointment.department.department_name,
        "doctor_name": (
            appointment.doctor.user.get_full_name()
            or appointment.doctor.user.username
        ),
        "consultation_id": consultation.consultation_id,
        "consultation_date": consultation.consultation_date,
        "symptoms": consultation.symptoms,
        "diagnosis": consultation.diagnosis,
        "notes": consultation.notes,
        "locked": consultation.locked,
        "medicines": medicines,
        "lab_tests": lab_tests,
    })