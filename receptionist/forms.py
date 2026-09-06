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

    def clean_phone(self):
        phone = self.cleaned_data["phone"]

        if Patient.objects.filter(
            phone=phone,
            status="Active"
        ).exists():
            raise forms.ValidationError(
                "A patient with this phone number already exists."
            )

        return phone


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

        # Doctor must belong to selected department
        if doctor and department:
            if doctor.department_id != department.department_id:
                raise forms.ValidationError(
                    "The selected doctor does not belong to the selected department."
                )

        # Appointment date validation
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
                days_ahead = (appointment_date - today).days

                if days_ahead < 2:
                    raise forms.ValidationError(
                        "Prior Booking can be made only from the day after tomorrow."
                    )

                if days_ahead > 30:
                    raise forms.ValidationError(
                        "Prior Booking can be made only within 30 days ahead."
                    )

        # Walk-in time must be strictly in the future.
        if (
            appointment_type == "WALK_IN"
            and appointment_date == today
            and appointment_time
        ):
            if appointment_time <= timezone.localtime().time():
                raise forms.ValidationError(
                    "The selected walk-in appointment time has already passed. Please select another available time."
                )

        # Doctor time-slot availability
        if doctor and appointment_date and appointment_time:
            if Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status__iexact="Scheduled"
            ).exists():
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