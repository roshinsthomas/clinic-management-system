from rest_framework import serializers
from .models import Medicine, MedicineBill
from doctor.models import MedicinePrescription


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
            'dispensed_status',
        ]


class MedicineBillSerializer(serializers.ModelSerializer):

    class Meta:
        model = MedicineBill
        fields = '__all__'