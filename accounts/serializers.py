from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from datetime import date
from rest_framework import serializers

from .models import Department, Staff, Medicine
from laboratory.models import LabTest
from pharmacy.models import Medicine as PharmacyMedicine


# =========================================================
# DEPARTMENT SERIALIZER
# =========================================================

class DepartmentSerializer(serializers.ModelSerializer):

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
                department_id=self.instance.department_id
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Department already exists."
            )

        return value


# =========================================================
# CUSTOM STAFF DEPARTMENT FIELD
# =========================================================

class StaffDepartmentField(serializers.RelatedField):

    queryset = Department.objects.all()

    def to_internal_value(self, data):

        # Empty department is allowed
        if data is None or str(data).strip() == "":
            return None

        data = str(data).strip()

        # Department ID
        if data.isdigit():
            try:
                return Department.objects.get(
                    department_id=int(data)
                )
            except Department.DoesNotExist:
                raise serializers.ValidationError(
                    "Invalid department."
                )

        # Department name
        department = Department.objects.filter(
            department_name__iexact=data
        ).first()

        if department is None:
            raise serializers.ValidationError(
                "Department does not exist."
            )

        return department

    def to_representation(self, value):

        if value is None:
            return None

        return value.department_id


# =========================================================
# STAFF SERIALIZER
# =========================================================

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

    department = StaffDepartmentField(
        required=False,
        allow_null=True
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

    # -----------------------------------------------------
    # OBJECT VALIDATION
    # -----------------------------------------------------

    def validate(self, attrs):

        user_data = attrs.get('user', {})

        username = user_data.get(
            'username',
            ''
        ).strip()

        email = user_data.get(
            'email',
            ''
        ).strip().lower()

        # Username duplicate check
        if username:

            queryset = User.objects.filter(
                username__iexact=username
            )

            if self.instance:
                queryset = queryset.exclude(
                    pk=self.instance.user.pk
                )

            if queryset.exists():
                raise serializers.ValidationError({
                    'username':
                        'A user with this username already exists.'
                })

        # Email duplicate check
        if email:

            queryset = User.objects.filter(
                email__iexact=email
            )

            if self.instance:
                queryset = queryset.exclude(
                    pk=self.instance.user.pk
                )

            if queryset.exists():
                raise serializers.ValidationError({
                    'email':
                        'A user with this email already exists.'
                })

        return attrs

    # -----------------------------------------------------
    # PASSWORD VALIDATION
    # -----------------------------------------------------

    def validate_password(self, value):

        if not value:
            raise serializers.ValidationError(
                'Password is required.'
            )

        try:
            validate_password(
                value,
                user=None
            )

        except DjangoValidationError as e:
            raise serializers.ValidationError(
                list(e.messages)
            )

        return value

    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

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

        # Username required
        if not username:
            raise serializers.ValidationError({
                'username':
                    'Username is required.'
            })

        # Email required
        if not email:
            raise serializers.ValidationError({
                'email':
                    'Email is required.'
            })

        # First name required
        if not first_name:
            raise serializers.ValidationError({
                'first_name':
                    'First name is required.'
            })

        # Last name required
        if not last_name:
            raise serializers.ValidationError({
                'last_name':
                    'Last name is required.'
            })

        # Password required
        if not password:
            raise serializers.ValidationError({
                'password':
                    'Password is required.'
            })

        # First name validation
        if not all(
            character.isalpha() or character in " -'"
            for character in first_name
        ):
            raise serializers.ValidationError({
                'first_name':
                    'First name can contain only letters.'
            })

        # Last name validation
        if not all(
            character.isalpha() or character in " -'"
            for character in last_name
        ):
            raise serializers.ValidationError({
                'last_name':
                    'Last name can contain only letters.'
            })

        # Duplicate username
        if User.objects.filter(
            username__iexact=username
        ).exists():

            raise serializers.ValidationError({
                'username':
                    'A user with this username already exists.'
            })

        # Duplicate email
        if User.objects.filter(
            email__iexact=email
        ).exists():

            raise serializers.ValidationError({
                'email':
                    'A user with this email already exists.'
            })

        # Password has already been validated
        # in validate_password()

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        staff = Staff.objects.create(
            user=user,
            **validated_data
        )

        return staff

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    def update(self, instance, validated_data):

        user_data = validated_data.pop(
            'user',
            None
        )

        user = instance.user

        if user_data:

            # Username
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

            # Email
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

            # First name
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

            # Last name
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

        # Password update
        password = validated_data.pop(
            'password',
            None
        )

        if password:

            try:
                validate_password(
                    password,
                    user=instance.user
                )

            except DjangoValidationError as e:
                raise serializers.ValidationError({
                    'password':
                        list(e.messages)
                })

            instance.user.set_password(password)
            instance.user.save()

        return super().update(
            instance,
            validated_data
        )

    # -----------------------------------------------------
    # PHONE VALIDATION
    # -----------------------------------------------------

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

        if value[0] not in '6789':
            raise serializers.ValidationError(
                'Phone number must start with 6, 7, 8, or 9.'
            )

        # Duplicate phone check
        queryset = Staff.objects.filter(
            phone=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                'A staff member with this phone number already exists.'
            )

        return value

    # -----------------------------------------------------
    # DOB VALIDATION
    # -----------------------------------------------------

    def validate_dob(self, value):

        from datetime import date

        today = date.today()

        age = today.year - value.year

        if (
            today.month,
            today.day
        ) < (
            value.month,
            value.day
        ):
            age -= 1

        if age < 18:
            raise serializers.ValidationError(
                'Staff must be at least 18 years old.'
            )

        return value

    # -----------------------------------------------------
    # ADDRESS VALIDATION
    # -----------------------------------------------------

    def validate_address(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Address is required.'
            )

        return value

    # -----------------------------------------------------
    # ROLE VALIDATION
    # -----------------------------------------------------

    def validate_role(self, value):

        allowed_roles = {
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

    # -----------------------------------------------------
    # CONSULTATION FEE VALIDATION
    # -----------------------------------------------------

    def validate_consultation_fee(self, value):

        if value is not None and value < 0:
            raise serializers.ValidationError(
                'Consultation fee cannot be negative.'
            )

        return value


# =========================================================
# DOCTOR SERIALIZER
# =========================================================

class DoctorSerializer(StaffSerializer):

    role = serializers.CharField(
        read_only=True
    )

    department_name = serializers.CharField(
        source='department.department_name',
        read_only=True,
        allow_null=True
    )

    class Meta(StaffSerializer.Meta):

        fields = StaffSerializer.Meta.fields + [
            'department_name'
        ]

    def validate(self, attrs):

        user_data = attrs.get(
            'user',
            {}
        )

        username = user_data.get(
            'username',
            ''
        ).strip()

        email = user_data.get(
            'email',
            ''
        ).strip().lower()

        # Username duplicate check
        if username:

            queryset = User.objects.filter(
                username__iexact=username
            )

            if self.instance:
                queryset = queryset.exclude(
                    pk=self.instance.user.pk
                )

            if queryset.exists():
                raise serializers.ValidationError({
                    'username':
                        'A user with this username already exists.'
                })

        # Email duplicate check
        if email:

            queryset = User.objects.filter(
                email__iexact=email
            )

            if self.instance:
                queryset = queryset.exclude(
                    pk=self.instance.user.pk
                )

            if queryset.exists():
                raise serializers.ValidationError({
                    'email':
                        'A user with this email already exists.'
                })

        # CREATE
        if self.instance is None:

            if not attrs.get(
                'specialization'
            ):
                raise serializers.ValidationError({
                    'specialization':
                        'Specialization is required.'
                })

            if attrs.get(
                'department'
            ) is None:
                raise serializers.ValidationError({
                    'department':
                        'Department is required.'
                })

            if attrs.get(
                'consultation_fee'
            ) is None:
                raise serializers.ValidationError({
                    'consultation_fee':
                        'Consultation fee is required.'
                })

        # UPDATE
        else:

            specialization = attrs.get(
                'specialization',
                self.instance.specialization
            )

            department = attrs.get(
                'department',
                self.instance.department
            )

            consultation_fee = attrs.get(
                'consultation_fee',
                self.instance.consultation_fee
            )

            if not specialization:
                raise serializers.ValidationError({
                    'specialization':
                        'Specialization is required.'
                })

            if department is None:
                raise serializers.ValidationError({
                    'department':
                        'Department is required.'
                })

            if not department.status:
                raise serializers.ValidationError({
                    'department':
                        'Selected department is inactive.'
                })

            if consultation_fee is None:
                raise serializers.ValidationError({
                    'consultation_fee':
                        'Consultation fee is required.'
                })

            if consultation_fee <= 0:
                raise serializers.ValidationError({
                    'consultation_fee':
                        'Consultation fee must be greater than 0.'
                })

        return attrs

    # -----------------------------------------------------
    # CREATE DOCTOR
    # -----------------------------------------------------

    def create(self, validated_data):

        validated_data['role'] = 'DOCTOR'

        return super().create(
            validated_data
        )

    # -----------------------------------------------------
    # UPDATE DOCTOR
    # -----------------------------------------------------

    def update(self, instance, validated_data):

        validated_data['role'] = 'DOCTOR'

        return super().update(
            instance,
            validated_data
        )

    # -----------------------------------------------------
    # DOCTOR PHONE VALIDATION
    # -----------------------------------------------------

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

        if value[0] not in '6789':
            raise serializers.ValidationError(
                'Phone number must start with 6, 7, 8, or 9.'
            )

        queryset = Staff.objects.filter(
            phone=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                'A staff member with this phone number already exists.'
            )

        return value

    # -----------------------------------------------------
    # SPECIALIZATION
    # -----------------------------------------------------

    def validate_specialization(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Specialization is required.'
            )

        return value

    # -----------------------------------------------------
    # CONSULTATION FEE
    # -----------------------------------------------------

    def validate_consultation_fee(self, value):

        if value is None:
            raise serializers.ValidationError(
                'Consultation fee is required.'
            )

        if value <= 0:
            raise serializers.ValidationError(
                'Consultation fee must be greater than 0.'
            )

        return value

    # -----------------------------------------------------
    # DEPARTMENT
    # -----------------------------------------------------

    def validate_department(self, value):

        if value is None:
            raise serializers.ValidationError(
                'Department is required.'
            )

        if not value.status:
            raise serializers.ValidationError(
                'Selected department is inactive.'
            )

        return value


# =========================================================
# MEDICINE SERIALIZER
# =========================================================

class MedicineSerializer(serializers.ModelSerializer):

    medicine_id = serializers.IntegerField(
        source='id',
        read_only=True
    )

    medicine_name = serializers.CharField(
        source='name'
    )

    medicine_type = serializers.CharField(
        source='type'
    )

    class Meta:

        model = PharmacyMedicine

        fields = [
            'medicine_id',
            'medicine_name',
            'medicine_type',
            'manufacturer',
            'batch_number',
            'manufacture_date',
            'expiry_date',
            'price_per_unit',
            'stock_quantity',
        ]

        read_only_fields = [
            'medicine_id'
        ]

    # -----------------------------------------------------
    # MEDICINE NAME
    # -----------------------------------------------------

    def validate_medicine_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Medicine name is required.'
            )

        # Letters + numbers + spaces + hyphens + apostrophes
        if not all(
            character.isalnum() or character in " -'"
            for character in value
        ):
            raise serializers.ValidationError(
                'Medicine name can contain only letters, numbers, spaces, hyphens and apostrophes.'
            )

        return value

    # -----------------------------------------------------
    # MEDICINE TYPE
    # -----------------------------------------------------

    def validate_medicine_type(self, value):

        valid_types = [
            choice[0]
            for choice in PharmacyMedicine.MEDICINE_TYPES
        ]

        if value not in valid_types:
            raise serializers.ValidationError(
                'Invalid medicine type.'
            )

        return value

    # -----------------------------------------------------
    # MANUFACTURER
    # -----------------------------------------------------

    def validate_manufacturer(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Manufacturer is required.'
            )

        return value

    # -----------------------------------------------------
    # BATCH NUMBER
    # -----------------------------------------------------

    def validate_batch_number(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Batch number is required.'
            )

        return value

    # -----------------------------------------------------
    # PRICE
    # -----------------------------------------------------

    def validate_price_per_unit(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                'Price per unit must be greater than 0.'
            )

        return value

    # -----------------------------------------------------
    # STOCK
    # -----------------------------------------------------

    def validate_stock_quantity(self, value):

        if value < 0:
            raise serializers.ValidationError(
                'Stock quantity cannot be negative.'
            )

        return value

    # -----------------------------------------------------
    # DATE + DUPLICATE VALIDATION
    # -----------------------------------------------------

    def validate(self, attrs):

        manufacture_date = attrs.get(
            'manufacture_date',
            self.instance.manufacture_date
            if self.instance
            else None
        )

        expiry_date = attrs.get(
            'expiry_date',
            self.instance.expiry_date
            if self.instance
            else None
        )

        today = date.today()

        # -------------------------------------------------
        # 1. MANUFACTURE DATE CANNOT BE FUTURE
        # -------------------------------------------------

        if manufacture_date and manufacture_date > today:

            raise serializers.ValidationError({
                'manufacture_date':
                    'Manufacture date cannot be in the future.'
            })

        # -------------------------------------------------
        # 2. EXPIRY DATE CANNOT BE IN THE PAST
        # -------------------------------------------------

        if expiry_date and expiry_date < today:

            raise serializers.ValidationError({
                'expiry_date':
                    'Expiry date cannot be in the past.'
            })

        # -------------------------------------------------
        # 3. EXPIRY DATE MUST BE AFTER MANUFACTURE DATE
        # -------------------------------------------------

        if manufacture_date and expiry_date:

            if expiry_date <= manufacture_date:

                raise serializers.ValidationError({
                    'expiry_date':
                        'Expiry date must be after manufacture date.'
                })

        # -------------------------------------------------
        # 4. DUPLICATE MEDICINE RECORD
        # -------------------------------------------------

        medicine_name = attrs.get(
            'name',
            self.instance.name
            if self.instance
            else None
        )

        manufacturer = attrs.get(
            'manufacturer',
            self.instance.manufacturer
            if self.instance
            else None
        )

        batch_number = attrs.get(
            'batch_number',
            self.instance.batch_number
            if self.instance
            else None
        )

        if (
            medicine_name
            and manufacturer
            and batch_number
        ):

            queryset = PharmacyMedicine.objects.filter(
                name__iexact=medicine_name,
                manufacturer__iexact=manufacturer,
                batch_number__iexact=batch_number
            )

            if self.instance:

                queryset = queryset.exclude(
                    pk=self.instance.pk
                )

            if queryset.exists():

                raise serializers.ValidationError({
                    'batch_number':
                        'This medicine record already exists.'
                })

        return attrs


# =========================================================
# LAB TEST SERIALIZER
# =========================================================

class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = [
            "id",
            "test_name",
            "department",
            "unit",
            "sample_required",
            "normal_range",
            "price",
        ]
        read_only_fields = ["id"]

    def validate_test_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Test name is required."
            )

        if not all(
            character.isalpha() or character in " -'"
            for character in value
        ):
            raise serializers.ValidationError(
                "Test name can contain only letters."
            )

        queryset = LabTest.objects.filter(
            test_name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A lab test with this name already exists."
            )

        return value

    def validate_unit(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Unit is required."
            )

        return value

    def validate_sample_required(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Sample required is required."
            )

        return value

    def validate_normal_range(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Normal range is required."
            )

        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than 0."
            )

        return value


# =========================================================
# LOGIN SERIALIZER
# =========================================================

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

    def validate(self, data):

        username = data.get(
            'username'
        )

        password = data.get(
            'password'
        )

        username = username.strip()

        if not username:
            raise serializers.ValidationError({
                'username':
                    'Username is required.'
            })

        if not password:
            raise serializers.ValidationError({
                'password':
                    'Password is required.'
            })

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        try:
            staff = Staff.objects.get(
                user=user
            )

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