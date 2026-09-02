from django.db import models
from django.core.validators import MinValueValidator


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

class MedicinePrescription(models.Model):

    # Status used by the pharmacist to track whether
    # the prescribed medicine has been issued to the patient
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ISSUED', 'Issued'),
    ]

    # Unique ID for each medicine prescription
    prescription_id = models.AutoField(primary_key=True)

    # One consultation can contain multiple medicine prescriptions
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='medicine_prescriptions'
    )

    # Medicine is selected from the Medicine master
    # maintained in the pharmacy app
    medicine = models.ForeignKey(
        'pharmacy.Medicine',
        on_delete=models.PROTECT
    )

    # Example: "500 mg"
    dosage = models.CharField(max_length=100)
    
    # Number of tablets/capsules/units to be dispensed.
    quantity = models.PositiveIntegerField(
    default=1,
    validators=[MinValueValidator(1)]
    )

    # Example: "Twice a day"
    frequency = models.CharField(max_length=100)

    # Example: "5 days"
    duration = models.CharField(max_length=100)

    # New prescriptions are initially pending.
    # Pharmacy changes the status after issuing the medicine.
    dispensed_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    def __str__(self):
        return f"Prescription {self.prescription_id} - {self.medicine.name}" 

class LabPrescription(models.Model):

    # Status used by the laboratory to track the test
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
    ]

    # Unique ID for each lab prescription
    lab_prescription_id = models.AutoField(primary_key=True)

    # One consultation can contain multiple lab prescriptions
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='lab_prescriptions'
    )

    # Lab test is selected from the LabTest master
    # maintained in the laboratory app
    lab_test = models.ForeignKey(
        'laboratory.LabTest',
        on_delete=models.PROTECT
    )

    # New lab prescriptions are initially pending
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    def __str__(self):
        return f"Lab Prescription {self.lab_prescription_id}"