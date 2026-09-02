from django.db import models
from accounts.models import Department, Staff


class Patient(models.Model):
    patient_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField()
    gender = models.CharField(max_length=20)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    blood_group = models.CharField(max_length=10)
    status = models.CharField(max_length=20, default="Active")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Appointment(models.Model):
    APPOINTMENT_TYPE_CHOICES = [
        ("WALK_IN", "Walk-in"),
        ("PRIOR_BOOKING", "Prior Booking"),
    ]

    appointment_id = models.AutoField(primary_key=True)

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="appointments"
    )

    doctor = models.ForeignKey(
        Staff,
        on_delete=models.PROTECT,
        related_name="doctor_appointments"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="appointments"
    )

    appointment_date = models.DateField()
    appointment_time = models.TimeField()

    appointment_type = models.CharField(
        max_length=20,
        choices=APPOINTMENT_TYPE_CHOICES,
        default="WALK_IN"
    )

    token_no = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        default="Scheduled"
    )

    def __str__(self):
        return f"Appointment {self.appointment_id}"


class ConsultationBill(models.Model):
    bill_id = models.AutoField(primary_key=True)

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="consultation_bills"
    )

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.PROTECT,
        related_name="consultation_bill"
    )

    registration_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_status = models.CharField(
        max_length=20,
        default="Pending"
    )

    def __str__(self):
        return f"Bill {self.bill_id}"