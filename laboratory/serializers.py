from rest_framework import serializers
import re
from .models import LabTest, LabResult, LabBill
from doctor.models import LabPrescription


class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = [
            "id",
            "test_name",
            "department",
            "unit",
            "sample_required",
            "normal_range",
            "price",
            "status", 
        ]
        read_only_fields = ["id"]

    def validate_test_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Test name is required."
            )

        if not all(
            character.isalpha() or character in " -'"
            for character in value
        ):
            raise serializers.ValidationError(
                "Test name can contain only letters."
            )

        queryset = LabTest.objects.filter(
            test_name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A lab test with this name already exists."
            )

        return value

    def validate_department(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Department is required."
            )

        # Department should contain meaningful text, not only numbers/symbols.
        if not any(character.isalpha() for character in value):
            raise serializers.ValidationError(
                "Department must contain letters."
            )

        return value


    def validate_unit(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Unit is required."
            )

        # Allows units alone (mg/dL) or a numeric value with a unit
        # (40 mg/dL, 5.5 mmol/L, 100 ng/mL).
        if not re.fullmatch(
            r"(\d+(\.\d+)?\s+)?[A-Za-zµ/%]+(/[A-Za-zµ]+)?",
            value
        ):
            raise serializers.ValidationError(
                "Enter a valid unit, for example mg/dL or 40 mg/dL."
            )

        return value


    def validate_sample_required(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Sample required is required."
            )

        # Examples: Blood, Urine, Serum.
        if not any(character.isalpha() for character in value):
            raise serializers.ValidationError(
                "Sample required must contain letters."
            )

        return value


    def validate_normal_range(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Normal range is required."
            )

        # Allow values such as 70-100, <5, >10, 3.5-7.2, Normal.
        if not re.fullmatch(
            r"[A-Za-z0-9<>=.%/\-\s]+",
            value
        ):
            raise serializers.ValidationError(
                "Enter a valid normal range."
            )

        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than 0."
            )

        return value


class LabPrescriptionSerializer(serializers.ModelSerializer):

    test_name = serializers.CharField(
        source='lab_test.test_name',
        read_only=True
    )

    department = serializers.CharField(
        source='lab_test.department',
        read_only=True
    )

    sample_required = serializers.CharField(
        source='lab_test.sample_required',
        read_only=True
    )

    normal_range = serializers.CharField(
        source='lab_test.normal_range',
        read_only=True
    )

    price = serializers.DecimalField(
        source='lab_test.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    patient_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = LabPrescription
        fields = [
            'lab_prescription_id',
            'consultation',
            'lab_test',
            'test_name',
            'department',
            'sample_required',
            'normal_range',
            'price',
            'status',
            'patient_name',
            'doctor_name',
        ]

    def get_patient_name(self, obj):

        appointment = obj.consultation.appointment
        patient = appointment.patient

        return f"{patient.first_name} {patient.last_name}"

    def get_doctor_name(self, obj):

        doctor = obj.consultation.appointment.doctor

        return doctor.user.get_full_name()


class LabResultSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()

    test_name = serializers.CharField(
        source='lab_prescription.lab_test.test_name',
        read_only=True
    )

    department = serializers.CharField(
        source='lab_prescription.lab_test.department',
        read_only=True
    )

    sample_required = serializers.CharField(
        source='lab_prescription.lab_test.sample_required',
        read_only=True
    )

    normal_range = serializers.CharField(
        source='lab_prescription.lab_test.normal_range',
        read_only=True
    )

    doctor_name = serializers.SerializerMethodField()

    tested_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LabResult

        fields = [
            'result_id',
            'lab_prescription',
            'patient_name',
            'test_name',
            'department',
            'sample_required',
            'normal_range',
            'doctor_name',
            'result_value',
            'tested_by',
            'tested_by_name',
            'report_date',
            'emailed_status',
        ]

        read_only_fields = [
            'result_id',
            'tested_by',
            'report_date',
            'emailed_status',
        ]

    def get_patient_name(self, obj):

        appointment = (
            obj.lab_prescription
            .consultation
            .appointment
        )

        patient = appointment.patient

        return f"{patient.first_name} {patient.last_name}"

    def get_doctor_name(self, obj):

        doctor = (
            obj.lab_prescription
            .consultation
            .appointment
            .doctor
        )

        return doctor.user.get_full_name()

    def get_tested_by_name(self, obj):

        user = obj.tested_by.user

        return user.get_full_name()


class LabBillSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabBill
        fields = '__all__'