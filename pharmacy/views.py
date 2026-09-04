from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from receptionist.models import Patient,Appointment
from django.db.models import Q,Sum,Count
from django.utils import timezone
from datetime import timedelta

from .models import Medicine, MedicineBill
from .serializers import (
    MedicineSerializer,
    MedicineStockSerializer,
    MedicineBillSerializer,
    MedicinePrescriptionSerializer,
    DispenseMedicineSerializer,
    PatientSearchSerializer,
    PharmacyAppointmentSerializer
)

from .permissions import IsAdmin, IsPharmacist,IsAdminOrPharmacist
from doctor.models import MedicinePrescription,Consultation
from django.db import transaction
from rest_framework.views import APIView
from rest_framework import status


class MedicineViewSet(viewsets.ModelViewSet):

    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    def get_permissions(self):

        # Anyone authenticated can view medicines
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]

        # Only admin can create/delete medicine
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]

        # Normal update is only for admin
        if self.action in ['update', 'partial_update']:
            return [IsAdmin()]
        if self.action == 'update_stock':
            return [IsAdminOrPharmacist()]
    
        return [IsAuthenticated()]

    @action(
        detail=True,
        methods=['put', 'patch'],
        url_path='stock',
        
    )
    def update_stock(self, request, pk=None):
        medicine = self.get_object()

        serializer = MedicineStockSerializer(
            medicine,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class MedicineBillViewSet(viewsets.ModelViewSet):

    queryset = MedicineBill.objects.all()
    serializer_class = MedicineBillSerializer

    permission_classes = [IsAuthenticated]


class MedicinePrescriptionViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = MedicinePrescription.objects.filter(
        dispensed_status='PENDING',
        medicine__isnull=False
    )

    serializer_class = MedicinePrescriptionSerializer

    permission_classes = [IsAuthenticated]
class DispenseMedicineView(APIView):

    permission_classes = [IsAdminOrPharmacist]

    @transaction.atomic
    def post(self, request):

        serializer = DispenseMedicineSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        prescription_id = serializer.validated_data[
            'prescription_id'
        ]

        prescription = (
            MedicinePrescription.objects
            .select_for_update()
            .select_related('medicine')
            .get(
                prescription_id=prescription_id
            )
        )

        medicine = prescription.medicine

        # Check stock again inside the transaction
        if medicine.stock_quantity < prescription.quantity:
            return Response(
                {
                    'detail': 'Insufficient medicine stock.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Deduct stock
        medicine.stock_quantity -= prescription.quantity

        medicine.save(
            update_fields=['stock_quantity']
        )

        # Mark prescription as issued
        prescription.dispensed_status = 'ISSUED'

        prescription.save(
            update_fields=['dispensed_status']
        )

        # Generate bill number
        bill_number = f"PH-{prescription.prescription_id}"

        # Create medicine bill
        bill = MedicineBill.objects.create(
            bill_number=bill_number,
            prescription=prescription,
            medicine=medicine,
            quantity=prescription.quantity,
            price_per_unit=medicine.price_per_unit
        )

        return Response(
            {
                'message': 'Medicine dispensed successfully.',
                'prescription_id': prescription.prescription_id,
                'medicine': medicine.name,
                'quantity': prescription.quantity,
                'remaining_stock': medicine.stock_quantity,
                'status': prescription.dispensed_status,
                'bill_number': bill.bill_number,
                'total_amount': bill.total_amount
            },
            status=status.HTTP_200_OK
        )

class PharmacyPatientSearchView(APIView):

    permission_classes = [IsAdminOrPharmacist]

    def get(self, request):

        search = request.query_params.get('search', '').strip()

        if not search:
            return Response(
                {
                    'detail': 'Please enter a patient name or phone number.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        patients = Patient.objects.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(phone__icontains=search)
        )

        serializer = PatientSearchSerializer(
            patients,
            many=True
        )

        return Response(serializer.data)

class PharmacyAppointmentView(APIView):

    permission_classes = [IsAdminOrPharmacist]

    def get(self, request, patient_id):

        appointments = Appointment.objects.filter(
            patient_id=patient_id
        ).order_by(
            '-appointment_date',
            '-appointment_time'
        )

        serializer = PharmacyAppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)

class PharmacyAppointmentPrescriptionView(APIView):

    permission_classes = [IsAdminOrPharmacist]

    def get(self, request, appointment_id):

        try:
            appointment = Appointment.objects.get(
                appointment_id=appointment_id
            )
        except Appointment.DoesNotExist:
            return Response(
                {'detail': 'Appointment not found.'},
                status=404
            )

        try:
            consultation = Consultation.objects.get(
                appointment=appointment
            )
        except Consultation.DoesNotExist:
            return Response(
                {'detail': 'No consultation found for this appointment.'},
                status=404
            )

        prescriptions = MedicinePrescription.objects.filter(
            consultation=consultation,
            dispensed_status='PENDING'
        )

        serializer = MedicinePrescriptionSerializer(
            prescriptions,
            many=True
        )

        return Response(serializer.data)

class PharmacySalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        period = request.GET.get('period', 'daily')

        today = timezone.localdate()

        # -----------------------------
        # Calculate date range
        # -----------------------------

        if period == 'daily':

            start_date = today
            end_date = today

        elif period == 'weekly':

            start_date = today - timedelta(days=today.weekday())
            end_date = today

        elif period == 'monthly':

            start_date = today.replace(day=1)
            end_date = today

        else:

            return Response(
                {
                    'detail': 'Invalid period. Use daily, weekly or monthly.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------
        # Filter medicine bills
        # -----------------------------

        bills = MedicineBill.objects.filter(
            bill_date__date__gte=start_date,
            bill_date__date__lte=end_date
        )

        # -----------------------------
        # Basic report
        # -----------------------------

        report = bills.aggregate(
            total_bills=Count('id'),
            total_quantity=Sum('quantity'),
        )

        # -----------------------------
        # Financial calculations
        # -----------------------------

        subtotal = sum(
            bill.quantity * bill.price_per_unit
            for bill in bills
        )

        total_gst = sum(
            bill.gst_amount
            for bill in bills
        )

        total_revenue = sum(
            bill.total_amount
            for bill in bills
        )

        # -----------------------------
        # Response
        # -----------------------------

        return Response({

            'period': period,

            'start_date': start_date,

            'end_date': end_date,

            'total_bills':
                report['total_bills'] or 0,

            'total_quantity':
                report['total_quantity'] or 0,

            'subtotal':
                subtotal,

            'total_gst':
                total_gst,

            'total_revenue':
                total_revenue,

        })

class PharmacyDashboardSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        today = timezone.localdate()

        total_medicines = Medicine.objects.count()

        low_stock = Medicine.objects.filter(
            stock_quantity__lte=10
        ).count()

        pending_prescriptions = MedicinePrescription.objects.filter(
            dispensed_status='PENDING',
            medicine__isnull=False
        ).count()

        todays_bills = MedicineBill.objects.filter(
            bill_date__date=today
        ).count()

        return Response({
            'total_medicines': total_medicines,
            'low_stock': low_stock,
            'pending_prescriptions': pending_prescriptions,
            'todays_bills': todays_bills,
        })