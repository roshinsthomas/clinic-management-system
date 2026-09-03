
from django import forms
from django.utils import timezone

from .models import Patient, Appointment, ConsultationBill
from accounts.models import Staff, Department


class PatientForm(forms.ModelForm):

    class Meta:
        model = Patient
        fields = [
            "first_name",
            "last_name",
            "dob",
            "gender",
            "address",
            "phone",
            "email",
            "blood_group",
        ]


class AppointmentForm(forms.ModelForm):

    class Meta:
        model = Appointment
        fields = [
            "doctor",
            "department",
            "appointment_date",
            "appointment_time",
            "appointment_type",
        ]

    def __init__(self, *args, **kwargs):
        self.patient = kwargs.pop("patient", None)
        super().__init__(*args, **kwargs)

        self.fields["doctor"].queryset = Staff.objects.filter(
            role="DOCTOR",
            status=True
        )

        self.fields["department"].queryset = Department.objects.filter(
            status=True
        )

    def clean(self):
        cleaned_data = super().clean()

        doctor = cleaned_data.get("doctor")
        department = cleaned_data.get("department")
        appointment_date = cleaned_data.get("appointment_date")
        appointment_time = cleaned_data.get("appointment_time")
        appointment_type = cleaned_data.get("appointment_type")

        # ----------------------------------------------------
        # PATIENT VALIDATION
        # ----------------------------------------------------

        if self.patient:

            if self.patient.status != "Active":
                raise forms.ValidationError(
                    "This patient is inactive and cannot be scheduled for an appointment."
                )

        # ----------------------------------------------------
        # DOCTOR VALIDATION
        # ----------------------------------------------------

        if doctor:

            if doctor.role != "DOCTOR":
                raise forms.ValidationError(
                    "Selected staff member is not a doctor."
                )

            if not doctor.status:
                raise forms.ValidationError(
                    "Selected doctor is inactive."
                )

        # ----------------------------------------------------
        # DOCTOR + DEPARTMENT VALIDATION
        # ----------------------------------------------------

        if doctor and department:

            if doctor.department_id != department.department_id:
                raise forms.ValidationError(
                    "The selected doctor does not belong to the selected department."
                )

        # ----------------------------------------------------
        # APPOINTMENT DATE VALIDATION
        # ----------------------------------------------------

        if appointment_date and appointment_type:

            today = timezone.localdate()

            # Walk-in appointment
            if appointment_type == "WALK_IN":

                if appointment_date != today:
                    raise forms.ValidationError(
                        "Walk-in appointments are available only for today."
                    )

            # Prior booking
            elif appointment_type == "PRIOR_BOOKING":

                if appointment_date <= today:
                    raise forms.ValidationError(
                        "Prior Booking must be made for a future date."
                    )

                if (appointment_date - today).days > 2:
                    raise forms.ValidationError(
                        "Prior Booking can be made only within the next 2 days."
                    )

        # ----------------------------------------------------
        # APPOINTMENT VALIDATION
        # ----------------------------------------------------

        if (
            self.patient
            and doctor
            and appointment_date
        ):

            # =================================================
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
            # Different doctor on same date is allowed.
            # =================================================

            existing_patient_doctor = Appointment.objects.filter(
                patient=self.patient,
                doctor=doctor,
                appointment_date=appointment_date
            ).exclude(
                status="Cancelled"
            )

            # Don't compare an appointment with itself
            # when editing an existing appointment.
            if self.instance and self.instance.pk:

                existing_patient_doctor = (
                    existing_patient_doctor.exclude(
                        pk=self.instance.pk
                    )
                )

            if existing_patient_doctor.exists():

                raise forms.ValidationError(
                    "This patient already has an appointment with the selected doctor on this date."
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
        # This applies regardless of patient.
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

            # Don't compare an appointment with itself
            # when editing an existing appointment.
            if self.instance and self.instance.pk:

                existing_slot = existing_slot.exclude(
                    pk=self.instance.pk
                )

            if existing_slot.exists():

                raise forms.ValidationError(
                    "This time slot is already booked for the selected doctor."
                )

        return cleaned_data


class ConsultationBillForm(forms.ModelForm):

    class Meta:
        model = ConsultationBill

        fields = [
            "registration_fee",
            "consultation_fee",
            "payment_status",
        ]

