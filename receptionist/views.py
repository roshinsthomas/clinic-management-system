from datetime import datetime, timedelta

from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Max

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .forms import PatientForm, AppointmentForm, ConsultationBillForm
from .models import (
    Patient,
    Appointment,
    ConsultationBill,
    DoctorSchedule,
)
from .serializers import (
    PatientSerializer,
    AppointmentSerializer,
    ConsultationBillSerializer,
    DoctorScheduleSerializer,
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
        form = AppointmentForm(
    request.POST,
    patient=patient
    ) 

        if form.is_valid():
            appointment = form.save(
                commit=False
            )

            appointment.patient = patient
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
            "patient": patient
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
            bill = form.save(
                commit=False
            )

            bill.patient = appointment.patient
            bill.appointment = appointment

            if not bill.consultation_fee:
                bill.consultation_fee = (
                    appointment.doctor.consultation_fee or 0
                )

            bill.total_amount = (
                bill.registration_fee
                + bill.consultation_fee
            )

            bill.save()

            if bill.payment_status == "Completed":
                generate_token(appointment)

            return redirect(
                "register_patient"
            )

    else:
        form = ConsultationBillForm(
            initial={
                "consultation_fee":
                    appointment.doctor.consultation_fee or 0
            }
        )

    return render(
        request,
        "receptionist/create_consultation_bill.html",
        {
            "form": form,
            "appointment": appointment
        }
    )


# ============================================================
# PATIENT API
# ============================================================

class PatientViewSet(viewsets.ModelViewSet):

    serializer_class = PatientSerializer

    permission_classes = [
        IsAuthenticated,
        IsReceptionist
    ]

    def get_queryset(self):
        queryset = Patient.objects.all()

        patient_id = self.request.query_params.get(
            "patient_id"
        )

        phone = self.request.query_params.get(
            "phone"
        )

        if patient_id:
            queryset = queryset.filter(
                patient_id=patient_id
            )

        if phone:
            queryset = queryset.filter(
                phone=phone
            )

        return queryset


# ============================================================
# APPOINTMENT API
# ============================================================

class AppointmentViewSet(viewsets.ModelViewSet):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated,
        IsReceptionist
    ]

    def get_queryset(self):

        queryset = Appointment.objects.all()

        appointment_date = (
            self.request.query_params.get(
                "appointment_date"
            )
        )

        start_date = (
            self.request.query_params.get(
                "start_date"
            )
        )

        end_date = (
            self.request.query_params.get(
                "end_date"
            )
        )

        doctor = (
            self.request.query_params.get(
                "doctor"
            )
        )

        patient = (
            self.request.query_params.get(
                "patient"
            )
        )

        appointment_type = (
            self.request.query_params.get(
                "appointment_type"
            )
        )

        status = (
            self.request.query_params.get(
                "status"
            )
        )

        if appointment_date:
            queryset = queryset.filter(
                appointment_date=appointment_date
            )

        if start_date:
            queryset = queryset.filter(
                appointment_date__gte=start_date
            )

        if end_date:
            queryset = queryset.filter(
                appointment_date__lte=end_date
            )

        if doctor:
            queryset = queryset.filter(
                doctor_id=doctor
            )

        if patient:
            queryset = queryset.filter(
                patient_id=patient
            )

        if appointment_type:
            queryset = queryset.filter(
                appointment_type=appointment_type
            )

        if status:
            queryset = queryset.filter(
                status=status
            )

        return queryset.order_by(
            "appointment_date",
            "appointment_time"
        )

    # ========================================================
    # AVAILABLE SLOTS
    # ========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="available-slots"
    )
    def available_slots(self, request):

        doctor_id = request.query_params.get(
            "doctor"
        )

        date = request.query_params.get(
            "date"
        )

        # ----------------------------------------------------
        # Validate parameters
        # ----------------------------------------------------

        if not doctor_id or not date:
            return Response(
                {
                    "detail":
                        "doctor and date are required."
                },
                status=400
            )

        # ----------------------------------------------------
        # Convert date
        # ----------------------------------------------------

        try:
            appointment_date = datetime.strptime(
                date,
                "%Y-%m-%d"
            ).date()

        except ValueError:
            return Response(
                {
                    "detail":
                        "Invalid date format. Use YYYY-MM-DD."
                },
                status=400
            )

        # ----------------------------------------------------
        # Find weekday
        # Monday = 0
        # Tuesday = 1
        # ...
        # Sunday = 6
        # ----------------------------------------------------

        weekday = appointment_date.weekday()

        # ----------------------------------------------------
        # Find doctor's schedule for that weekday
        # ----------------------------------------------------

        schedule = DoctorSchedule.objects.filter(
            doctor_id=doctor_id,
            weekday=weekday
        ).first()

        # No schedule means doctor is not working
        # on that particular day.
        # ----------------------------------------------------

        if not schedule:
            return Response([])

        # ----------------------------------------------------
        # Create working-hour range
        # ----------------------------------------------------

        current = datetime.combine(
            appointment_date,
            schedule.start_time
        )

        end = datetime.combine(
            appointment_date,
            schedule.end_time
        )

        # ----------------------------------------------------
        # Define breaks
        # ----------------------------------------------------

        breaks = [
            (
                schedule.morning_break_start,
                schedule.morning_break_end
            ),
            (
                schedule.afternoon_break_start,
                schedule.afternoon_break_end
            ),
            (
                schedule.evening_break_start,
                schedule.evening_break_end
            ),
        ]

        slots = []

        # ----------------------------------------------------
        # Generate slots
        # ----------------------------------------------------

        while current < end:

            current_time = current.time()

            is_break = False

            # ------------------------------------------------
            # Check whether current time falls inside a break
            # ------------------------------------------------

            for break_start, break_end in breaks:

                if break_start and break_end:

                    if (
                        break_start
                        <= current_time
                        < break_end
                    ):
                        is_break = True
                        break

            # ------------------------------------------------
            # If not a break, check whether slot is booked
            # ------------------------------------------------

            if not is_break:

                booked = Appointment.objects.filter(
                    doctor_id=doctor_id,
                    appointment_date=appointment_date,
                    appointment_time=current_time
                ).exclude(
                    status="Cancelled"
                ).exists()

                # --------------------------------------------
                # Only add free slots
                # --------------------------------------------

                if not booked:
                    slots.append(
                        current.strftime("%H:%M")
                    )

            # ------------------------------------------------
            # Move to next slot
            # ------------------------------------------------

            current += timedelta(
                minutes=schedule.slot_duration
            )

        # ----------------------------------------------------
        # Return available slots
        # ----------------------------------------------------

        return Response(slots)


# ============================================================
# CONSULTATION BILL API
# ============================================================

class ConsultationBillViewSet(
    viewsets.ModelViewSet
):

    serializer_class = ConsultationBillSerializer

    permission_classes = [
        IsAuthenticated,
        IsReceptionist
    ]

    queryset = ConsultationBill.objects.all()

    def perform_create(self, serializer):

        bill = serializer.save()

        if bill.payment_status == "Completed":

            generate_token(
                bill.appointment
            )

    def perform_update(self, serializer):

        bill = serializer.save()

        if bill.payment_status == "Completed":

            generate_token(
                bill.appointment
            )


# ============================================================
# DOCTOR SCHEDULE API
# ============================================================

class DoctorScheduleViewSet(
    viewsets.ModelViewSet
):

    serializer_class = DoctorScheduleSerializer

    permission_classes = [
        IsAuthenticated,
        IsReceptionist
    ]

    def get_queryset(self):

        queryset = DoctorSchedule.objects.all()

        doctor = (
            self.request.query_params.get(
                "doctor"
            )
        )

        weekday = (
            self.request.query_params.get(
                "weekday"
            )
        )

        if doctor:
            queryset = queryset.filter(
                doctor_id=doctor
            )

        if weekday is not None:
            queryset = queryset.filter(
                weekday=weekday
            )

        return queryset.order_by(
            "doctor_id",
            "weekday"
        )