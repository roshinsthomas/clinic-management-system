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

    medicine_name = serializers.CharField(
        source='medicine.name',
        read_only=True
    )

    class Meta:
        model = MedicinePrescription
        fields = [
            'prescription_id',
            'consultation',
            'medicine',
            'medicine_name',
            'dosage',
            'frequency',
            'duration',
            'quantity',
            'dispensed_status',
        ]


class MedicineBillSerializer(serializers.ModelSerializer):

    class Meta:
        model = MedicineBill
        fields = '__all__'

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

    doctor_name = serializers.CharField(
        source='doctor.username',
        read_only=True
    )

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