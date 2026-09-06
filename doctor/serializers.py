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

    def validate(self, data):
        # Clinic medicines must have stock available before being prescribed.
        medicine = data.get("medicine")

        if medicine and medicine.stock_quantity == 0:
            raise serializers.ValidationError(
                {
                    "medicine": (
                        f"{medicine.name} is out of stock."
                    )
                }
            )

        return data


class LabPrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabPrescription
        fields = "__all__"