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
        source='user.username',
        required=True,
        allow_blank=False
    )

    email = serializers.EmailField(
        source='user.email',
        required=True,
        allow_blank=False
    )

    first_name = serializers.CharField(
        source='user.first_name',
        required=True,
        allow_blank=False
    )

    last_name = serializers.CharField(
        source='user.last_name',
        required=True,
        allow_blank=False
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False
    )

    class Meta:
        model = Staff

        fields = [
            'staff_id',
            'username',
            'email',
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

        read_only_fields = [
            'staff_id'
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

        username = user_data.get(
            'username',
            ''
        ).strip()

        email = user_data.get(
            'email',
            ''
        ).strip().lower()

        first_name = user_data.get(
            'first_name',
            ''
        ).strip()

        last_name = user_data.get(
            'last_name',
            ''
        ).strip()

        # Username
        if not username:
            raise serializers.ValidationError({
                'username': 'Username is required.'
            })

        # Email
        if not email:
            raise serializers.ValidationError({
                'email': 'Email is required.'
            })

        # First name
        if not first_name:
            raise serializers.ValidationError({
                'first_name': 'First name is required.'
            })

        # Last name
        if not last_name:
            raise serializers.ValidationError({
                'last_name': 'Last name is required.'
            })

        # Password
        if not password:
            raise serializers.ValidationError({
                'password': 'Password is required.'
            })

        # ----------------------------------------------------
        # NAME VALIDATION
        # ----------------------------------------------------

        if not all(
            character.isalpha() or character in " -'"
            for character in first_name
        ):
            raise serializers.ValidationError({
                'first_name':
                    'First name can contain only letters.'
            })

        if not all(
            character.isalpha() or character in " -'"
            for character in last_name
        ):
            raise serializers.ValidationError({
                'last_name':
                    'Last name can contain only letters.'
            })

        # ----------------------------------------------------
        # USERNAME DUPLICATE CHECK
        # ----------------------------------------------------

        if User.objects.filter(
            username__iexact=username
        ).exists():

            raise serializers.ValidationError({
                'username':
                    'A user with this username already exists.'
            })

        # ----------------------------------------------------
        # EMAIL DUPLICATE CHECK
        # ----------------------------------------------------

        if User.objects.filter(
            email__iexact=email
        ).exists():

            raise serializers.ValidationError({
                'email':
                    'A user with this email already exists.'
            })

        # ----------------------------------------------------
        # PASSWORD VALIDATION
        # ----------------------------------------------------

        validate_password(
            password,
            user=None
        )

        # ----------------------------------------------------
        # CREATE USER
        # ----------------------------------------------------

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # ----------------------------------------------------
        # CREATE STAFF
        # ----------------------------------------------------

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

        user = instance.user

        if user_data:

            # ------------------------------------------------
            # USERNAME
            # ------------------------------------------------

            username = user_data.get(
                'username',
                user.username
            ).strip()

            if not username:
                raise serializers.ValidationError({
                    'username':
                        'Username cannot be empty.'
                })

            if User.objects.filter(
                username__iexact=username
            ).exclude(
                pk=user.pk
            ).exists():

                raise serializers.ValidationError({
                    'username':
                        'A user with this username already exists.'
                })

            user.username = username

            # ------------------------------------------------
            # EMAIL
            # ------------------------------------------------

            email = user_data.get(
                'email',
                user.email
            ).strip().lower()

            if not email:
                raise serializers.ValidationError({
                    'email':
                        'Email cannot be empty.'
                })

            if User.objects.filter(
                email__iexact=email
            ).exclude(
                pk=user.pk
            ).exists():

                raise serializers.ValidationError({
                    'email':
                        'A user with this email already exists.'
                })

            user.email = email

            # ------------------------------------------------
            # FIRST NAME
            # ------------------------------------------------

            first_name = user_data.get(
                'first_name',
                user.first_name
            ).strip()

            if not first_name:
                raise serializers.ValidationError({
                    'first_name':
                        'First name cannot be empty.'
                })

            if not all(
                character.isalpha() or character in " -'"
                for character in first_name
            ):
                raise serializers.ValidationError({
                    'first_name':
                        'First name can contain only letters.'
                })

            user.first_name = first_name

            # ------------------------------------------------
            # LAST NAME
            # ------------------------------------------------

            last_name = user_data.get(
                'last_name',
                user.last_name
            ).strip()

            if not last_name:
                raise serializers.ValidationError({
                    'last_name':
                        'Last name cannot be empty.'
                })

            if not all(
                character.isalpha() or character in " -'"
                for character in last_name
            ):
                raise serializers.ValidationError({
                    'last_name':
                        'Last name can contain only letters.'
                })

            user.last_name = last_name

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

        # ----------------------------------------------------
        # UPDATE STAFF MODEL
        # ----------------------------------------------------

        return super().update(
            instance,
            validated_data
        )

    # --------------------------------------------------------
    # PHONE VALIDATION
    # --------------------------------------------------------

    def validate_phone(self, value):

        value = value.strip()

        if not value.isdigit():

            raise serializers.ValidationError(
                'Phone number must contain only digits.'
            )

        if len(value) != 10:

            raise serializers.ValidationError(
                'Phone number must be exactly 10 digits.'
            )

        return value

    # --------------------------------------------------------
    # DOB VALIDATION
    # --------------------------------------------------------

    def validate_dob(self, value):

        from datetime import date

        if value >= date.today():

            raise serializers.ValidationError(
                'Date of birth must be in the past.'
            )

        return value

    # --------------------------------------------------------
    # ADDRESS VALIDATION
    # --------------------------------------------------------

    def validate_address(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                'Address is required.'
            )

        return value

    # --------------------------------------------------------
    # ROLE VALIDATION
    # --------------------------------------------------------

    def validate_role(self, value):

        allowed_roles = {
            'ADMIN',
            'RECEPTIONIST',
            'DOCTOR',
            'PHARMACIST',
            'LAB_TECHNICIAN'
        }

        if value not in allowed_roles:

            raise serializers.ValidationError(
                'Invalid staff role.'
            )

        return value

    # --------------------------------------------------------
    # CONSULTATION FEE VALIDATION
    # --------------------------------------------------------

    def validate_consultation_fee(self, value):

        if value is not None and value < 0:

            raise serializers.ValidationError(
                'Consultation fee cannot be negative.'
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