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

        if doctor and department:
            if doctor.department_id != department.department_id:
                raise forms.ValidationError(
                    "The selected doctor does not belong to the selected department."
                )

        if appointment_date:
            today = timezone.localdate()

            if appointment_date < today:
                raise forms.ValidationError(
                    "Appointment date cannot be in the past."
                )

            if appointment_date > today:
                if (appointment_date - today).days < 2:
                    raise forms.ValidationError(
                        "Prior Booking requires at least 2 days advance notice."
                    )

        if doctor and appointment_date and appointment_time:
            if Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status="Scheduled"
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