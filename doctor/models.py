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
        ('OUTSIDE', 'Purchase Outside'),
    ]
    
    # Allowed medicine types for manually entered outside medicines.
    MEDICINE_TYPE_CHOICES = [
        ('Tablet', 'Tablet'),
        ('Capsule', 'Capsule'),
        ('Syrup', 'Syrup'),
        ('Injection', 'Injection'),
        ('Cream', 'Cream'),
        ('Drops', 'Drops'),
        ('Other', 'Other'),
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
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )

    # Stores the name when Doctor prescribes a medicine outside the master.
    other_medicine_name = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    # Type of medicine when prescribed outside the clinic medicine master.
    other_medicine_type = models.CharField(
        max_length=20,
        choices=MEDICINE_TYPE_CHOICES,
        null=True,
        blank=True,
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
        
        medicine_name = (
            self.medicine.name
            if self.medicine
            else self.other_medicine_name
        )
        return f"Prescription {self.prescription_id} - {medicine_name}" 

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