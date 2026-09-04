from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import (
    Patient,
    Appointment,
    ConsultationBill,
    DoctorSchedule,
)

from accounts.models import Staff, Department


# ============================================================
# PATIENT SERIALIZER
# ============================================================

class PatientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient

        fields = [
            "patient_id",
            "first_name",
            "last_name",
            "dob",
            "gender",
            "address",
            "phone",
            "email",
            "blood_group",
            "status",
        ]


# ============================================================
# APPOINTMENT SERIALIZER
# ============================================================

class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment

        fields = [
            "appointment_id",
            "patient",
            "doctor",
            "department",
            "appointment_date",
            "appointment_time",
            "appointment_type",
            "token_no",
            "status",
        ]

        read_only_fields = [
            "appointment_id",
            "token_no",
        ]

    # --------------------------------------------------------
    # VALIDATE PATIENT
    # --------------------------------------------------------

    def validate_patient(self, patient):

        if patient.status != "Active":
            raise serializers.ValidationError(
                "This patient is inactive and cannot be scheduled for an appointment."
            )

        return patient

    # --------------------------------------------------------
    # VALIDATE DOCTOR
    # --------------------------------------------------------

    def validate_doctor(self, doctor):

        if doctor.role != "DOCTOR":
            raise serializers.ValidationError(
                "Selected staff member is not a doctor."
            )

        if not doctor.status:
            raise serializers.ValidationError(
                "Selected doctor is inactive."
            )

        return doctor

    # --------------------------------------------------------
    # VALIDATE APPOINTMENT
    # --------------------------------------------------------

    def validate(self, data):

        patient = data.get(
            "patient",
            getattr(self.instance, "patient", None)
        )

        doctor = data.get(
            "doctor",
            getattr(self.instance, "doctor", None)
        )

        department = data.get(
            "department",
            getattr(self.instance, "department", None)
        )

        appointment_date = data.get(
            "appointment_date",
            getattr(
                self.instance,
                "appointment_date",
                None
            )
        )

        appointment_time = data.get(
            "appointment_time",
            getattr(
                self.instance,
                "appointment_time",
                None
            )
        )

        appointment_type = data.get(
            "appointment_type",
            getattr(
                self.instance,
                "appointment_type",
                None
            )
        )

        # ----------------------------------------------------
        # DOCTOR + DEPARTMENT
        # ----------------------------------------------------

        if doctor and department:

            if doctor.department_id != department.department_id:
                raise serializers.ValidationError(
                    {
                        "department":
                            "The selected doctor does not belong to the selected department."
                    }
                )

        # ----------------------------------------------------
        # APPOINTMENT DATE
        # ----------------------------------------------------

        if appointment_date and appointment_type:

            today = timezone.localdate()

            # ------------------------------------------------
            # WALK-IN
            # ------------------------------------------------

            if appointment_type == "WALK_IN":

                if appointment_date != today:
                    raise serializers.ValidationError(
                        {
                            "appointment_date":
                                "Walk-in appointments are available only for today."
                        }
                    )

            # ------------------------------------------------
            # PRIOR BOOKING
            # ------------------------------------------------

            elif appointment_type == "PRIOR_BOOKING":

                if appointment_date <= today:
                    raise serializers.ValidationError(
                        {
                            "appointment_date":
                                "Prior Booking must be made for a future date."
                        }
                    )

                if (appointment_date - today).days > 2:
                    raise serializers.ValidationError(
                        {
                            "appointment_date":
                                "Prior Booking can be made only within the next 2 days."
                        }
                    )

        # ====================================================
        # RULE 1
        #
        # SAME PATIENT
        # +
        # SAME DOCTOR
        # +
        # SAME DATE
        #
        # BLOCK REGARDLESS OF TIME
        # ====================================================

        if patient and doctor and appointment_date:

            existing_patient_doctor = Appointment.objects.filter(
                patient=patient,
                doctor=doctor,
                appointment_date=appointment_date
            ).exclude(
                status__iexact="Cancelled"
            )

            if self.instance and self.instance.pk:

                existing_patient_doctor = (
                    existing_patient_doctor.exclude(
                        pk=self.instance.pk
                    )
                )

            if existing_patient_doctor.exists():

                raise serializers.ValidationError(
                    {
                        "appointment_date":
                            "This patient already has an appointment with the selected doctor on this date."
                    }
                )

        # ====================================================
        # RULE 2 + RULE 3
        #
        # SAME PATIENT
        # +
        # SAME DATE
        #
        # Different doctor + different time -> ALLOW
        #
        # Different doctor + overlapping time -> BLOCK
        #
        # Appointment duration = 15 minutes
        # ====================================================

        if patient and appointment_date and appointment_time:

            patient_same_day = Appointment.objects.filter(
                patient=patient,
                appointment_date=appointment_date
            ).exclude(
                status__iexact="Cancelled"
            )

            if self.instance and self.instance.pk:

                patient_same_day = (
                    patient_same_day.exclude(
                        pk=self.instance.pk
                    )
                )

            selected_start = datetime.combine(
                appointment_date,
                appointment_time
            )

            selected_end = (
                selected_start
                + timedelta(minutes=15)
            )

            for existing in patient_same_day:

                if not existing.appointment_time:
                    continue

                existing_start = datetime.combine(
                    existing.appointment_date,
                    existing.appointment_time
                )

                existing_end = (
                    existing_start
                    + timedelta(minutes=15)
                )

                # Overlapping appointments
                overlapping = (
                    selected_start < existing_end
                    and selected_end > existing_start
                )

                if overlapping:

                    raise serializers.ValidationError(
                        {
                            "appointment_time":
                                "This patient already has another appointment at an overlapping time on this date."
                        }
                    )

        # ====================================================
        # RULE 4
        #
        # SAME DOCTOR
        # +
        # SAME DATE
        # +
        # SAME TIME
        #
        # BLOCK
        # ====================================================

        if doctor and appointment_date and appointment_time:

            existing_slot = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time
            ).exclude(
                status__iexact="Cancelled"
            )

            if self.instance and self.instance.pk:

                existing_slot = (
                    existing_slot.exclude(
                        pk=self.instance.pk
                    )
                )

            if existing_slot.exists():

                raise serializers.ValidationError(
                    {
                        "appointment_time":
                            "This time slot is already booked for the selected doctor."
                    }
                )

        # ====================================================
        # DOCTOR SCHEDULE VALIDATION
        # ====================================================

        if doctor and appointment_date and appointment_time:

            weekday = appointment_date.weekday()

            schedule = DoctorSchedule.objects.filter(
                doctor=doctor,
                weekday=weekday
            ).first()

            if not schedule:

                raise serializers.ValidationError(
                    {
                        "appointment_date":
                            "The selected doctor is not available on this day."
                    }
                )

            if schedule.slot_duration != 15:

                raise serializers.ValidationError(
                    {
                        "appointment_time":
                            "Appointments must use 15-minute time slots."
                    }
                )

            appointment_start = datetime.combine(
                appointment_date,
                appointment_time
            )

            appointment_end = (
                appointment_start
                + timedelta(minutes=15)
            )

            working_start = datetime.combine(
                appointment_date,
                schedule.start_time
            )

            working_end = datetime.combine(
                appointment_date,
                schedule.end_time
            )

            # ------------------------------------------------
            # WORKING HOURS
            # ------------------------------------------------

            if (
                appointment_start < working_start
                or appointment_end > working_end
            ):

                raise serializers.ValidationError(
                    {
                        "appointment_time":
                            "The selected time is outside the doctor's working hours."
                    }
                )

            # ------------------------------------------------
            # 15-MINUTE BOUNDARY
            # ------------------------------------------------

            minutes_from_start = (
                appointment_start - working_start
            ).total_seconds() / 60

            if minutes_from_start % 15 != 0:

                raise serializers.ValidationError(
                    {
                        "appointment_time":
                            "Please select a valid 15-minute time slot."
                    }
                )

            # ------------------------------------------------
            # BREAK VALIDATION
            # ------------------------------------------------

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

            for break_start, break_end in breaks:

                if break_start and break_end:

                    break_start_dt = datetime.combine(
                        appointment_date,
                        break_start
                    )

                    break_end_dt = datetime.combine(
                        appointment_date,
                        break_end
                    )

                    if (
                        appointment_start < break_end_dt
                        and appointment_end > break_start_dt
                    ):

                        raise serializers.ValidationError(
                            {
                                "appointment_time":
                                    "The selected time falls within a doctor's break period."
                            }
                        )

        # ====================================================
        # WALK-IN REAL-TIME VALIDATION
        #
        # Backend protection:
        # Even if frontend displays a valid future slot,
        # reject it if the time has passed before submission.
        # ====================================================

        if (
            appointment_type == "WALK_IN"
            and appointment_date
            and appointment_time
        ):

            today = timezone.localdate()

            if appointment_date == today:

                current_time = timezone.localtime().time()

                selected_datetime = datetime.combine(
                    appointment_date,
                    appointment_time
                )

                current_datetime = datetime.combine(
                    today,
                    current_time
                )

                if selected_datetime <= current_datetime:

                    raise serializers.ValidationError(
                        {
                            "appointment_time":
                                "The selected walk-in appointment time has already passed. Please select another available time."
                        }
                    )

        return data


# ============================================================
# CONSULTATION BILL SERIALIZER
# ============================================================

class ConsultationBillSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ConsultationBill

        fields = [
            "bill_id",
            "patient",
            "appointment",
            "registration_fee",
            "consultation_fee",
            "total_amount",
            "payment_status",
        ]

        read_only_fields = [
            "bill_id",
            "registration_fee",
            "consultation_fee",
            "total_amount",
        ]

    # --------------------------------------------------------
    # VALIDATE BILL
    # --------------------------------------------------------

    def validate(self, data):

        appointment = data.get(
            "appointment",
            getattr(
                self.instance,
                "appointment",
                None
            )
        )

        patient = data.get(
            "patient",
            getattr(
                self.instance,
                "patient",
                None
            )
        )

        if appointment:

            if patient is None:
                patient = appointment.patient

            if (
                appointment.patient_id
                != patient.patient_id
            ):

                raise serializers.ValidationError(
                    "The bill patient must match the appointment patient."
                )

            doctor = appointment.doctor

            if doctor.role != "DOCTOR":

                raise serializers.ValidationError(
                    "The appointment doctor is invalid."
                )

            if not doctor.status:

                raise serializers.ValidationError(
                    "The selected doctor is inactive."
                )

            if doctor.consultation_fee is None:

                raise serializers.ValidationError(
                    "The selected doctor does not have a consultation fee."
                )

        if patient is None:

            raise serializers.ValidationError(
                {
                    "patient":
                        "Patient is required."
                }
            )

        return data

    # --------------------------------------------------------
    # CREATE BILL
    # --------------------------------------------------------

    def create(self, validated_data):

        appointment = validated_data["appointment"]

        patient = appointment.patient

        previous_bill_exists = (
            ConsultationBill.objects.filter(
                patient=patient
            ).exists()
        )

        if previous_bill_exists:
            registration_fee = 0
        else:
            registration_fee = 500

        consultation_fee = (
            appointment.doctor.consultation_fee
        )

        if consultation_fee is None:

            raise serializers.ValidationError(
                {
                    "consultation_fee":
                        "The selected doctor does not have a consultation fee."
                }
            )

        total_amount = (
            registration_fee
            + consultation_fee
        )

        validated_data["patient"] = patient

        validated_data["registration_fee"] = (
            registration_fee
        )

        validated_data["consultation_fee"] = (
            consultation_fee
        )

        validated_data["total_amount"] = (
            total_amount
        )

        return ConsultationBill.objects.create(
            **validated_data
        )

    # --------------------------------------------------------
    # UPDATE BILL
    # --------------------------------------------------------

    def update(
        self,
        instance,
        validated_data
    ):

        appointment = validated_data.get(
            "appointment",
            instance.appointment
        )

        patient = validated_data.get(
            "patient",
            appointment.patient
        )

        if appointment.patient_id != patient.patient_id:

            raise serializers.ValidationError(
                "The bill patient must match the appointment patient."
            )

        doctor = appointment.doctor

        if doctor.role != "DOCTOR":

            raise serializers.ValidationError(
                "The appointment doctor is invalid."
            )

        if not doctor.status:

            raise serializers.ValidationError(
                "The selected doctor is inactive."
            )

        consultation_fee = (
            doctor.consultation_fee
        )

        if consultation_fee is None:

            raise serializers.ValidationError(
                "The selected doctor does not have a consultation fee."
            )

        registration_fee = (
            instance.registration_fee
        )

        total_amount = (
            registration_fee
            + consultation_fee
        )

        validated_data["patient"] = patient

        validated_data["registration_fee"] = (
            registration_fee
        )

        validated_data["consultation_fee"] = (
            consultation_fee
        )

        validated_data["total_amount"] = (
            total_amount
        )

        return super().update(
            instance,
            validated_data
        )


# ============================================================
# DOCTOR SCHEDULE SERIALIZER
# ============================================================

class DoctorScheduleSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = DoctorSchedule

        fields = [
            "id",
            "doctor",
            "weekday",
            "start_time",
            "end_time",
            "morning_break_start",
            "morning_break_end",
            "afternoon_break_start",
            "afternoon_break_end",
            "evening_break_start",
            "evening_break_end",
            "slot_duration",
        ]

    # --------------------------------------------------------
    # VALIDATE DOCTOR
    # --------------------------------------------------------

    def validate_doctor(self, doctor):

        if doctor.role != "DOCTOR":

            raise serializers.ValidationError(
                "Selected staff member is not a doctor."
            )

        if not doctor.status:

            raise serializers.ValidationError(
                "Selected doctor is inactive."
            )

        return doctor

    # --------------------------------------------------------
    # VALIDATE SCHEDULE
    # --------------------------------------------------------

    def validate(self, data):

        start_time = data.get(
            "start_time",
            getattr(
                self.instance,
                "start_time",
                None
            )
        )

        end_time = data.get(
            "end_time",
            getattr(
                self.instance,
                "end_time",
                None
            )
        )

        if start_time and end_time:

            if start_time >= end_time:

                raise serializers.ValidationError(
                    "Working end time must be after working start time."
                )

        # ----------------------------------------------------
        # SLOT DURATION
        # ----------------------------------------------------

        slot_duration = data.get(
            "slot_duration",
            getattr(
                self.instance,
                "slot_duration",
                15
            )
        )

        if slot_duration != 15:

            raise serializers.ValidationError(
                {
                    "slot_duration":
                        "Slot duration must be exactly 15 minutes."
                }
            )

        # ----------------------------------------------------
        # BREAK VALIDATION
        # ----------------------------------------------------

        breaks = [
            (
                data.get(
                    "morning_break_start",
                    getattr(
                        self.instance,
                        "morning_break_start",
                        None
                    )
                ),
                data.get(
                    "morning_break_end",
                    getattr(
                        self.instance,
                        "morning_break_end",
                        None
                    )
                ),
                "Morning break",
            ),
            (
                data.get(
                    "afternoon_break_start",
                    getattr(
                        self.instance,
                        "afternoon_break_start",
                        None
                    )
                ),
                data.get(
                    "afternoon_break_end",
                    getattr(
                        self.instance,
                        "afternoon_break_end",
                        None
                    )
                ),
                "Afternoon break",
            ),
            (
                data.get(
                    "evening_break_start",
                    getattr(
                        self.instance,
                        "evening_break_start",
                        None
                    )
                ),
                data.get(
                    "evening_break_end",
                    getattr(
                        self.instance,
                        "evening_break_end",
                        None
                    )
                ),
                "Evening break",
            ),
        ]

        for (
            break_start,
            break_end,
            break_name
        ) in breaks:

            if break_start and break_end:

                if break_start >= break_end:

                    raise serializers.ValidationError(
                        f"{break_name} end time must be after start time."
                    )

                if (
                    start_time
                    and break_start < start_time
                ):

                    raise serializers.ValidationError(
                        f"{break_name} must be within working hours."
                    )

                if (
                    end_time
                    and break_end > end_time
                ):

                    raise serializers.ValidationError(
                        f"{break_name} must be within working hours."
                    )

        return data