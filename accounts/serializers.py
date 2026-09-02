from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Department, Staff
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

        queryset = Department.objects.filter(
            department_name__iexact=value
        )

        # When updating, exclude the current department
        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A department with this name already exists."
            )

        return value


class StaffSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username'
    )

    first_name = serializers.CharField(
        source='user.first_name'
    )

    last_name = serializers.CharField(
        source='user.last_name'
    )

    password = serializers.CharField(
        write_only=True,
        required=False
    )

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
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=user_data['username'],
            password=password,
            first_name=user_data['first_name'],
            last_name=user_data['last_name']
        )

        staff = Staff.objects.create(
            user=user,
            **validated_data
        )

        return staff

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)

        if user_data:
            user = instance.user

            user.username = user_data.get(
                'username',
                user.username
            )

            user.first_name = user_data.get(
                'first_name',
                user.first_name
            )

            user.last_name = user_data.get(
                'last_name',
                user.last_name
            )

            user.save()

        password = validated_data.pop(
            'password',
            None
        )

        if password:
            instance.user.set_password(password)
            instance.user.save()

        return super().update(
            instance,
            validated_data
        )

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