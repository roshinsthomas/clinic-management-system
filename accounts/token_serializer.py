from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import Staff


class StaffTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        try:
            staff = Staff.objects.get(user=self.user)
        except Staff.DoesNotExist:
            raise AuthenticationFailed(
                "No staff account is associated with this user."
            )

        if not staff.status:
            raise AuthenticationFailed(
                "This staff account is inactive."
            )

        return data