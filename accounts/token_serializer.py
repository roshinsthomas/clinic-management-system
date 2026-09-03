from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import Staff


class StaffTokenObtainPairSerializer(TokenObtainPairSerializer):

    # Change Simple JWT's default authentication error
    default_error_messages = {
        'no_active_account': 'Invalid username or password.'
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Username validation
        self.fields[self.username_field].allow_blank = True

        self.fields[self.username_field].error_messages.update({
            'blank': 'Username is required.',
            'required': 'Username is required.'
        })

        # Password validation
        self.fields['password'].allow_blank = True

        self.fields['password'].error_messages.update({
            'blank': 'Password is required.',
            'required': 'Password is required.'
        })

    def validate(self, attrs):

        username = attrs.get(self.username_field)
        password = attrs.get('password')

        # ------------------------------------------------
        # Username validation
        # ------------------------------------------------

        if username is None or not username.strip():

            raise serializers.ValidationError({
                'username': 'Username is required.'
            })

        username = username.strip()

        # ------------------------------------------------
        # Password validation
        # ------------------------------------------------

        if password is None or not password:

            raise serializers.ValidationError({
                'password': 'Password is required.'
            })

        attrs[self.username_field] = username

        # ------------------------------------------------
        # Authenticate user
        # ------------------------------------------------

        data = super().validate(attrs)

        # ------------------------------------------------
        # Check Staff account
        # ------------------------------------------------

        try:

            staff = Staff.objects.get(
                user=self.user
            )

        except Staff.DoesNotExist:

            raise AuthenticationFailed(
                'No staff account is associated with this user.'
            )

        # ------------------------------------------------
        # Check Staff status
        # ------------------------------------------------

        if not staff.status:

            raise AuthenticationFailed(
                'This staff account is inactive.'
            )

        # ------------------------------------------------
        # Add staff information
        # ------------------------------------------------

        data['staff_id'] = staff.staff_id
        data['role'] = staff.role
        data['username'] = staff.user.username
        data['status'] = staff.status

        return data