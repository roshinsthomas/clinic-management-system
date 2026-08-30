from rest_framework import serializers
from .models import Medicine,MedicineBill


class MedicineSerializer(serializers.ModelSerializer):

    class Meta:

        model = Medicine
        fields = '__all__'

    def validate(self, data):
        manufacture_date = data.get('manufacture_date')
        expiry_date = data.get('expiry_date')
        price = data.get('price_per_unit')

        if manufacture_date and expiry_date:
            if expiry_date <= manufacture_date:
                raise serializers.ValidationError(
                    "Expiry date must be after manufacture date."
                )

        if price is not None and price < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return data

class MedicineBillSerializer(serializers.ModelSerializer):

    class Meta:
        model = MedicineBill
        fields = '__all__'
        read_only_fields = ['total_amount', 'bill_date']

    def validate(self, data):

        if data.get('quantity', 0) <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero."
            )

        return data