from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from accounts.models import Department, Staff
from pharmacy.models import Medicine
from laboratory.models import LabTest
from receptionist.models import Patient, Appointment


class Command(BaseCommand):
    help = "Seed initial dummy data for development"

    def handle(self, *args, **options):

        # -----------------------------
        # Step 1 - Seed Departments
        # -----------------------------

        self.stdout.write("Seeding departments...")

        departments = [
            "General Medicine",
            "Cardiology",
            "Orthopedics",
        ]

        for department_name in departments:
            Department.objects.get_or_create(
                department_name=department_name
            )

        self.stdout.write(
            self.style.SUCCESS("Departments seeded successfully.")
        )

        # -----------------------------
        # Step 2 - Seed Users + Staff
        # -----------------------------

        self.stdout.write("Seeding staff users...")

        general_department = Department.objects.get(
            department_name="General Medicine"
        )

        staff_data = [
            {
                "username": "admin1",
                "password": "admin123",
                "first_name": "Admin",
                "last_name": "User",
                "email": "admin1@example.com",
                "dob": "1988-01-15",
                "gender": "MALE",
                "phone": "9876500001",
                "address": "Thiruvananthapuram",
                "role": "ADMIN",
                "department": None,
                "specialization": None,
                "consultation_fee": None,
            },
            {
                "username": "receptionist1",
                "password": "reception123",
                "first_name": "Anu",
                "last_name": "Thomas",
                "email": "receptionist1@example.com",
                "dob": "1995-06-20",
                "gender": "FEMALE",
                "phone": "9876500002",
                "address": "Thiruvananthapuram",
                "role": "RECEPTIONIST",
                "department": None,
                "specialization": None,
                "consultation_fee": None,
            },
            {
                "username": "doctor1",
                "password": "doctor123",
                "first_name": "John",
                "last_name": "Mathew",
                "email": "doctor1@example.com",
                "dob": "1990-05-10",
                "gender": "MALE",
                "phone": "9876500003",
                "address": "Thiruvananthapuram",
                "role": "DOCTOR",
                "department": general_department,
                "specialization": "General Medicine",
                "consultation_fee": 500,
            },
            {
                "username": "pharmacist1",
                "password": "pharmacy123",
                "first_name": "Rahul",
                "last_name": "Nair",
                "email": "pharmacist1@example.com",
                "dob": "1992-09-12",
                "gender": "MALE",
                "phone": "9876500004",
                "address": "Thiruvananthapuram",
                "role": "PHARMACIST",
                "department": None,
                "specialization": None,
                "consultation_fee": None,
            },
            {
                "username": "labtech1",
                "password": "lab123",
                "first_name": "Meera",
                "last_name": "Joseph",
                "email": "labtech1@example.com",
                "dob": "1993-11-25",
                "gender": "FEMALE",
                "phone": "9876500005",
                "address": "Thiruvananthapuram",
                "role": "LAB_TECHNICIAN",
                "department": None,
                "specialization": None,
                "consultation_fee": None,
            },
        ]

        for data in staff_data:

            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "email": data["email"],
                }
            )

            if created:
                user.set_password(data["password"])
                user.save()

            Staff.objects.get_or_create(
                user=user,
                defaults={
                    "dob": data["dob"],
                    "gender": data["gender"],
                    "phone": data["phone"],
                    "address": data["address"],
                    "role": data["role"],
                    "department": data["department"],
                    "specialization": data["specialization"],
                    "consultation_fee": data["consultation_fee"],
                }
            )

        self.stdout.write(
            self.style.SUCCESS("Staff users seeded successfully.")
        )
        
        # -----------------------------
        # Step 3 - Medicines
        # -----------------------------
        
        self.stdout.write("Seeding medicines...")

        medicine_data = [
            {
                "name": "Paracetamol",
                "type": "Tablet",
                "manufacturer": "Cipla",
                "batch_number": "PCM001",
                "manufacture_date": "2026-01-10",
                "expiry_date": "2028-01-10",
                "price_per_unit": 2.50,
                "stock_quantity": 100,
            },
            {
                "name": "Amoxicillin",
                "type": "Capsule",
                "manufacturer": "Sun Pharma",
                "batch_number": "AMX001",
                "manufacture_date": "2026-02-15",
                "expiry_date": "2028-02-15",
                "price_per_unit": 8.00,
                "stock_quantity": 80,
            },
            {
                "name": "Cetirizine",
                "type": "Tablet",
                "manufacturer": "Cipla",
                "batch_number": "CTZ001",
                "manufacture_date": "2026-03-20",
                "expiry_date": "2028-03-20",
                "price_per_unit": 3.00,
                "stock_quantity": 100,
            },
            {
                "name": "Pantoprazole",
                "type": "Tablet",
                "manufacturer": "Sun Pharma",
                "batch_number": "PAN001",
                "manufacture_date": "2026-04-10",
                "expiry_date": "2028-04-10",
                "price_per_unit": 5.00,
                "stock_quantity": 75,
            },
        ]

        for data in medicine_data:
            Medicine.objects.get_or_create(
                batch_number=data["batch_number"],
                defaults={
                    "name": data["name"],
                    "type": data["type"],
                    "manufacturer": data["manufacturer"],
                    "manufacture_date": data["manufacture_date"],
                    "expiry_date": data["expiry_date"],
                    "price_per_unit": data["price_per_unit"],
                    "stock_quantity": data["stock_quantity"],
                }
            )

        self.stdout.write(
        self.style.SUCCESS("Medicines seeded successfully.")
        )
        
        # -----------------------------
        # Step 4 - Seed lab tests
        # -----------------------------

        self.stdout.write("Seeding lab tests...")

        lab_test_data = [
            {
                "test_name": "Complete Blood Count",
                "department": "General Medicine",
                "unit": "cells/mcL",
                "sample_required": "Blood",
                "normal_range": "Varies by parameter",
                "price": 350.00,
            },
            {
                "test_name": "Blood Sugar",
                "department": "General Medicine",
                "unit": "mg/dL",
                "sample_required": "Blood",
                "normal_range": "70-140 mg/dL",
                "price": 150.00,
            },
            {
                "test_name": "Urine Test",
                "department": "General Medicine",
                "unit": "N/A",
                "sample_required": "Urine",
                "normal_range": "Normal",
                "price": 200.00,
            },
            {
                "test_name": "Thyroid Test",
                "department": "General Medicine",
                "unit": "mIU/L",
                "sample_required": "Blood",
                "normal_range": "0.4-4.0 mIU/L",
                "price": 500.00,
            },
        ]

        for data in lab_test_data:
            LabTest.objects.get_or_create(
                test_name=data["test_name"],
                defaults={
                    "department": data["department"],
                    "unit": data["unit"],
                    "sample_required": data["sample_required"],
                    "normal_range": data["normal_range"],
                    "price": data["price"],
                }
            )

        self.stdout.write(
        self.style.SUCCESS("Lab tests seeded successfully.")
        )
        
        # -----------------------------
        # Step 5 - Seed Patients
        # -----------------------------
        
        self.stdout.write("Seeding patients...")

        patient_data = [
            {
                "first_name": "Arun",
                "last_name": "Kumar",
                "dob": "1998-04-12",
                "gender": "MALE",
                "blood_group": "O+",
                "address": "Thiruvananthapuram",
                "phone": "9876510001",
                "email": "arun@example.com",
            },
            {
                "first_name": "Neha",
                "last_name": "Thomas",
                "dob": "2000-07-20",
                "gender": "FEMALE",
                "blood_group": "A+",
                "address": "Kollam",
                "phone": "9876510002",
                "email": "neha@example.com",
            },
            {
                "first_name": "Rahul",
                "last_name": "Nair",
                "dob": "1995-11-05",
                "gender": "MALE",
                "blood_group": "B+",
                "address": "Kottayam",
                "phone": "9876510003",
                "email": "rahul@example.com",
            },
        ]

        for data in patient_data:
            Patient.objects.get_or_create(
                phone=data["phone"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "dob": data["dob"],
                    "gender": data["gender"],
                    "blood_group": data["blood_group"],
                    "address": data["address"],
                    "email": data["email"],
                }
            )

        self.stdout.write(
            self.style.SUCCESS("Patients seeded successfully.")
        )
        
        # -----------------------------
        # Step 6 - Seed Appointments
        # -----------------------------
        
        self.stdout.write("Seeding appointments...")

        general_department = Department.objects.get(
            department_name="General Medicine"
        )

        doctor = Staff.objects.get(
            user__username="doctor1"
        )

        patients = list(
            Patient.objects.all().order_by("patient_id")
        )

        appointment_data = [
            {
                "patient": patients[0],
                "appointment_date": "2026-08-31",
                "appointment_time": "09:00:00",
                "token_no": 1,
            },
            {
                "patient": patients[1],
                "appointment_date": "2026-08-31",
                "appointment_time": "09:15:00",
                "token_no": 2,
            },
            {
                "patient": patients[2],
                "appointment_date": "2026-08-31",
                "appointment_time": "09:30:00",
                "token_no": 3,
            },
        ]

        for data in appointment_data:
            Appointment.objects.get_or_create(
                patient=data["patient"],
                doctor=doctor,
                appointment_date=data["appointment_date"],
                appointment_time=data["appointment_time"],
                defaults={
                    "department": general_department,
                    "token_no": data["token_no"],
                    "status": "Scheduled",
                }
            )

        self.stdout.write(
        self.style.SUCCESS("Appointments seeded successfully.")
        )