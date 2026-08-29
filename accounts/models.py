from django.db import models
from django.contrib.auth.models import User


class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.department_name


class Staff(models.Model):

    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('RECEPTIONIST', 'Receptionist'),
        ('DOCTOR', 'Doctor'),
        ('PHARMACIST', 'Pharmacist'),
        ('LAB_TECHNICIAN', 'Lab Technician'),
    ]

    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]

    staff_id = models.AutoField(primary_key=True)

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    dob = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    phone = models.CharField(
        max_length=10,
        unique=True
    )

    address = models.TextField()

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    specialization = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    consultation_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.staff_id} - {self.user.get_full_name()}"