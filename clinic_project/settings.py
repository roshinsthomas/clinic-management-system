"""
Django settings for clinic_project project.
"""

from pathlib import Path
from datetime import timedelta
import os

from dotenv import load_dotenv


# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')


# Security
SECRET_KEY = 'django-insecure-=)55429p4x+@#y5aog@$wy0cuixlz=9k96&c37y=1$*cif@96@'

DEBUG = True

ALLOWED_HOSTS = []


# Application definition
INSTALLED_APPS = [

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',

    'receptionist',
    'doctor',
    'laboratory',
    'pharmacy',
    'accounts',
]


# Middleware
MIDDLEWARE = [

    'django.middleware.security.SecurityMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',

    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'clinic_project.urls'


# Templates
TEMPLATES = [

    {
        'BACKEND':
            'django.template.backends.django.DjangoTemplates',

        'DIRS': [],

        'APP_DIRS': True,

        'OPTIONS': {

            'context_processors': [

                'django.template.context_processors.request',

                'django.contrib.auth.context_processors.auth',

                'django.contrib.messages.context_processors.messages',

            ],
        },
    },
]


WSGI_APPLICATION = 'clinic_project.wsgi.application'


# Database
DATABASES = {

    'default': {

        'ENGINE':
            'django.db.backends.mysql',

        'NAME':
            os.getenv('DB_NAME'),

        'USER':
            os.getenv('DB_USER'),

        'PASSWORD':
            os.getenv('DB_PASSWORD'),

        'HOST':
            os.getenv('DB_HOST'),

        'PORT':
            os.getenv('DB_PORT'),

    }

}


# Password validation
AUTH_PASSWORD_VALIDATORS = [

    {
        'NAME':
            'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.MinimumLengthValidator',
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.CommonPasswordValidator',
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.NumericPasswordValidator',
    },

]


# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files
STATIC_URL = 'static/'


# Email
# Development mode:
# Emails will be displayed in the Django terminal.

EMAIL_BACKEND = (
    'django.core.mail.backends.console.EmailBackend'
)

DEFAULT_FROM_EMAIL = (
    'noreply@clinicmanagement.com'
)


# Django REST Framework
REST_FRAMEWORK = {

    'DEFAULT_AUTHENTICATION_CLASSES': [

        'rest_framework_simplejwt.authentication.JWTAuthentication',

    ],

}


# JWT
SIMPLE_JWT = {

    'ACCESS_TOKEN_LIFETIME':
        timedelta(minutes=30),

    'REFRESH_TOKEN_LIFETIME':
        timedelta(days=1),

}


# CORS
CORS_ALLOWED_ORIGINS = [

    "http://localhost:5173",

]