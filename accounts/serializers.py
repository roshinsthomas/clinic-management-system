from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import Department, Staff


# ============================================================
# DEPARTMENT SERIALIZER
# ============================================================

class DepartmentSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        max_length=100,
        error_messages={
            'blank': 'Department name cannot be empty.'
        }
    )

    class Meta:
        model = Department
        fields = [
            'department_id',
            'department_name',
            'status'
        ]

    def validate_department_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Department name cannot be empty."
            )

        queryset = Department.objects.filter(
            department_name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A department with this name already exists."
            )

        return value


# ============================================================
# STAFF SERIALIZER
# ============================================================

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

    # --------------------------------------------------------
    # CREATE STAFF
    # --------------------------------------------------------

    def create(self, validated_data):

        user_data = validated_data.pop('user')

        password = validated_data.pop(
            'password',
            None
        )

        # Username validation
        username = user_data.get('username', '').strip()

        if not username:
            raise serializers.ValidationError({
                'username': 'Username is required.'
            })

        # Password validation
        if not password:
            raise serializers.ValidationError({
                'password': 'Password is required.'
            })

        # Check username already exists
        if User.objects.filter(
            username__iexact=username
        ).exists():

            raise serializers.ValidationError({
                'username': 'A user with this username already exists.'
            })

        # Validate password using Django validators
        validate_password(
            password,
            user=None
        )

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=user_data.get(
                'first_name',
                ''
            ).strip(),
            last_name=user_data.get(
                'last_name',
                ''
            ).strip()
        )

        staff = Staff.objects.create(
            user=user,
            **validated_data
        )

        return staff

    # --------------------------------------------------------
    # UPDATE STAFF
    # --------------------------------------------------------

    def update(self, instance, validated_data):

        user_data = validated_data.pop(
            'user',
            None
        )

        if user_data:

            user = instance.user

            username = user_data.get(
                'username',
                user.username
            ).strip()

            if not username:
                raise serializers.ValidationError({
                    'username': 'Username cannot be empty.'
                })

            # Check username belongs to another user
            if User.objects.filter(
                username__iexact=username
            ).exclude(
                pk=user.pk
            ).exists():

                raise serializers.ValidationError({
                    'username': (
                        'A user with this username already exists.'
                    )
                })

            user.username = username

            user.first_name = user_data.get(
                'first_name',
                user.first_name
            ).strip()

            user.last_name = user_data.get(
                'last_name',
                user.last_name
            ).strip()

            user.save()

        # ----------------------------------------------------
        # PASSWORD UPDATE
        # ----------------------------------------------------

        password = validated_data.pop(
            'password',
            None
        )

        if password:

            validate_password(
                password,
                user=instance.user
            )

            instance.user.set_password(password)
            instance.user.save()

        return super().update(
            instance,
            validated_data
        )

    # --------------------------------------------------------
    # PHONE VALIDATION
    # --------------------------------------------------------

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


# ============================================================
# LOGIN SERIALIZER
# ============================================================

class LoginSerializer(serializers.Serializer):

    username = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        error_messages={
            'required': 'Username is required.',
            'blank': 'Username is required.'
        }
    )

    password = serializers.CharField(
        required=True,
        write_only=True,
        allow_blank=False,
        trim_whitespace=False,
        error_messages={
            'required': 'Password is required.',
            'blank': 'Password is required.'
        }
    )

    # --------------------------------------------------------
    # LOGIN VALIDATION
    # --------------------------------------------------------

    def validate(self, data):

        username = data.get('username')
        password = data.get('password')

        # Remove spaces around username
        username = username.strip()

        if not username:

            raise serializers.ValidationError({
                'username': 'Username is required.'
            })

        if not password:

            raise serializers.ValidationError({
                'password': 'Password is required.'
            })

        # Authenticate user
        user = authenticate(
            username=username,
            password=password
        )

        if user is None:

            raise serializers.ValidationError(
                "Invalid username or password."
            )

        # Check Staff account
        try:

            staff = Staff.objects.get(
                user=user
            )

        except Staff.DoesNotExist:

            raise serializers.ValidationError(
                "No staff account is associated with this user."
            )

        # Check account status
        if not staff.status:

            raise serializers.ValidationError(
                "This staff account is inactive."
            )

        data['user'] = user
        data['staff'] = staff

        return data