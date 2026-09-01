"""
URL configuration for clinic_project project.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),

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
]