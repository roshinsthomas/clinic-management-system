from datetime import date, time, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import Department, Staff
from receptionist.models import (
    Patient,
    Appointment,
    ConsultationBill,
    DoctorSchedule,
)
from doctor.models import (
    Consultation,
    MedicinePrescription,
    LabPrescription,
)
from pharmacy.models import Medicine, MedicineBill
from laboratory.models import LabTest, LabResult, LabBill


class Command(BaseCommand):
    help = "Reset application data and create shared MySQL dummy test data."

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Rebuild all clinic test data.

        Django internal tables such as migrations, permissions,
        content types and groups are not deleted.
        """

        self.stdout.write(
            self.style.WARNING(
                "Resetting Clinic Management System test data..."
            )
        )

        # Clear old application data first.
        self.clear_existing_data()

        # Create master data first.
        departments = self.seed_departments()
        staff = self.seed_staff(departments)
        medicines = self.seed_medicines()
        lab_tests = self.seed_lab_tests()

        # Create patient and receptionist-related data.
        patients = self.seed_patients()
        self.seed_doctor_schedules(staff["doctors"])

        appointments = self.seed_appointments(
            patients,
            staff["doctors"],
            departments,
        )

        self.seed_consultation_bills(appointments)

        # Create Doctor module data.
        consultations = self.seed_consultations(
            appointments
        )

        medicine_prescriptions = (
            self.seed_medicine_prescriptions(
                consultations,
                medicines,
            )
        )

        lab_prescriptions = (
            self.seed_lab_prescriptions(
                consultations,
                lab_tests,
            )
        )

        # Create Pharmacy and Laboratory transaction data.
        self.seed_medicine_bills(
            medicine_prescriptions
        )

        self.seed_lab_results_and_bills(
            lab_prescriptions,
            staff["lab_technicians"],
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "Dummy data created successfully in MySQL."
            )
        )

        self.print_summary()
        self.print_login_credentials()

    # ============================================================
    # CLEAR EXISTING DATA
    # ============================================================

    def clear_existing_data(self):
        """
        Delete application data in reverse dependency order.

        MySQL foreign-key protection requires child records
        to be removed before their parent records.
        """

        self.stdout.write(
            "Clearing existing application data..."
        )

        # Laboratory child records.
        LabResult.objects.all().delete()
        LabBill.objects.all().delete()

        # Pharmacy child records.
        MedicineBill.objects.all().delete()

        # Doctor prescriptions depend on consultations
        # and master data.
        LabPrescription.objects.all().delete()
        MedicinePrescription.objects.all().delete()

        # Consultations depend on appointments.
        Consultation.objects.all().delete()

        # Receptionist transaction records.
        ConsultationBill.objects.all().delete()
        DoctorSchedule.objects.all().delete()
        Appointment.objects.all().delete()
        Patient.objects.all().delete()

        # Master records referenced by prescriptions.
        Medicine.objects.all().delete()
        LabTest.objects.all().delete()

        # Staff must be removed before departments.
        Staff.objects.all().delete()
        Department.objects.all().delete()

        # Preserve Django superusers while removing
        # normal clinic login accounts.
        User.objects.filter(
            is_superuser=False
        ).delete()

        self.stdout.write(
            self.style.SUCCESS(
                "Existing application data cleared."
            )
        )

    # ============================================================
    # DEPARTMENTS
    # ============================================================

    def seed_departments(self):
        """Create the three main clinic departments."""

        self.stdout.write(
            "Seeding departments..."
        )

        general = Department.objects.create(
            department_name="General Medicine",
            status=True,
        )

        cardiology = Department.objects.create(
            department_name="Cardiology",
            status=True,
        )

        orthopedics = Department.objects.create(
            department_name="Orthopedics",
            status=True,
        )

        return {
            "general": general,
            "cardiology": cardiology,
            "orthopedics": orthopedics,
        }

    # ============================================================
    # STAFF
    # ============================================================

    def create_staff(
        self,
        username,
        password,
        first_name,
        last_name,
        email,
        dob,
        gender,
        phone,
        address,
        role,
        department=None,
        specialization=None,
        consultation_fee=None,
    ):
        """
        Create both the Django User account
        and the associated Staff profile.
        """

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )

        return Staff.objects.create(
            user=user,
            dob=dob,
            gender=gender,
            phone=phone,
            address=address,
            role=role,
            department=department,
            specialization=specialization,
            consultation_fee=consultation_fee,
            status=True,
        )

    def seed_staff(self, departments):
        """
        Create:
        1 Admin
        2 Receptionists
        6 Doctors
        2 Pharmacists
        2 Lab Technicians
        """

        self.stdout.write(
            "Seeding staff..."
        )

        admin = self.create_staff(
            "admin1",
            "admin123",
            "Arun",
            "Admin",
            "admin1@example.com",
            date(1985, 5, 15),
            "MALE",
            "9000000001",
            "Thiruvananthapuram",
            "ADMIN",
        )

        receptionist1 = self.create_staff(
            "receptionist1",
            "reception123",
            "Anu",
            "Thomas",
            "receptionist1@example.com",
            date(1995, 6, 20),
            "FEMALE",
            "9000000002",
            "Thiruvananthapuram",
            "RECEPTIONIST",
        )

        receptionist2 = self.create_staff(
            "receptionist2",
            "reception123",
            "Megha",
            "Nair",
            "receptionist2@example.com",
            date(1997, 8, 12),
            "FEMALE",
            "9000000003",
            "Kollam",
            "RECEPTIONIST",
        )

        # ---------------- GENERAL MEDICINE ----------------

        doctor1 = self.create_staff(
            "doctor1",
            "doctor123",
            "John",
            "Mathew",
            "doctor1@example.com",
            date(1985, 3, 10),
            "MALE",
            "9000000011",
            "Thiruvananthapuram",
            "DOCTOR",
            departments["general"],
            "General Physician",
            Decimal("500.00"),
        )

        doctor2 = self.create_staff(
            "doctor2",
            "doctor123",
            "Priya",
            "Menon",
            "doctor2@example.com",
            date(1988, 7, 18),
            "FEMALE",
            "9000000012",
            "Kochi",
            "DOCTOR",
            departments["general"],
            "Internal Medicine",
            Decimal("550.00"),
        )

        # ---------------- CARDIOLOGY ----------------

        doctor3 = self.create_staff(
            "doctor3",
            "doctor123",
            "Rahul",
            "Varma",
            "doctor3@example.com",
            date(1982, 1, 25),
            "MALE",
            "9000000013",
            "Thiruvananthapuram",
            "DOCTOR",
            departments["cardiology"],
            "Cardiologist",
            Decimal("800.00"),
        )

        doctor4 = self.create_staff(
            "doctor4",
            "doctor123",
            "Sneha",
            "Joseph",
            "doctor4@example.com",
            date(1986, 11, 5),
            "FEMALE",
            "9000000014",
            "Kottayam",
            "DOCTOR",
            departments["cardiology"],
            "Interventional Cardiology",
            Decimal("850.00"),
        )

        # ---------------- ORTHOPEDICS ----------------

        doctor5 = self.create_staff(
            "doctor5",
            "doctor123",
            "Vivek",
            "Nair",
            "doctor5@example.com",
            date(1984, 4, 14),
            "MALE",
            "9000000015",
            "Kollam",
            "DOCTOR",
            departments["orthopedics"],
            "Orthopedic Surgeon",
            Decimal("700.00"),
        )

        doctor6 = self.create_staff(
            "doctor6",
            "doctor123",
            "Anjali",
            "Krishnan",
            "doctor6@example.com",
            date(1987, 9, 22),
            "FEMALE",
            "9000000016",
            "Alappuzha",
            "DOCTOR",
            departments["orthopedics"],
            "Orthopedics",
            Decimal("750.00"),
        )

        # ---------------- PHARMACY ----------------

        pharmacist1 = self.create_staff(
            "pharmacist1",
            "pharmacy123",
            "Akhil",
            "Raj",
            "pharmacist1@example.com",
            date(1992, 2, 10),
            "MALE",
            "9000000021",
            "Thiruvananthapuram",
            "PHARMACIST",
        )

        pharmacist2 = self.create_staff(
            "pharmacist2",
            "pharmacy123",
            "Neethu",
            "Mohan",
            "pharmacist2@example.com",
            date(1994, 12, 8),
            "FEMALE",
            "9000000022",
            "Kollam",
            "PHARMACIST",
        )

        # ---------------- LABORATORY ----------------

        labtech1 = self.create_staff(
            "labtech1",
            "lab123",
            "Meera",
            "Joseph",
            "labtech1@example.com",
            date(1993, 11, 25),
            "FEMALE",
            "9000000031",
            "Thiruvananthapuram",
            "LAB_TECHNICIAN",
        )

        labtech2 = self.create_staff(
            "labtech2",
            "lab123",
            "Nithin",
            "George",
            "labtech2@example.com",
            date(1991, 10, 19),
            "MALE",
            "9000000032",
            "Kottayam",
            "LAB_TECHNICIAN",
        )

        return {
            "admin": admin,
            "receptionists": [
                receptionist1,
                receptionist2,
            ],
            "doctors": [
                doctor1,
                doctor2,
                doctor3,
                doctor4,
                doctor5,
                doctor6,
            ],
            "pharmacists": [
                pharmacist1,
                pharmacist2,
            ],
            "lab_technicians": [
                labtech1,
                labtech2,
            ],
        }

    # ============================================================
    # MEDICINES
    # ============================================================

    def seed_medicines(self):
        """Create the shared Pharmacy medicine master."""

        self.stdout.write(
            "Seeding medicines..."
        )

        medicine_data = [
            (
                "Paracetamol 500mg",
                "Tablet",
                "Cipla",
                "PCM001",
                "2.50",
                150,
            ),
            (
                "Amoxicillin 500mg",
                "Capsule",
                "Sun Pharma",
                "AMX001",
                "8.00",
                80,
            ),
            (
                "Azithromycin 500mg",
                "Tablet",
                "Cipla",
                "AZI001",
                "18.00",
                60,
            ),
            (
                "Cetirizine 10mg",
                "Tablet",
                "Dr Reddy",
                "CTZ001",
                "4.00",
                100,
            ),
            (
                "Pantoprazole 40mg",
                "Tablet",
                "Alkem",
                "PAN001",
                "6.50",
                90,
            ),
            (
                "Metformin 500mg",
                "Tablet",
                "USV",
                "MET001",
                "5.00",
                120,
            ),
            (
                "Amlodipine 5mg",
                "Tablet",
                "Cipla",
                "AML001",
                "4.50",
                75,
            ),
            (
                "Atorvastatin 10mg",
                "Tablet",
                "Sun Pharma",
                "ATO001",
                "7.50",
                65,
            ),
            (
                "Ibuprofen 400mg",
                "Tablet",
                "Abbott",
                "IBU001",
                "5.50",
                110,
            ),
            (
                "Calcium Syrup",
                "Syrup",
                "Mankind",
                "CAL001",
                "95.00",
                35,
            ),
            (
                "Diclofenac Gel",
                "Cream",
                "Novartis",
                "DIC001",
                "120.00",
                25,
            ),
            (
                "Vitamin D3",
                "Capsule",
                "Abbott",
                "VIT001",
                "12.00",
                50,
            ),
        ]

        medicines = []

        for index, medicine_data_row in enumerate(
            medicine_data
        ):
            (
                name,
                medicine_type,
                manufacturer,
                batch_number,
                price,
                stock,
            ) = medicine_data_row

            medicine = Medicine.objects.create(
                name=name,
                type=medicine_type,
                manufacturer=manufacturer,
                batch_number=batch_number,

                # Dates are intentionally valid for Medicine.clean().
                manufacture_date=(
                    date.today()
                    - timedelta(days=180 + index)
                ),

                expiry_date=(
                    date.today()
                    + timedelta(days=550 + index)
                ),

                price_per_unit=Decimal(price),
                stock_quantity=stock,
            )

            medicines.append(medicine)

        return medicines

    # ============================================================
    # LAB TESTS
    # ============================================================

    def seed_lab_tests(self):
        """Create laboratory master tests."""

        self.stdout.write(
            "Seeding laboratory tests..."
        )

        test_data = [
            (
                "Complete Blood Count",
                "General Medicine",
                "cells/mcL",
                "Blood",
                "Varies by parameter",
                "350.00",
            ),
            (
                "Fasting Blood Sugar",
                "General Medicine",
                "mg/dL",
                "Blood",
                "70-100",
                "150.00",
            ),
            (
                "HbA1c",
                "General Medicine",
                "%",
                "Blood",
                "Below 5.7",
                "450.00",
            ),
            (
                "Lipid Profile",
                "Cardiology",
                "mg/dL",
                "Blood",
                "Varies by parameter",
                "600.00",
            ),
            (
                "Troponin I",
                "Cardiology",
                "ng/mL",
                "Blood",
                "Below 0.04",
                "800.00",
            ),
            (
                "ECG",
                "Cardiology",
                "N/A",
                "Not Required",
                "Normal sinus rhythm",
                "500.00",
            ),
            (
                "Serum Calcium",
                "Orthopedics",
                "mg/dL",
                "Blood",
                "8.5-10.5",
                "250.00",
            ),
            (
                "Uric Acid",
                "Orthopedics",
                "mg/dL",
                "Blood",
                "3.5-7.2",
                "250.00",
            ),
            (
                "Vitamin D",
                "Orthopedics",
                "ng/mL",
                "Blood",
                "30-100",
                "900.00",
            ),
            (
                "Urine Routine",
                "General Medicine",
                "N/A",
                "Urine",
                "Normal",
                "200.00",
            ),
        ]

        lab_tests = []

        for test in test_data:
            (
                test_name,
                department,
                unit,
                sample,
                normal_range,
                price,
            ) = test

            lab_tests.append(
                LabTest.objects.create(
                    test_name=test_name,
                    department=department,
                    unit=unit,
                    sample_required=sample,
                    normal_range=normal_range,
                    price=Decimal(price),
                )
            )

        return lab_tests

    # ============================================================
    # PATIENTS
    # ============================================================

    def seed_patients(self):
        """Create patients for appointments and billing tests."""

        self.stdout.write(
            "Seeding patients..."
        )

        patient_data = [
            (
                "Arun",
                "Kumar",
                "1990-05-12",
                "Male",
                "A+",
                "9100000001",
            ),
            (
                "Neha",
                "Thomas",
                "1995-08-21",
                "Female",
                "B+",
                "9100000002",
            ),
            (
                "Rahul",
                "Nair",
                "1987-01-15",
                "Male",
                "O+",
                "9100000003",
            ),
            (
                "Anjali",
                "Menon",
                "1992-11-04",
                "Female",
                "AB+",
                "9100000004",
            ),
            (
                "Suresh",
                "Babu",
                "1975-06-16",
                "Male",
                "B-",
                "9100000005",
            ),
            (
                "Lakshmi",
                "Nair",
                "1980-09-10",
                "Female",
                "A-",
                "9100000006",
            ),
            (
                "Vishnu",
                "Raj",
                "2000-02-22",
                "Male",
                "O+",
                "9100000007",
            ),
            (
                "Arya",
                "Mohan",
                "1998-04-17",
                "Female",
                "B+",
                "9100000008",
            ),
            (
                "Manoj",
                "Krishna",
                "1968-12-01",
                "Male",
                "A+",
                "9100000009",
            ),
            (
                "Divya",
                "S",
                "1989-03-08",
                "Female",
                "O-",
                "9100000010",
            ),
            (
                "Kevin",
                "George",
                "1996-07-25",
                "Male",
                "AB+",
                "9100000011",
            ),
            (
                "Sandra",
                "Paul",
                "2001-10-13",
                "Female",
                "A+",
                "9100000012",
            ),
        ]

        patients = []

        for index, patient in enumerate(
            patient_data,
            start=1,
        ):
            (
                first_name,
                last_name,
                dob,
                gender,
                blood_group,
                phone,
            ) = patient

            patients.append(
                Patient.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    dob=date.fromisoformat(dob),
                    gender=gender,
                    address=(
                        f"Test Address {index}, Kerala"
                    ),
                    phone=phone,
                    email=(
                        f"patient{index}@example.com"
                    ),
                    blood_group=blood_group,
                    status="Active",
                )
            )

        return patients

    # ============================================================
    # DOCTOR SCHEDULES
    # ============================================================

    def seed_doctor_schedules(self, doctors):
        """
        Give every doctor Monday-Saturday availability.

        DoctorSchedule has a unique doctor + weekday
        combination, so only one schedule is created
        for each weekday.
        """

        self.stdout.write(
            "Seeding doctor schedules..."
        )

        for doctor in doctors:

            for weekday in range(6):

                DoctorSchedule.objects.create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time=time(9, 0),
                    end_time=time(17, 0),

                    morning_break_start=time(11, 0),
                    morning_break_end=time(11, 15),

                    afternoon_break_start=time(13, 0),
                    afternoon_break_end=time(14, 0),

                    evening_break_start=time(15, 30),
                    evening_break_end=time(15, 45),

                    slot_duration=15,
                )

    # ============================================================
    # APPOINTMENTS
    # ============================================================

    def seed_appointments(
        self,
        patients,
        doctors,
        departments,
    ):
        """Create appointments covering multiple workflow states."""

        self.stdout.write(
            "Seeding appointments..."
        )

        today = timezone.localdate()

        def create_appointment(
            patient,
            doctor,
            department,
            appointment_date,
            appointment_time,
            appointment_type,
            status,
            token=None,
        ):

            return Appointment.objects.create(
                patient=patient,
                doctor=doctor,
                department=department,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                appointment_type=appointment_type,
                token_no=token,
                status=status,
            )

        appointments = {}

        # --------------------------------------------------------
        # TODAY - SCHEDULED
        # --------------------------------------------------------

        appointments["today_1"] = (
            create_appointment(
                patients[0],
                doctors[0],
                departments["general"],
                today,
                time(9, 0),
                "WALK_IN",
                "Scheduled",
                1,
            )
        )

        appointments["today_2"] = (
            create_appointment(
                patients[1],
                doctors[1],
                departments["general"],
                today,
                time(9, 15),
                "WALK_IN",
                "Scheduled",
                2,
            )
        )

        appointments["today_3"] = (
            create_appointment(
                patients[2],
                doctors[2],
                departments["cardiology"],
                today,
                time(10, 0),
                "WALK_IN",
                "Scheduled",
                1,
            )
        )

        appointments["today_4"] = (
            create_appointment(
                patients[3],
                doctors[4],
                departments["orthopedics"],
                today,
                time(10, 30),
                "WALK_IN",
                "Scheduled",
                1,
            )
        )

        # Scheduled but payment is not complete.
        appointments["pending_payment"] = (
            create_appointment(
                patients[4],
                doctors[3],
                departments["cardiology"],
                today,
                time(11, 0),
                "WALK_IN",
                "Scheduled",
                None,
            )
        )

        # --------------------------------------------------------
        # COMPLETED HISTORY
        # --------------------------------------------------------

        appointments["completed_1"] = (
            create_appointment(
                patients[5],
                doctors[0],
                departments["general"],
                today - timedelta(days=3),
                time(9, 30),
                "WALK_IN",
                "Completed",
                1,
            )
        )

        appointments["completed_2"] = (
            create_appointment(
                patients[6],
                doctors[2],
                departments["cardiology"],
                today - timedelta(days=5),
                time(10, 15),
                "WALK_IN",
                "Completed",
                2,
            )
        )

        appointments["completed_3"] = (
            create_appointment(
                patients[7],
                doctors[4],
                departments["orthopedics"],
                today - timedelta(days=7),
                time(11, 0),
                "WALK_IN",
                "Completed",
                3,
            )
        )

        appointments["completed_4"] = (
            create_appointment(
                patients[8],
                doctors[1],
                departments["general"],
                today - timedelta(days=10),
                time(9, 45),
                "WALK_IN",
                "Completed",
                4,
            )
        )

        # --------------------------------------------------------
        # MISSED / CANCELLED
        # --------------------------------------------------------

        appointments["missed"] = (
            create_appointment(
                patients[9],
                doctors[3],
                departments["cardiology"],
                today - timedelta(days=2),
                time(14, 0),
                "WALK_IN",
                "Missed",
                None,
            )
        )

        appointments["cancelled"] = (
            create_appointment(
                patients[10],
                doctors[5],
                departments["orthopedics"],
                today + timedelta(days=2),
                time(10, 0),
                "PRIOR_BOOKING",
                "Cancelled",
                None,
            )
        )

        # --------------------------------------------------------
        # FUTURE PRIOR BOOKINGS
        # --------------------------------------------------------

        appointments["future_1"] = (
            create_appointment(
                patients[10],
                doctors[5],
                departments["orthopedics"],
                today + timedelta(days=3),
                time(10, 30),
                "PRIOR_BOOKING",
                "Scheduled",
                None,
            )
        )

        appointments["future_2"] = (
            create_appointment(
                patients[11],
                doctors[3],
                departments["cardiology"],
                today + timedelta(days=4),
                time(11, 30),
                "PRIOR_BOOKING",
                "Scheduled",
                None,
            )
        )

        appointments["future_3"] = (
            create_appointment(
                patients[0],
                doctors[1],
                departments["general"],
                today + timedelta(days=5),
                time(15, 0),
                "PRIOR_BOOKING",
                "Scheduled",
                None,
            )
        )

        return appointments

    # ============================================================
    # CONSULTATION BILLS
    # ============================================================

    def seed_consultation_bills(
        self,
        appointments,
    ):
        """
        Create both completed and pending
        receptionist billing states.
        """

        self.stdout.write(
            "Seeding consultation bills..."
        )

        completed_keys = [
            "today_1",
            "today_2",
            "today_3",
            "today_4",
            "completed_1",
            "completed_2",
            "completed_3",
            "completed_4",
        ]

        for index, key in enumerate(
            completed_keys
        ):

            appointment = appointments[key]

            consultation_fee = (
                appointment.doctor.consultation_fee
                or Decimal("500.00")
            )

            # Some patients simulate first visits.
            if index < 4:
                registration_fee = Decimal("100.00")
            else:
                registration_fee = Decimal("0.00")

            ConsultationBill.objects.create(
                patient=appointment.patient,
                appointment=appointment,
                registration_fee=registration_fee,
                consultation_fee=consultation_fee,
                total_amount=(
                    registration_fee
                    + consultation_fee
                ),
                payment_status="Completed",
            )

        # Pending-payment example.
        pending = appointments[
            "pending_payment"
        ]

        pending_fee = (
            pending.doctor.consultation_fee
            or Decimal("500.00")
        )

        ConsultationBill.objects.create(
            patient=pending.patient,
            appointment=pending,
            registration_fee=Decimal("100.00"),
            consultation_fee=pending_fee,
            total_amount=(
                Decimal("100.00")
                + pending_fee
            ),
            payment_status="Pending",
        )

    # ============================================================
    # CONSULTATIONS
    # ============================================================

    def seed_consultations(
        self,
        appointments,
    ):
        """Create locked historical consultations."""

        self.stdout.write(
            "Seeding consultations..."
        )

        consultation1 = (
            Consultation.objects.create(
                appointment=appointments[
                    "completed_1"
                ],
                symptoms=(
                    "Fever, headache and tiredness"
                ),
                diagnosis="Viral fever",
                notes=(
                    "Rest, hydration and medication advised."
                ),
                locked=True,
            )
        )

        consultation2 = (
            Consultation.objects.create(
                appointment=appointments[
                    "completed_2"
                ],
                symptoms=(
                    "Chest discomfort and shortness of breath"
                ),
                diagnosis=(
                    "Hypertension under evaluation"
                ),
                notes="Cardiac tests advised.",
                locked=True,
            )
        )

        consultation3 = (
            Consultation.objects.create(
                appointment=appointments[
                    "completed_3"
                ],
                symptoms="Knee pain while walking",
                diagnosis="Knee inflammation",
                notes=(
                    "Avoid strenuous activity for one week."
                ),
                locked=True,
            )
        )

        consultation4 = (
            Consultation.objects.create(
                appointment=appointments[
                    "completed_4"
                ],
                symptoms=(
                    "Persistent cough and sore throat"
                ),
                diagnosis=(
                    "Upper respiratory infection"
                ),
                notes=(
                    "Follow up if symptoms persist."
                ),
                locked=True,
            )
        )

        return [
            consultation1,
            consultation2,
            consultation3,
            consultation4,
        ]

    # ============================================================
    # MEDICINE PRESCRIPTIONS
    # ============================================================

    def seed_medicine_prescriptions(
        self,
        consultations,
        medicines,
    ):
        """
        Create:
        - issued prescriptions
        - pending prescriptions
        - outside medicine prescription
        """

        self.stdout.write(
            "Seeding medicine prescriptions..."
        )

        prescriptions = {}

        prescriptions["issued_1"] = (
            MedicinePrescription.objects.create(
                consultation=consultations[0],
                medicine=medicines[0],
                dosage="500 mg",
                quantity=10,
                frequency="Twice a day",
                duration="5 days",
                dispensed_status="ISSUED",
            )
        )

        prescriptions["issued_2"] = (
            MedicinePrescription.objects.create(
                consultation=consultations[0],
                medicine=medicines[3],
                dosage="10 mg",
                quantity=5,
                frequency="Once at night",
                duration="5 days",
                dispensed_status="ISSUED",
            )
        )

        prescriptions["pending_1"] = (
            MedicinePrescription.objects.create(
                consultation=consultations[1],
                medicine=medicines[6],
                dosage="5 mg",
                quantity=10,
                frequency="Once a day",
                duration="10 days",
                dispensed_status="PENDING",
            )
        )

        prescriptions["pending_2"] = (
            MedicinePrescription.objects.create(
                consultation=consultations[2],
                medicine=medicines[8],
                dosage="400 mg",
                quantity=6,
                frequency="Twice a day after food",
                duration="3 days",
                dispensed_status="PENDING",
            )
        )

        # Outside prescription does not reference
        # pharmacy.Medicine.
        prescriptions["outside"] = (
            MedicinePrescription.objects.create(
                consultation=consultations[3],
                medicine=None,
                other_medicine_name=(
                    "External Cough Syrup"
                ),
                other_medicine_type="Syrup",
                dosage="10 ml",
                quantity=1,
                frequency="Twice a day",
                duration="5 days",
                dispensed_status="OUTSIDE",
            )
        )

        return prescriptions

    # ============================================================
    # LAB PRESCRIPTIONS
    # ============================================================

    def seed_lab_prescriptions(
        self,
        consultations,
        lab_tests,
    ):
        """
        Create completed and pending laboratory
        prescriptions for workflow testing.
        """

        self.stdout.write(
            "Seeding laboratory prescriptions..."
        )

        prescriptions = {}

        prescriptions["completed_1"] = (
            LabPrescription.objects.create(
                consultation=consultations[0],
                lab_test=lab_tests[0],
                status="COMPLETED",
            )
        )

        prescriptions["completed_2"] = (
            LabPrescription.objects.create(
                consultation=consultations[1],
                lab_test=lab_tests[3],
                status="COMPLETED",
            )
        )

        prescriptions["completed_3"] = (
            LabPrescription.objects.create(
                consultation=consultations[2],
                lab_test=lab_tests[6],
                status="COMPLETED",
            )
        )

        # Completed but bill still pending.
        prescriptions["completed_4"] = (
            LabPrescription.objects.create(
                consultation=consultations[3],
                lab_test=lab_tests[1],
                status="COMPLETED",
            )
        )

        prescriptions["pending_1"] = (
            LabPrescription.objects.create(
                consultation=consultations[1],
                lab_test=lab_tests[4],
                status="PENDING",
            )
        )

        prescriptions["pending_2"] = (
            LabPrescription.objects.create(
                consultation=consultations[3],
                lab_test=lab_tests[9],
                status="PENDING",
            )
        )

        return prescriptions

    # ============================================================
    # MEDICINE BILLS
    # ============================================================

    def seed_medicine_bills(
        self,
        prescriptions,
    ):
        """Create historical Pharmacy sales."""

        self.stdout.write(
            "Seeding medicine bills..."
        )

        prescription1 = prescriptions[
            "issued_1"
        ]

        prescription2 = prescriptions[
            "issued_2"
        ]

        # MedicineBill.save() calculates GST
        # and total_amount automatically.
        MedicineBill.objects.create(
            bill_number="MED-BILL-001",
            prescription=prescription1,
            medicine=prescription1.medicine,
            quantity=prescription1.quantity,
            price_per_unit=(
                prescription1
                .medicine
                .price_per_unit
            ),
        )

        MedicineBill.objects.create(
            bill_number="MED-BILL-002",
            prescription=prescription2,
            medicine=prescription2.medicine,
            quantity=prescription2.quantity,
            price_per_unit=(
                prescription2
                .medicine
                .price_per_unit
            ),
        )

    # ============================================================
    # LAB RESULTS + BILLS
    # ============================================================

    def seed_lab_results_and_bills(
        self,
        prescriptions,
        lab_technicians,
    ):
        """
        Create completed lab results with both
        paid and pending laboratory bills.
        """

        self.stdout.write(
            "Seeding lab results and bills..."
        )

        result_data = [
            (
                prescriptions["completed_1"],
                lab_technicians[0],
                "CBC values within normal limits.",
                True,
                "PAID",
                True,
            ),
            (
                prescriptions["completed_2"],
                lab_technicians[1],
                "Total cholesterol: 185 mg/dL",
                False,
                "PAID",
                False,
            ),
            (
                prescriptions["completed_3"],
                lab_technicians[0],
                "Serum calcium: 9.4 mg/dL",
                True,
                "PAID",
                True,
            ),
            (
                prescriptions["completed_4"],
                lab_technicians[1],
                "Fasting blood sugar: 92 mg/dL",
                False,
                "PENDING",
                False,
            ),
        ]

        for (
            prescription,
            technician,
            result_value,
            result_emailed,
            payment_status,
            bill_emailed,
        ) in result_data:

            LabResult.objects.create(
                lab_prescription=prescription,
                tested_by=technician,
                result_value=result_value,
                emailed_status=result_emailed,
            )

            LabBill.objects.create(
                lab_prescription=prescription,
                patient=(
                    prescription
                    .consultation
                    .appointment
                    .patient
                ),
                amount=(
                    prescription.lab_test.price
                ),
                payment_status=payment_status,

                # A pending bill should not be marked
                # as already emailed.
                emailed_status=bill_emailed,
            )

    # ============================================================
    # SUMMARY
    # ============================================================

    def print_summary(self):
        """Display record counts after seeding."""

        self.stdout.write("")
        self.stdout.write(
            "=" * 60
        )
        self.stdout.write(
            "SEEDED DATA SUMMARY"
        )
        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            f"Departments            : "
            f"{Department.objects.count()}"
        )

        self.stdout.write(
            f"Staff                  : "
            f"{Staff.objects.count()}"
        )

        self.stdout.write(
            f"Patients               : "
            f"{Patient.objects.count()}"
        )

        self.stdout.write(
            f"Doctor Schedules       : "
            f"{DoctorSchedule.objects.count()}"
        )

        self.stdout.write(
            f"Appointments           : "
            f"{Appointment.objects.count()}"
        )

        self.stdout.write(
            f"Consultation Bills     : "
            f"{ConsultationBill.objects.count()}"
        )

        self.stdout.write(
            f"Consultations          : "
            f"{Consultation.objects.count()}"
        )

        self.stdout.write(
            f"Medicines              : "
            f"{Medicine.objects.count()}"
        )

        self.stdout.write(
            f"Medicine Prescriptions : "
            f"{MedicinePrescription.objects.count()}"
        )

        self.stdout.write(
            f"Medicine Bills         : "
            f"{MedicineBill.objects.count()}"
        )

        self.stdout.write(
            f"Lab Tests              : "
            f"{LabTest.objects.count()}"
        )

        self.stdout.write(
            f"Lab Prescriptions      : "
            f"{LabPrescription.objects.count()}"
        )

        self.stdout.write(
            f"Lab Results            : "
            f"{LabResult.objects.count()}"
        )

        self.stdout.write(
            f"Lab Bills              : "
            f"{LabBill.objects.count()}"
        )

        self.stdout.write(
            "=" * 60
        )

    # ============================================================
    # LOGIN CREDENTIALS
    # ============================================================

    def print_login_credentials(self):
        """Display common credentials for the whole team."""

        self.stdout.write("")
        self.stdout.write(
            "=" * 70
        )

        self.stdout.write(
            "TEST LOGIN CREDENTIALS"
        )

        self.stdout.write(
            "=" * 70
        )

        credentials = [
            (
                "Admin",
                "admin1",
                "admin123",
            ),
            (
                "Receptionist",
                "receptionist1",
                "reception123",
            ),
            (
                "Receptionist",
                "receptionist2",
                "reception123",
            ),
            (
                "Doctor - General",
                "doctor1",
                "doctor123",
            ),
            (
                "Doctor - General",
                "doctor2",
                "doctor123",
            ),
            (
                "Doctor - Cardiology",
                "doctor3",
                "doctor123",
            ),
            (
                "Doctor - Cardiology",
                "doctor4",
                "doctor123",
            ),
            (
                "Doctor - Orthopedics",
                "doctor5",
                "doctor123",
            ),
            (
                "Doctor - Orthopedics",
                "doctor6",
                "doctor123",
            ),
            (
                "Pharmacist",
                "pharmacist1",
                "pharmacy123",
            ),
            (
                "Pharmacist",
                "pharmacist2",
                "pharmacy123",
            ),
            (
                "Lab Technician",
                "labtech1",
                "lab123",
            ),
            (
                "Lab Technician",
                "labtech2",
                "lab123",
            ),
        ]

        for (
            role,
            username,
            password,
        ) in credentials:

            self.stdout.write(
                f"{role:<24} | "
                f"{username:<15} | "
                f"{password}"
            )

        self.stdout.write(
            "=" * 70
        )