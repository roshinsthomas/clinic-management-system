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

    result = models.TextField()

    tested_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Result - {self.lab_prescription_id}"


class LabBill(models.Model):

    lab_prescription = models.OneToOneField(
        'doctor.LabPrescription',
        on_delete=models.PROTECT,
        related_name='lab_bill'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    bill_date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Lab Bill - {self.lab_prescription_id}"