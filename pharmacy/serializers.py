from rest_framework import serializers
from .models import Medicine, MedicineBill
from doctor.models import MedicinePrescription
from receptionist.models import Patient,Appointment


class MedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine
        fields = '__all__'


class MedicineStockSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine
        fields = ['stock_quantity']


class MedicinePrescriptionSerializer(serializers.ModelSerializer):

    medicine_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    def get_medicine_name(self, obj):
        if obj.medicine:
            return obj.medicine.name

        if obj.other_medicine_name:
            return obj.other_medicine_name

        return "-"

    def get_doctor_name(self, obj):
        appointment = obj.consultation.appointment

        if appointment.doctor and appointment.doctor.user:
            return (
                appointment.doctor.user.get_full_name()
                or appointment.doctor.user.username
            )

        return "-"

    class Meta:
        model = MedicinePrescription

        fields = [
            'prescription_id',
            'consultation',
            'medicine',
            'medicine_name',
            'other_medicine_name',
            'other_medicine_type',
            'dosage',
            'frequency',
            'duration',
            'quantity',
            'dispensed_status',
        ]


class MedicineBillSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    appointment_id = serializers.IntegerField(
        source="prescription.consultation.appointment.appointment_id",
        read_only=True
    )

    dispensed_status = serializers.CharField(
        source="prescription.dispensed_status",
        read_only=True
    )

    def get_patient_name(self, obj):
        try:
            patient = obj.prescription.consultation.appointment.patient

            return (
                f"{patient.first_name} {patient.last_name}"
            ).strip()

        except AttributeError:
            return "-"

    def get_doctor_name(self, obj):
        try:
            doctor = obj.prescription.consultation.appointment.doctor

            if doctor and doctor.user:
                return (
                    doctor.user.get_full_name()
                    or doctor.user.username
                )

            return "-"

        except AttributeError:
            return "-"

    class Meta:
        model = MedicineBill

        fields = [
            "id",
            "bill_number",
            "patient_name",
            "doctor_name",
            "appointment_id",
            "medicine_name",
            "quantity",
            "price_per_unit",
            "gst_percentage",
            "gst_amount",
            "total_amount",
            "bill_date",
            "dispensed_status",
        ]
class DispenseMedicineSerializer(serializers.Serializer):

    prescription_id = serializers.IntegerField()

    def validate_prescription_id(self, value):

        try:
            prescription = MedicinePrescription.objects.get(
                prescription_id=value
            )
        except MedicinePrescription.DoesNotExist:
            raise serializers.ValidationError(
                "Prescription not found."
            )

        if prescription.dispensed_status != 'PENDING':
            raise serializers.ValidationError(
                "This prescription has already been issued."
            )
        if prescription.medicine is None:
            raise serializers.ValidationError(
                "Outside medicines cannot be dispensed by the clinic pharmacy."
    )

        if prescription.quantity <= 0:
            raise serializers.ValidationError(
                "Invalid prescription quantity."
            )

        if prescription.medicine.stock_quantity < prescription.quantity:
            raise serializers.ValidationError(
                "Insufficient medicine stock."
            )

        return value
class PatientSearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient
        fields = [
            'patient_id',
            'first_name',
            'last_name',
            'phone',
            'email',
        ]
class PharmacyAppointmentSerializer(serializers.ModelSerializer):

    doctor_name = serializers.SerializerMethodField()

    def get_doctor_name(self, obj):
        if obj.doctor and obj.doctor.user:
            return obj.doctor.user.get_full_name() or obj.doctor.user.username

        return "-"

    class Meta:
        model = Appointment
        fields = [
            'appointment_id',
            'patient',
            'doctor',
            'doctor_name',
            'department',
            'appointment_date',
            'appointment_time',
            'token_no',
            'status',
        ]