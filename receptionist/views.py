from django.shortcuts import render, redirect, get_object_or_404

from .forms import (
    PatientForm,
    AppointmentForm,
    ConsultationBillForm,
)

from .models import Patient, Appointment


def register_patient(request):
    if request.method == "POST":
        form = PatientForm(request.POST)

        if form.is_valid():
            patient = form.save()

            return redirect(
                "schedule_appointment",
                patient_id=patient.patient_id
            )

    else:
        form = PatientForm()

    return render(
        request,
        "receptionist/register_patient.html",
        {"form": form}
    )


def schedule_appointment(request, patient_id):
    patient = get_object_or_404(
        Patient,
        patient_id=patient_id
    )

    if request.method == "POST":
        form = AppointmentForm(request.POST)

        if form.is_valid():
            appointment = form.save(commit=False)

            appointment.patient = patient
            appointment.save()

            return redirect(
                "create_consultation_bill",
                appointment_id=appointment.appointment_id
            )

    else:
        form = AppointmentForm()

    return render(
        request,
        "receptionist/schedule_appointment.html",
        {
            "form": form,
            "patient": patient,
        }
    )


def create_consultation_bill(request, appointment_id):
    appointment = get_object_or_404(
        Appointment,
        appointment_id=appointment_id
    )

    if request.method == "POST":
        form = ConsultationBillForm(request.POST)

        if form.is_valid():
            bill = form.save(commit=False)

            bill.patient = appointment.patient
            bill.appointment = appointment

            if not bill.consultation_fee:
                bill.consultation_fee = (
                    appointment.doctor.consultation_fee or 0
                )

            bill.total_amount = (
                bill.registration_fee +
                bill.consultation_fee
            )

            bill.save()

            return redirect("register_patient")

    else:
        form = ConsultationBillForm(
            initial={
                "consultation_fee": (
                    appointment.doctor.consultation_fee or 0
                ),
            }
        )

    return render(
        request,
        "receptionist/create_consultation_bill.html",
        {
            "form": form,
            "appointment": appointment,
        }
    )