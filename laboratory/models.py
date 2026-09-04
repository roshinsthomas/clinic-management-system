from django.db import models


class LabTest(models.Model):

    test_name = models.CharField(max_length=100)

    department = models.CharField(max_length=100)

    unit = models.CharField(max_length=50)

    sample_required = models.CharField(max_length=100)

    normal_range = models.CharField(max_length=100)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return self.test_name


class LabResult(models.Model):

    result_id = models.AutoField(primary_key=True)

    lab_prescription = models.OneToOneField(
        'doctor.LabPrescription',
        on_delete=models.PROTECT,
        related_name='lab_result'
    )

    tested_by = models.ForeignKey(
        'accounts.Staff',
        on_delete=models.PROTECT,
        related_name='lab_results'
    )

    result_value = models.TextField()

    report_date = models.DateTimeField(
        auto_now_add=True
    )

    emailed_status = models.BooleanField(
        default=False
    )

    def __str__(self):
        return f"Result {self.result_id}"


class LabBill(models.Model):

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
    ]

    lab_bill_id = models.AutoField(primary_key=True)

    lab_prescription = models.OneToOneField(
        'doctor.LabPrescription',
        on_delete=models.PROTECT,
        related_name='lab_bill'
    )

    patient = models.ForeignKey(
        'receptionist.Patient',
        on_delete=models.PROTECT,
        related_name='lab_bills'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )
    
    # Tracks whether the laboratory bill has been emailed to the patient.
    emailed_status = models.BooleanField(
        default=False
    )

    bill_date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Lab Bill {self.lab_bill_id}"