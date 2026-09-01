"""
URL configuration for clinic_project project.
"""

from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Authentication
    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    # Admin / Accounts APIs
    path('api/', include('accounts.urls')),

    # Pharmacy APIs
    path(
        'api/pharmacy/',
        include('pharmacy.urls')
    ),

    # Receptionist APIs
    path(
        'receptionist/',
        include('receptionist.urls')
    ),
    
    # Doctor APIs
    path("api/doctor/", 
         include("doctor.urls")),


    # Laboratory APIs
    path(
        'api/laboratory/',
        include('laboratory.urls')
    ),
]