from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import LabTest, LabResult, LabBill

from .serializers import (
    LabTestSerializer,
    LabPrescriptionSerializer,
    LabResultSerializer,
    LabBillSerializer,
)

from doctor.models import LabPrescription
from accounts.models import Staff


class LabTestViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = LabTest.objects.all()

    serializer_class = LabTestSerializer

    permission_classes = [IsAuthenticated]


class LabPrescriptionViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = LabPrescriptionSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return LabPrescription.objects.select_related(
            'lab_test',
            'consultation',
            'consultation__appointment',
            'consultation__appointment__patient',
            'consultation__appointment__doctor',
            'consultation__appointment__doctor__user',
        )


class LabResultViewSet(viewsets.ModelViewSet):

    queryset = LabResult.objects.select_related(
        'lab_prescription',
        'lab_prescription__lab_test',
        'lab_prescription__consultation',
        'lab_prescription__consultation__appointment',
        'lab_prescription__consultation__appointment__patient',
        'lab_prescription__consultation__appointment__doctor',
        'lab_prescription__consultation__appointment__doctor__user',
        'tested_by',
        'tested_by__user',
    )

    serializer_class = LabResultSerializer

    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        prescription_id = request.data.get(
            'lab_prescription'
        )

        result_value = request.data.get(
            'result_value'
        )

        if not prescription_id:

            return Response(
                {
                    'error':
                    'Lab prescription is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not result_value or not str(
            result_value
        ).strip():

            return Response(
                {
                    'error':
                    'Result value is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            staff = Staff.objects.get(
                user=request.user
            )

        except Staff.DoesNotExist:

            return Response(
                {
                    'error':
                    'Staff profile not found.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if staff.role != 'LAB_TECHNICIAN':

            return Response(
                {
                    'error':
                    'Only a Lab Technician can enter laboratory results.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            lab_prescription = (
                LabPrescription.objects
                .select_related(
                    'lab_test',
                    'consultation',
                    'consultation__appointment',
                    'consultation__appointment__patient',
                )
                .get(
                    pk=prescription_id
                )
            )

        except LabPrescription.DoesNotExist:

            return Response(
                {
                    'error':
                    'Laboratory prescription not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if lab_prescription.status != 'PENDING':

            return Response(
                {
                    'error':
                    'This laboratory prescription has already been completed.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if LabResult.objects.filter(
            lab_prescription=lab_prescription
        ).exists():

            return Response(
                {
                    'error':
                    'A result already exists for this laboratory prescription.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            with transaction.atomic():

                result = LabResult.objects.create(
                    lab_prescription=lab_prescription,
                    tested_by=staff,
                    result_value=str(
                        result_value
                    ).strip(),
                )

                lab_prescription.status = 'COMPLETED'

                lab_prescription.save(
                    update_fields=['status']
                )

        except Exception:

            return Response(
                {
                    'error':
                    'Failed to save laboratory result.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = self.get_serializer(
            result
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class LabBillViewSet(viewsets.ModelViewSet):

    queryset = LabBill.objects.select_related(
        'lab_prescription',
        'lab_prescription__lab_test',
        'patient',
    )

    serializer_class = LabBillSerializer

    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        prescription_id = request.data.get(
            'lab_prescription'
        )

        if not prescription_id:

            return Response(
                {
                    'error':
                    'Lab prescription is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            staff = Staff.objects.get(
                user=request.user
            )

        except Staff.DoesNotExist:

            return Response(
                {
                    'error':
                    'Staff profile not found.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if staff.role != 'LAB_TECHNICIAN':

            return Response(
                {
                    'error':
                    'Only a Lab Technician can generate laboratory bills.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            lab_prescription = (
                LabPrescription.objects
                .select_related(
                    'lab_test',
                    'consultation',
                    'consultation__appointment',
                    'consultation__appointment__patient',
                )
                .get(
                    pk=prescription_id
                )
            )

        except LabPrescription.DoesNotExist:

            return Response(
                {
                    'error':
                    'Laboratory prescription not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if lab_prescription.status != 'COMPLETED':

            return Response(
                {
                    'error':
                    'Laboratory test must be completed before generating the bill.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not LabResult.objects.filter(
            lab_prescription=lab_prescription
        ).exists():

            return Response(
                {
                    'error':
                    'Laboratory result not found. Complete the test first.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if LabBill.objects.filter(
            lab_prescription=lab_prescription
        ).exists():

            return Response(
                {
                    'error':
                    'A bill already exists for this laboratory prescription.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        patient = (
            lab_prescription
            .consultation
            .appointment
            .patient
        )

        try:

            with transaction.atomic():

                bill = LabBill.objects.create(
                    lab_prescription=lab_prescription,
                    patient=patient,
                    amount=lab_prescription.lab_test.price,
                    payment_status='PENDING',
                )

        except Exception:

            return Response(
                {
                    'error':
                    'Failed to generate laboratory bill.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = self.get_serializer(
            bill
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='pay'
    )
    def pay_bill(self, request, pk=None):

        try:

            staff = Staff.objects.get(
                user=request.user
            )

        except Staff.DoesNotExist:

            return Response(
                {
                    'error':
                    'Staff profile not found.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if staff.role != 'LAB_TECHNICIAN':

            return Response(
                {
                    'error':
                    'Only a Lab Technician can complete laboratory bill payments.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            bill = LabBill.objects.get(
                pk=pk
            )

        except LabBill.DoesNotExist:

            return Response(
                {
                    'error':
                    'Laboratory bill not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if bill.payment_status == 'PAID':

            return Response(
                {
                    'message':
                    'Laboratory bill is already paid.',
                    'bill_id':
                    bill.lab_bill_id,
                    'payment_status':
                    bill.payment_status,
                },
                status=status.HTTP_200_OK
            )

        try:

            with transaction.atomic():

                bill.payment_status = 'PAID'

                bill.save(
                    update_fields=['payment_status']
                )

        except Exception:

            return Response(
                {
                    'error':
                    'Failed to complete laboratory bill payment.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = self.get_serializer(
            bill
        )

        return Response(
            {
                'message':
                'Laboratory bill payment completed successfully.',
                'bill':
                serializer.data,
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='email'
    )
    def email_bill(self, request, pk=None):

        try:

            staff = Staff.objects.get(
                user=request.user
            )

        except Staff.DoesNotExist:

            return Response(
                {
                    'error':
                    'Staff profile not found.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if staff.role != 'LAB_TECHNICIAN':

            return Response(
                {
                    'error':
                    'Only a Lab Technician can email laboratory bills.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            bill = (
                LabBill.objects
                .select_related(
                    'patient',
                    'lab_prescription',
                    'lab_prescription__lab_test',
                )
                .get(
                    pk=pk
                )
            )

        except LabBill.DoesNotExist:

            return Response(
                {
                    'error':
                    'Laboratory bill not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Payment must be completed before emailing
        if bill.payment_status != 'PAID':

            return Response(
                {
                    'error':
                    'Payment must be completed before emailing the laboratory bill.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        patient = bill.patient

        email = getattr(
            patient,
            'email',
            None
        )

        if not email:

            return Response(
                {
                    'error':
                    'Patient email address not found.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        test_name = (
            bill
            .lab_prescription
            .lab_test
            .test_name
        )

        subject = (
            f"Laboratory Bill - "
            f"Bill #{bill.lab_bill_id}"
        )

        message = (
            f"Dear {patient.first_name} "
            f"{patient.last_name},\n\n"

            f"Your laboratory bill has been generated "
            f"and payment has been completed.\n\n"

            f"Bill ID: {bill.lab_bill_id}\n"

            f"Test: {test_name}\n"

            f"Amount: ₹{bill.amount}\n"

            f"Payment Status: {bill.payment_status}\n"

            f"Bill Date: {bill.bill_date}\n\n"

            f"Thank you."
        )

        try:

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            # Persist the email status after successful delivery.
            bill.emailed_status = True
            bill.save(
                update_fields=["emailed_status"]
            )

        except Exception:

            return Response(
                {
                    'error':
                    'Failed to send laboratory bill email.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                'message':
                'Laboratory bill emailed successfully.',

                'email':
                email,

                'bill_id':
                bill.lab_bill_id,

                'payment_status':
                bill.payment_status,
                
                'emailed_status':
                bill.emailed_status,
            },
            status=status.HTTP_200_OK
        )