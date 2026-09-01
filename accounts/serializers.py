from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Department,Staff
from django.contrib.auth import authenticate

class DepartmentSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        max_length=100,
        error_messages={
            'blank': 'Department name cannot be empty.'
        }
    )

    class Meta:
        model = Department
        fields = ['department_id', 'department_name', 'status']

    def validate_department_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Department name cannot be empty."
            )

        if Department.objects.filter(department_name__iexact=value).exists():
            raise serializers.ValidationError(
                "A department with this name already exists."
            )

        return value
    
class StaffSerializer(serializers.ModelSerializer):

    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)

    class Meta:
        model = Staff
        fields = [
            'staff_id',
            'username',
            'password',
            'first_name',
            'last_name',
            'dob',
            'gender',
            'phone',
            'address',
            'role',
            'department',
            'specialization',
            'consultation_fee',
            'status'
        ]

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        staff = Staff.objects.create(
            user=user,
            **validated_data
        )

        return staff
    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
            "Phone number must contain only digits."
        )

        if len(value) != 10:
            raise serializers.ValidationError(
            "Phone number must be exactly 10 digits."
        )

        return value
class LoginSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        try:
            staff = Staff.objects.get(user=user)
        except Staff.DoesNotExist:
            raise serializers.ValidationError(
                "No staff account is associated with this user."
            )

        if not staff.status:
            raise serializers.ValidationError(
                "This staff account is inactive."
            )

        data['user'] = user
        data['staff'] = staff

        return data