from rest_framework import serializers

from .models import LabTest, LabResult, LabBill


class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = '__all__'


class LabResultSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabResult
        fields = '__all__'


class LabBillSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabBill
        fields = '__all__'