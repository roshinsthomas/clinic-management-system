from django.shortcuts import render, redirect, get_object_or_404
from .forms import PatientForm, AppointmentForm
from .models import Patient


def register_patient(request):
    if request.method == "POST":
        form = PatientForm(request.POST)

        if form.is_valid():
            patient = form.save()
            print("PATIENT SAVED:", patient.patient_id)
            return redirect(
                "schedule_appointment",
                patient_id=patient.patient_id
            )
        else:
            print("FORM ERRORS:", form.errors)

    else:
        form = PatientForm()

    return render(
        request,
        "receptionist/register_patient.html",
        {"form": form}
    )


def schedule_appointment(request, patient_id):
    patient = get_object_or_404(Patient, patient_id=patient_id)

    if request.method == "POST":
        form = AppointmentForm(request.POST)

        if form.is_valid():
            appointment = form.save(commit=False)
            appointment.patient = patient
            appointment.save()

            return redirect("register_patient")

    else:
        form = AppointmentForm()

    return render(
        request,
        "receptionist/schedule_appointment.html",
        {"form": form, "patient": patient}
    )