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

class DoctorSchedule(models.Model):
    WEEKDAY_CHOICES = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    doctor = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="doctor_schedules"
    )

    weekday = models.IntegerField(
        choices=WEEKDAY_CHOICES
    )

    start_time = models.TimeField(
        default="09:00"
    )

    end_time = models.TimeField(
        default="18:00"
    )

    morning_break_start = models.TimeField(
        null=True,
        blank=True
    )

    morning_break_end = models.TimeField(
        null=True,
        blank=True
    )

    afternoon_break_start = models.TimeField(
        null=True,
        blank=True
    )

    afternoon_break_end = models.TimeField(
        null=True,
        blank=True
    )

    evening_break_start = models.TimeField(
        null=True,
        blank=True
    )

    evening_break_end = models.TimeField(
        null=True,
        blank=True
    )

    slot_duration = models.PositiveIntegerField(
        default=15
    )

    class Meta:
        unique_together = ("doctor", "weekday")

    def __str__(self):
        return f"{self.doctor.user.get_full_name()} - {self.get_weekday_display()}"    