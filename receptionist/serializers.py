from rest_framework import serializers

from .models import Patient, Appointment, ConsultationBill
from accounts.models import Staff, Department


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
            "token_no",
            "status",
        ]

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

    def validate(self, data):
        doctor = data.get("doctor")
        department = data.get("department")

        if doctor and department:
            if doctor.department_id != department.department_id:
                raise serializers.ValidationError(
                    "The selected doctor does not belong to the selected department."
                )

        return data


class ConsultationBillSerializer(serializers.ModelSerializer):

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

    def validate(self, data):
        appointment = data.get("appointment")

        if appointment:
            if appointment.patient_id != data["patient"].patient_id:
                raise serializers.ValidationError(
                    "The bill patient must match the appointment patient."
                )

        return data