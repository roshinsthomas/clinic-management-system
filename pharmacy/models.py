from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from doctor.models import MedicinePrescription
from decimal import Decimal


class Medicine(models.Model):

    MEDICINE_TYPES = [
        ('Tablet', 'Tablet'),
        ('Capsule', 'Capsule'),
        ('Syrup', 'Syrup'),
        ('Injection', 'Injection'),
        ('Cream', 'Cream'),
        ('Drops', 'Drops'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=100)

    type = models.CharField(
        max_length=20,
        choices=MEDICINE_TYPES
    )

    manufacturer = models.CharField(max_length=100)

    batch_number = models.CharField(
        max_length=50,
        unique=True
    )

    manufacture_date = models.DateField()

    expiry_date = models.DateField()

    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock_quantity = models.PositiveIntegerField(default=0)

    def clean(self):
        # Manufacture date cannot be in the future
        if self.manufacture_date > timezone.now().date():
            raise ValidationError(
                "Manufacture date cannot be in the future."
            )

        # Expiry date must be after manufacture date
        if self.expiry_date <= self.manufacture_date:
            raise ValidationError(
                "Expiry date must be after manufacture date."
            )

        # Price cannot be negative
        if self.price_per_unit < 0:
            raise ValidationError(
                "Price cannot be negative."
            )

    def __str__(self):
        return self.name
class MedicineBill(models.Model):

    bill_number = models.CharField(
        max_length=50,
        unique=True
    )

    prescription = models.OneToOneField(
        MedicinePrescription,
        on_delete=models.PROTECT,
        related_name='medicine_bills',
        null=True,
        blank=True
    )

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT,
        related_name='bills'
    )

    quantity = models.PositiveIntegerField()

    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    gst_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("5.00")
    )

    gst_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    bill_date = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        subtotal = (
            self.quantity *
            self.price_per_unit
        )

        self.gst_amount = (
            subtotal *
            self.gst_percentage /
            100
        )

        self.total_amount = (
            subtotal +
            self.gst_amount
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.bill_number
