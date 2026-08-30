from django.db import models


class Consultation(models.Model):
    consultation_id = models.AutoField(primary_key=True)

    appointment = models.OneToOneField(
        'receptionist.Appointment',
        on_delete=models.CASCADE
    )

    symptoms = models.TextField()
    diagnosis = models.TextField()

    notes = models.TextField(
        null=True,
        blank=True
    )

    consultation_date = models.DateField(
        auto_now_add=True
    )

    locked = models.BooleanField(default=False)

    def __str__(self):
        return f"Consultation {self.consultation_id}"