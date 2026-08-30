from django import forms
from .models import Patient, Appointment


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
        ]