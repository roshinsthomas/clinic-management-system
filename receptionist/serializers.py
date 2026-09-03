
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
            getattr(
                self.instance,
                "patient",
                None
            )
        )

        doctor = data.get(
            "doctor",
            getattr(
                self.instance,
                "doctor",
                None
            )
        )

        department = data.get(
            "department",
            getattr(
                self.instance,
                "department",
                None
            )
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
                    "The selected doctor does not belong to the selected department."
                )

        # ----------------------------------------------------
        # APPOINTMENT DATE
        # ----------------------------------------------------

        if appointment_date and appointment_type:

            today = timezone.localdate()

            # WALK-IN
            if appointment_type == "WALK_IN":

                if appointment_date != today:

                    raise serializers.ValidationError(
                        "Walk-in appointments are available only for today."
                    )

            # PRIOR BOOKING
            elif appointment_type == "PRIOR_BOOKING":

                if appointment_date <= today:

                    raise serializers.ValidationError(
                        "Prior Booking must be made for a future date."
                    )

                if (appointment_date - today).days > 2:

                    raise serializers.ValidationError(
                        "Prior Booking can be made only within the next 2 days."
                    )

        # ====================================================
        # RULE 1
        #
        # Same Patient
        # +
        # Same Doctor
        # +
        # Same Date
        #
        # NOT ALLOWED
        #
        # Same patient + different doctor = ALLOWED
        # ====================================================

        if (
            patient
            and doctor
            and appointment_date
        ):

            existing_patient_doctor = Appointment.objects.filter(
                patient=patient,
                doctor=doctor,
                appointment_date=appointment_date
            ).exclude(
                status="Cancelled"
            )

            # Exclude current appointment during update
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
        # RULE 2
        #
        # Same Doctor
        # +
        # Same Date
        # +
        # Same Time
        #
        # NOT ALLOWED
        #
        # Different patients are also blocked because the
        # doctor's time slot is already occupied.
        # ====================================================

        if (
            doctor
            and appointment_date
            and appointment_time
        ):

            existing_slot = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time
            ).exclude(
                status="Cancelled"
            )

            # Exclude current appointment during update
            if self.instance and self.instance.pk:

                existing_slot = existing_slot.exclude(
                    pk=self.instance.pk
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

        if (
            doctor
            and appointment_date
            and appointment_time
        ):

            weekday = appointment_date.weekday()

            schedule = DoctorSchedule.objects.filter(
                doctor=doctor,
                weekday=weekday
            ).first()

            # ------------------------------------------------
            # Doctor not working on this day
            # ------------------------------------------------

            if not schedule:

                raise serializers.ValidationError(
                    {
                        "appointment_date":
                            "The selected doctor is not available on this day."
                    }
                )

            # ------------------------------------------------
            # Only 15-minute slots
            # ------------------------------------------------

            if schedule.slot_duration != 15:

                raise serializers.ValidationError(
                    {
                        "appointment_time":
                            "Appointments must use 15-minute time slots."
                    }
                )

            # ------------------------------------------------
            # Appointment start/end
            # ------------------------------------------------

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
            # Working hours
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
            # Valid 15-minute boundary
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

                    # Any overlap with break is invalid.
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

        if appointment:

            patient = data.get(
                "patient",
                appointment.patient
            )

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

        return data

    # --------------------------------------------------------
    # CREATE BILL
    # --------------------------------------------------------

    def create(self, validated_data):

        appointment = validated_data["appointment"]

        registration_fee = validated_data.get(
            "registration_fee",
            0
        )

        consultation_fee = (
            appointment.doctor.consultation_fee
        )

        total_amount = (
            registration_fee
            + consultation_fee
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

        registration_fee = validated_data.get(
            "registration_fee",
            instance.registration_fee
        )

        consultation_fee = (
            appointment.doctor.consultation_fee
        )

        if consultation_fee is None:

            raise serializers.ValidationError(
                "The selected doctor does not have a consultation fee."
            )

        total_amount = (
            registration_fee
            + consultation_fee
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
        # Slot duration
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
        # Break validation
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

