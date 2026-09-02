from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Max

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .forms import (
    PatientForm,
    AppointmentForm,
    ConsultationBillForm,
)

from .models import (
    Patient,
    Appointment,
    ConsultationBill,
)

from .serializers import (
    PatientSerializer,
    AppointmentSerializer,
    ConsultationBillSerializer,
)

from .permissions import IsReceptionist


# ============================================================
# TOKEN GENERATION
# ============================================================

def generate_token(appointment):

    if appointment.token_no is not None:
        return

    last_token = Appointment.objects.filter(
        doctor=appointment.doctor,
        appointment_date=appointment.appointment_date,
        token_no__isnull=False
    ).aggregate(
        max_token=Max("token_no")
    )["max_token"]

    appointment.token_no = (last_token or 0) + 1

    appointment.save(
        update_fields=["token_no"]
    )


# ============================================================
# HTML VIEWS
# ============================================================

def register_patient(request):

    if request.method == "POST":

        form = PatientForm(request.POST)

        if form.is_valid():

            patient = form.save()

            return redirect(
                "schedule_appointment",
                patient_id=patient.patient_id
            )

    else:

        form = PatientForm()

    return render(
        request,
        "receptionist/register_patient.html",
        {
            "form": form
        }
    )


def schedule_appointment(request, patient_id):

    patient = get_object_or_404(
        Patient,
        patient_id=patient_id
    )

    if request.method == "POST":

        form = AppointmentForm(request.POST)

        if form.is_valid():

            appointment = form.save(commit=False)

            appointment.patient = patient

            # Token is generated only after payment is completed
            appointment.token_no = None

            appointment.save()

            return redirect(
                "create_consultation_bill",
                appointment_id=appointment.appointment_id
            )

    else:

        form = AppointmentForm()

    return render(
        request,
        "receptionist/schedule_appointment.html",
        {
            "form": form,
            "patient": patient,
        }
    )


def create_consultation_bill(request, appointment_id):

    appointment = get_object_or_404(
        Appointment,
        appointment_id=appointment_id
    )

    if request.method == "POST":

        form = ConsultationBillForm(request.POST)

        if form.is_valid():

            bill = form.save(commit=False)

            bill.patient = appointment.patient
            bill.appointment = appointment

            # Consultation fee comes from doctor's fee
            if not bill.consultation_fee:

                bill.consultation_fee = (
                    appointment.doctor.consultation_fee or 0
                )

            # Calculate total amount
            bill.total_amount = (
                bill.registration_fee
                + bill.consultation_fee
            )

            bill.save()

            # Generate token only after payment is completed
            if bill.payment_status == "Completed":

                generate_token(appointment)

            return redirect("register_patient")

    else:

        form = ConsultationBillForm(
            initial={
                "consultation_fee": (
                    appointment.doctor.consultation_fee or 0
                ),
            }
        )

    return render(
        request,
        "receptionist/create_consultation_bill.html",
        {
            "form": form,
            "appointment": appointment,
        }
    )


# ============================================================
# REST API VIEWSETS
# ============================================================

class PatientViewSet(viewsets.ModelViewSet):

    serializer_class = PatientSerializer

    permission_classes = [
        IsAuthenticated,
        IsReceptionist
    ]

    def get_queryset(self):

        queryset = Patient.objects.all()

        patient_id = self.request.query_params.get("patient_id")
        phone = self.request.query_params.get("phone")

        # Search by Patient ID
        if patient_id:

            queryset = queryset.filter(
                patient_id=patient_id
            )

        # Search by phone number
        if phone:

            queryset = queryset.filter(
                phone=phone
            )

        return queryset


class AppointmentViewSet(viewsets.ModelViewSet):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated,
        IsReceptionist
    ]

    def get_queryset(self):

        queryset = Appointment.objects.all()

        appointment_date = self.request.query_params.get(
            "appointment_date"
        )

        start_date = self.request.query_params.get(
            "start_date"
        )

        end_date = self.request.query_params.get(
            "end_date"
        )

        doctor = self.request.query_params.get(
            "doctor"
        )

        patient = self.request.query_params.get(
            "patient"
        )

        appointment_type = self.request.query_params.get(
            "appointment_type"
        )

        status = self.request.query_params.get(
            "status"
        )

        # Filter by one specific date
        if appointment_date:

            queryset = queryset.filter(
                appointment_date=appointment_date
            )

        # Filter by start date
        if start_date:

            queryset = queryset.filter(
                appointment_date__gte=start_date
            )

        # Filter by end date
        if end_date:

            queryset = queryset.filter(
                appointment_date__lte=end_date
            )

        # Filter by doctor
        if doctor:

            queryset = queryset.filter(
                doctor_id=doctor
            )

        # Filter by patient
        if patient:

            queryset = queryset.filter(
                patient_id=patient
            )

        # Filter by appointment type
        if appointment_type:

            queryset = queryset.filter(
                appointment_type=appointment_type
            )

        # Filter by appointment status
        if status:

            queryset = queryset.filter(
                status=status
            )

        return queryset.order_by(
            "appointment_date",
            "appointment_time"
        )


class ConsultationBillViewSet(viewsets.ModelViewSet):

    serializer_class = ConsultationBillSerializer

    permission_classes = [
        IsAuthenticated,
        IsReceptionist
    ]

    queryset = ConsultationBill.objects.all()

    def perform_create(self, serializer):

        bill = serializer.save()

        # Generate token only when payment is completed
        if bill.payment_status == "Completed":

            generate_token(
                bill.appointment
            )

    def perform_update(self, serializer):

        bill = serializer.save()

        # Generate token when payment becomes completed
        if bill.payment_status == "Completed":

            generate_token(
                bill.appointment
            )