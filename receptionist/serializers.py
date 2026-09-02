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
            "appointment_type",
            "token_no",
            "status",
        ]

        read_only_fields = [
            "appointment_id",
            "token_no",
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

        read_only_fields = [
            "bill_id",
            "consultation_fee",
            "total_amount",
        ]

    def validate(self, data):

        appointment = data.get("appointment")

        if appointment:

            if appointment.patient_id != data["patient"].patient_id:
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

    def create(self, validated_data):

        appointment = validated_data["appointment"]

        registration_fee = validated_data.get(
            "registration_fee",
            0
        )

        consultation_fee = appointment.doctor.consultation_fee

        total_amount = (
            registration_fee
            + consultation_fee
        )

        validated_data["consultation_fee"] = consultation_fee
        validated_data["total_amount"] = total_amount

        return ConsultationBill.objects.create(
            **validated_data
        )

    def update(self, instance, validated_data):

        appointment = validated_data.get(
            "appointment",
            instance.appointment
        )

        registration_fee = validated_data.get(
            "registration_fee",
            instance.registration_fee
        )

        consultation_fee = appointment.doctor.consultation_fee

        if consultation_fee is None:
            raise serializers.ValidationError(
                "The selected doctor does not have a consultation fee."
            )

        total_amount = (
            registration_fee
            + consultation_fee
        )

        validated_data["consultation_fee"] = consultation_fee
        validated_data["total_amount"] = total_amount

        return super().update(
            instance,
            validated_data
        )