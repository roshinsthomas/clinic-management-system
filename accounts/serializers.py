from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Department, Staff,Medicine,LabTest
from pharmacy.models import Medicine as PharmacyMedicine
# DEPARTMENT SERIALIZER
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

# STAFF SERIALIZER
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

    def validate(self, attrs):
        user_data = attrs.get('user', {})

        username = user_data.get('username', '').strip()
        email = user_data.get('email', '').strip().lower()

        # Check username only if username is provided
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

        # Check email only if email is provided
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

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password', None)

        username = user_data.get('username', '').strip()
        email = user_data.get('email', '').strip().lower()
        first_name = user_data.get('first_name', '').strip()
        last_name = user_data.get('last_name', '').strip()

        if not username:
            raise serializers.ValidationError({
                'username': 'Username is required.'
            })

        if not email:
            raise serializers.ValidationError({
                'email': 'Email is required.'
            })

        if not first_name:
            raise serializers.ValidationError({
                'first_name': 'First name is required.'
            })

        if not last_name:
            raise serializers.ValidationError({
                'last_name': 'Last name is required.'
            })

        if not password:
            raise serializers.ValidationError({
                'password': 'Password is required.'
            })

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

        if User.objects.filter(
            username__iexact=username
        ).exists():
            raise serializers.ValidationError({
                'username':
                    'A user with this username already exists.'
            })

        if User.objects.filter(
            email__iexact=email
        ).exists():
            raise serializers.ValidationError({
                'email':
                    'A user with this email already exists.'
            })

        validate_password(
            password,
            user=None
        )

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

    def update(self, instance, validated_data):
        user_data = validated_data.pop(
            'user',
            None
        )

        user = instance.user

        if user_data:
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

    def validate_dob(self, value):
        from datetime import date

        if value >= date.today():
            raise serializers.ValidationError(
                'Date of birth must be in the past.'
            )

        return value

    def validate_address(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Address is required.'
            )

        return value

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

    def validate_consultation_fee(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                'Consultation fee cannot be negative.'
            )

        return value

# DOCTOR SERIALIZER
class DoctorSerializer(StaffSerializer):
    role = serializers.CharField(read_only=True)
    department_name = serializers.CharField(
        source='department.department_name',
        read_only=True,
        allow_null=True
    )

    class Meta(StaffSerializer.Meta):
        fields = StaffSerializer.Meta.fields + ['department_name']

    def validate(self, attrs):
        user_data = attrs.get('user', {})

        username = user_data.get('username', '').strip()
        email = user_data.get('email', '').strip().lower()

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

        if self.instance is None:
            if not attrs.get('specialization'):
                raise serializers.ValidationError({
                    'specialization':
                        'Specialization is required.'
                })

            if attrs.get('department') is None:
                raise serializers.ValidationError({
                    'department':
                        'Department is required.'
                })

            if attrs.get('consultation_fee') is None:
                raise serializers.ValidationError({
                    'consultation_fee':
                        'Consultation fee is required.'
                })

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

    def create(self, validated_data):
        validated_data['role'] = 'DOCTOR'
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['role'] = 'DOCTOR'
        return super().update(instance, validated_data)

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

        queryset = Staff.objects.filter(phone=value)

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                'A staff member with this phone number already exists.'
            )

        return value

    def validate_specialization(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Specialization is required.'
            )

        return value

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


# MEDICINE SERIALIZER

class MedicineSerializer(serializers.ModelSerializer):

    # Pharmacy Medicine model uses "id"
    # Admin frontend expects "medicine_id"
    medicine_id = serializers.IntegerField(
        source='id',
        read_only=True
    )

    # Pharmacy Medicine model uses "name"
    # Admin frontend expects "medicine_name"
    medicine_name = serializers.CharField(
        source='name'
    )

    # Pharmacy Medicine model uses "type"
    # Admin frontend expects "medicine_type"
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

    def validate_medicine_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Medicine name is required.'
            )

        if not all(
            character.isalpha() or character in " -'"
            for character in value
        ):
            raise serializers.ValidationError(
                'Medicine name can contain only letters.'
            )

        return value

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

    def validate_manufacturer(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Manufacturer is required.'
            )

        return value

    def validate_batch_number(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Batch number is required.'
            )

        return value

    def validate_price_per_unit(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'Price per unit must be greater than 0.'
            )

        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Stock quantity cannot be negative.'
            )

        return value

    def validate(self, attrs):

        manufacture_date = attrs.get(
            'manufacture_date',
            self.instance.manufacture_date
            if self.instance else None
        )

        expiry_date = attrs.get(
            'expiry_date',
            self.instance.expiry_date
            if self.instance else None
        )

        if manufacture_date and expiry_date:

            if expiry_date <= manufacture_date:
                raise serializers.ValidationError({
                    'expiry_date':
                        'Expiry date must be after manufacture date.'
                })

        medicine_name = attrs.get(
            'name',
            self.instance.name
            if self.instance else None
        )

        manufacturer = attrs.get(
            'manufacturer',
            self.instance.manufacturer
            if self.instance else None
        )

        batch_number = attrs.get(
            'batch_number',
            self.instance.batch_number
            if self.instance else None
        )

        if medicine_name and manufacturer and batch_number:

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

# LAB TEST SERIALIZER
class LabTestSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        source="department.department_name",
        read_only=True
    )

    class Meta:
        model = LabTest
        fields = [
            "test_id",
            "test_name",
            "department",
            "department_name",
            "unit",
            "sample_required",
            "normal_range",
            "status"
        ]
        read_only_fields = [
            "test_id",
            "department_name"
        ]

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

    def validate_department(self, value):
        if value is None:
            raise serializers.ValidationError(
                "Department is required."
            )

        if not value.status:
            raise serializers.ValidationError(
                "Selected department is inactive."
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

# LOGIN SERIALIZER
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
        username = data.get('username')
        password = data.get('password')

        username = username.strip()

        if not username:
            raise serializers.ValidationError({
                'username': 'Username is required.'
            })

        if not password:
            raise serializers.ValidationError({
                'password': 'Password is required.'
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