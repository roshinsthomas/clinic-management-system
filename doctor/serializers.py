from rest_framework import serializers

from .models import (
    Consultation,
    MedicinePrescription,
    LabPrescription,
)


class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = "__all__"


class MedicinePrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicinePrescription
        fields = "__all__"


class LabPrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabPrescription
        fields = "__all__"