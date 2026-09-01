from rest_framework_simplejwt.views import TokenObtainPairView

from .token_serializer import StaffTokenObtainPairSerializer


class StaffTokenObtainPairView(TokenObtainPairView):
    serializer_class = StaffTokenObtainPairSerializer