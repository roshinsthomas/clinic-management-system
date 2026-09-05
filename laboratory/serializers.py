from rest_framework import serializers

from .models import LabTest, LabResult, LabBill
from doctor.models import LabPrescription


class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = '__all__'


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