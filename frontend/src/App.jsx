import { useState } from "react";
// Shared styling for common Clinic Management System layouts.
import "./styles/layout.css";
// Shared HealthSync layout used by authenticated module pages.
import Layout from "./components/Layout";


import Login from "./pages/Login";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepartmentList from "./pages/admin/DepartmentList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";
import MedicineList from "./pages/admin/MedicineList";
import LabTestList from "./pages/admin/LabTestList";

// ================= Pharmacy =================
import MedicineInventory from "./pages/pharmacy/MedicineInventory";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import Prescriptions from "./pages/pharmacy/Prescriptions";
import MedicineBills from "./pages/pharmacy/MedicineBills";
import PharmacyLayout from "./pages/pharmacy/PharmacyLayout";
import SalesReports from "./pages/pharmacy/SalesReports";

// ================= DOCTOR =================
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import Consultation from "./pages/doctor/Consultation";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import PatientHistory from "./pages/doctor/PatientHistory";
import ViewConsultation from "./pages/doctor/ViewConsultation";

// ================= RECEPTIONIST =================
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import PatientRegistration from "./pages/receptionist/PatientRegistration";
import PatientList from "./pages/receptionist/PatientList";
import ScheduleAppointment from "./pages/receptionist/ScheduleAppointment";
import AppointmentList from "./pages/receptionist/AppointmentList";
import CreateBill from "./pages/receptionist/CreateBill";
import BillList from "./pages/receptionist/BillList";
import ReceiptBill from "./pages/receptionist/ReceiptBill";

// ================= LABORATORY =================
import LaboratoryDashboard from "./pages/Laboratory/LaboratoryDashboard";
import LabTests from "./pages/Laboratory/LabTests";
import LabRequests from "./pages/Laboratory/LabRequests";
import LabResults from "./pages/Laboratory/LabResults";
import EnterLabResult from "./pages/Laboratory/EnterLabResult";


function App() {

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  // Stores the patient that should be automatically
  // selected when opening Schedule Appointment.
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Stores the appointment that should be automatically
  // selected when opening Consultation Billing after scheduling.
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Stores the completed bill and appointment information
  // that should be displayed on the Receipt Bill page.
  const [receiptData, setReceiptData] = useState(null);

  // Opens Schedule Appointment for the patient from
  // a missed appointment without changing the old appointment.
  const handleRescheduleAppointment = (appointment) => {
    setSelectedPatientId(appointment.patient);
    setPage("schedule-appointment");
  };


  // Stores which page opened Patient History so Back returns correctly.
  const [historyBackPage, setHistoryBackPage] = useState(
    "doctor-appointments"
  );

  const [page, setPage] = useState(() => {

    const role = localStorage.getItem("role");

    if (role === "ADMIN") {
      return "admin";
    }

    if (role === "DOCTOR") {
      return "doctor";
    }

    if (role === "RECEPTIONIST") {
      return "receptionist";
    }

    if (role === "PHARMACIST") {
      return "pharmacist";
    }

    if (role === "LAB_TECHNICIAN") {
      return "laboratory";
    }

    return "dashboard";
  });


  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = (role) => {

    setLoggedIn(true);

    if (role === "ADMIN") {
      setPage("admin");
    }

    else if (role === "DOCTOR") {
      setPage("doctor");
    }

    else if (role === "RECEPTIONIST") {
      setPage("receptionist");
    }

    else if (role === "PHARMACIST") {
      setPage("pharmacist");
    }

    else if (role === "LAB_TECHNICIAN") {
      setPage("laboratory");
    }
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("staff_id");
    localStorage.removeItem("username");
    localStorage.removeItem("selected_lab_prescription");

    setLoggedIn(false);
    setPage("dashboard");

    setSelectedPatientId(null);
    setSelectedAppointmentId(null);
    setReceiptData(null);
  };


  // ============================================================
  // LOGIN PAGE
  // ============================================================

  if (!loggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  // ============================================================
  // ======================= ADMIN ==============================
  // ============================================================
  // Navigation options displayed in the Admin HealthSync navbar.
  const adminNavItems = [
    {
      label: "Dashboard",
      page: "admin",
    },
    {
      label: "Departments",
      page: "departments",
    },
    {
      label: "Staff",
      page: "staff",
    },
    {
      label: "Doctors",
      page: "doctors",
    },
    {
      label: "Medicines",
      page: "medicines",
    },
    {
      label: "Lab Tests",
      page: "admin-lab-tests",
    },
  ];
  if (page === "departments") {

    return (
      <Layout
        // Highlight Departments while managing department records.
        currentPage={page}
        navItems={adminNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <DepartmentList
          onBack={() =>
            setPage("admin")
          }
        />
      </Layout>
    );
  }


  if (page === "staff") {

    return (
      <Layout
        // Highlight Staff while managing staff records.
        currentPage={page}
        navItems={adminNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <StaffList
          onBack={() =>
            setPage("admin")
          }
        />
      </Layout>
    );
  }


  if (page === "doctors") {

    return (
      <Layout
        // Highlight Doctors while managing doctor records.
        currentPage={page}
        navItems={adminNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <DoctorList
          onBack={() =>
            setPage("admin")
          }
        />
      </Layout>
    );
  }


  if (page === "medicines") {

    return (
      <Layout
        // Highlight Medicines while managing Medicine records.
        currentPage={page}
        navItems={adminNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <MedicineList
          onBack={() =>
            setPage("admin")
          }
        />
      </Layout>
    );
  }


  if (page === "admin-lab-tests") {

    return (
      <Layout
        // Highlight Lab Tests while managing laboratory test records.
        currentPage={page}
        navItems={adminNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <LabTestList
          onBack={() =>
            setPage("admin")
          }
        />
      </Layout>
    );
  }


  if (page === "admin") {

    return (
      <Layout
        currentPage={page}
        navItems={adminNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <AdminDashboard
          onDepartmentClick={() =>
            setPage("departments")
          }

          onStaffClick={() =>
            setPage("staff")
          }

          onDoctorClick={() =>
            setPage("doctors")
          }

          onMedicineClick={() =>
            setPage("medicines")
          }

          onLabTestClick={() =>
            setPage("admin-lab-tests")
          }

        />
      </Layout>
    );
  }


  // ============================================================
  // ==================== RECEPTIONIST ==========================
  // ============================================================

  // Main navigation options displayed in the Receptionist HealthSync navbar.
  // Main Receptionist sections shown in the shared HealthSync navbar.
  const receptionistNavItems = [
    {
      label: "Dashboard",
      page: "receptionist",
    },
    {
      label: "Patients",
      page: "receptionist-patients",
    },
    {
      label: "Appointments",
      page: "receptionist-appointments",
    },
    {
      label: "Consultation Bills",
      page: "receptionist-billing",
    },
  ];

  if (page === "receptionist") {

    return (
      <Layout
        // Shared HealthSync navigation for the Receptionist module.
        currentPage="receptionist"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <ReceptionistDashboard

          onPatientRegistration={() =>
            setPage("patient-registration")
          }

          onPatientList={() =>
            setPage("patient-list")
          }

          onScheduleAppointment={() => {

            setSelectedPatientId(null);
            setSelectedAppointmentId(null);

            setPage("schedule-appointment");
          }}

          onAppointmentList={() =>
            setPage("appointment-list")
          }

          onCreateBill={() => {

            setSelectedAppointmentId(null);

            setPage("create-bill");
          }}

          onBillList={() =>
            setPage("bill-list")
          }



        />
      </Layout>
    );
  }

  if (page === "receptionist-patients") {
    return (
      <Layout
        // Highlight Patients in the shared Receptionist navbar.
        currentPage="receptionist-patients"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <ReceptionistDashboard
          initialSection="patients"
          onPatientRegistration={() =>
            setPage("patient-registration")
          }

          onPatientList={() =>
            setPage("patient-list")
          }

          onScheduleAppointment={() => {
            // Clear previous selections before creating an appointment.
            setSelectedPatientId(null);
            setSelectedAppointmentId(null);

            setPage("schedule-appointment");
          }}

          onAppointmentList={() =>
            setPage("appointment-list")
          }

          onCreateBill={() => {
            // Start a fresh consultation billing workflow.
            setSelectedAppointmentId(null);

            setPage("create-bill");
          }}

          onBillList={() =>
            setPage("bill-list")
          }
        />
      </Layout>
    );
  }

  if (page === "receptionist-appointments") {
    return (
      <Layout
        // Highlight Appointments in the shared Receptionist navbar.
        currentPage="receptionist-appointments"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <ReceptionistDashboard
          initialSection="appointments"

          onPatientRegistration={() =>
            setPage("patient-registration")
          }

          onPatientList={() =>
            setPage("patient-list")
          }

          onScheduleAppointment={() => {
            // Clear previous selections before creating an appointment.
            setSelectedPatientId(null);
            setSelectedAppointmentId(null);

            setPage("schedule-appointment");
          }}

          onAppointmentList={() =>
            setPage("appointment-list")
          }

          onCreateBill={() => {
            // Start a fresh consultation billing workflow.
            setSelectedAppointmentId(null);

            setPage("create-bill");
          }}

          onBillList={() =>
            setPage("bill-list")
          }
        />
      </Layout>
    );
  }

  if (page === "receptionist-billing") {
    return (
      <Layout
        // Highlight Consultation Bills in the shared Receptionist navbar.
        currentPage="receptionist-billing"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <ReceptionistDashboard
          initialSection="billing"

          onPatientRegistration={() =>
            setPage("patient-registration")
          }

          onPatientList={() =>
            setPage("patient-list")
          }

          onScheduleAppointment={() => {
            // Clear previous selections before creating an appointment.
            setSelectedPatientId(null);
            setSelectedAppointmentId(null);

            setPage("schedule-appointment");
          }}

          onAppointmentList={() =>
            setPage("appointment-list")
          }

          onCreateBill={() => {
            // Start a fresh consultation billing workflow.
            setSelectedAppointmentId(null);

            setPage("create-bill");
          }}

          onBillList={() =>
            setPage("bill-list")
          }
        />
      </Layout>
    );
  }

  // ============================================================
  // PATIENT REGISTRATION
  // ============================================================

  if (page === "patient-registration") {

    return (
      <Layout
        // Patient registration belongs under the Patients section.
        currentPage="receptionist-patients"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <PatientRegistration

          onBack={() =>
            setPage("receptionist-patients")
          }

          onScheduleAppointment={(patientId) => {

            setSelectedPatientId(patientId);

            setSelectedAppointmentId(null);

            setPage("schedule-appointment");
          }}

        />
      </Layout>
    );
  }


  // ============================================================
  // PATIENT LIST
  // ============================================================

  if (page === "patient-list") {
    return (
      <Layout
        // Patient list belongs under the Patients section.
        currentPage="receptionist-patients"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <PatientList
          onBack={() =>
            setPage("receptionist-patients")
          }

          onScheduleAppointment={(patient) => {
            // Preserve the selected patient for appointment scheduling.
            setSelectedPatientId(
              patient?.patient_id ??
              patient?.id ??
              null
            );

            setSelectedAppointmentId(null);

            setPage("schedule-appointment");
          }}
        />
      </Layout>
    );
  }


  // ============================================================
  // SCHEDULE APPOINTMENT
  // ============================================================

  if (page === "schedule-appointment") {
    return (
      <Layout
        // Appointment scheduling belongs under the Appointments section.
        currentPage="receptionist-appointments"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <ScheduleAppointment
          initialPatientId={selectedPatientId}

          onBack={() => {
            // Clear temporary selections when leaving the scheduling page.
            setSelectedPatientId(null);
            setSelectedAppointmentId(null);

            setPage("receptionist-appointments");
          }}

          onAppointmentScheduled={(appointment) => {
            // Keep the new appointment ID for consultation billing.
            setSelectedAppointmentId(
              appointment?.appointment_id ??
              appointment?.id ??
              null
            );

            setSelectedPatientId(null);

            setPage("create-bill");
          }}
        />
      </Layout>
    );
  }


  // ============================================================
  // APPOINTMENT LIST
  // ============================================================

  if (page === "appointment-list") {
    return (
      <Layout
        // Appointment list belongs under the Appointments section.
        currentPage="receptionist-appointments"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <AppointmentList
          onBack={() =>
            setPage("receptionist-appointments")
          }

          onScheduleAppointment={() => {
            // Start a fresh appointment scheduling workflow.
            setSelectedPatientId(null);
            setSelectedAppointmentId(null);

            setPage("schedule-appointment");
          }}

          onRescheduleAppointment={
            handleRescheduleAppointment
          }
        />
      </Layout>
    );
  }

  // ============================================================
  // CREATE BILL
  // ============================================================

  if (page === "create-bill") {
    return (
      <Layout
        // Consultation billing belongs under the billing section.
        currentPage="receptionist-billing"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <CreateBill
          initialAppointmentId={selectedAppointmentId}

          onBack={() => {
            // Clear the selected appointment when leaving billing.
            setSelectedAppointmentId(null);

            setPage("receptionist-billing");
          }}

          onPaymentCompleted={(data) => {
            // Preserve payment information for the receipt page.
            setReceiptData(data);
            setSelectedAppointmentId(null);

            setPage("receipt-bill");
          }}
        />
      </Layout>
    );
  }


  // ============================================================
  // RECEIPT BILL
  // ============================================================

  if (page === "receipt-bill") {
    return (
      <Layout
        // Receipt is part of the Receptionist billing workflow.
        currentPage="receptionist-billing"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <ReceiptBill
          receiptData={receiptData}

          onBack={() => {
            // Clear receipt data before returning to Billing Management.
            setReceiptData(null);

            setPage("receptionist-billing");
          }}
        />
      </Layout>
    );
  }

  // ============================================================
  // BILL LIST
  // ============================================================

  if (page === "bill-list") {
    return (
      <Layout
        // Bill history belongs under the Consultation Bills section.
        currentPage="receptionist-billing"
        navItems={receptionistNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <BillList
          onBack={() =>
            setPage("receptionist-billing")
          }
        />
      </Layout>
    );
  }


  // ============================================================
  // ======================== DOCTOR ============================
  // ============================================================
  // Navigation options displayed in the Doctor HealthSync navbar.
  const doctorNavItems = [
    {
      label: "Dashboard",
      page: "doctor",
    },
    {
      label: "Appointments",
      page: "doctor-appointments",
    },
    {
      label: "Patients",
      page: "doctor-patients",
    },
  ];
  if (page === "doctor") {

    return (
      <Layout
        currentPage={page}
        navItems={doctorNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <DoctorDashboard

          onAppointments={() =>
            setPage("doctor-appointments")
          }

          onPatients={() =>
            setPage("doctor-patients")
          }

          onStartConsultation={(appointmentId) => {

            setSelectedAppointmentId(
              appointmentId
            );

            setPage("doctor-consultation");
          }}

          onViewConsultation={(appointmentId) => {

            setSelectedAppointmentId(
              appointmentId
            );

            setPage("doctor-view-consultation");

            setHistoryBackPage("doctor");

            setPage("doctor-view-consultation");
          }}

          onLogout={handleLogout}
        />
      </Layout>
    );
  }


  // ============================================================
  // ALL DOCTOR APPOINTMENTS
  // ============================================================

  if (page === "doctor-appointments") {

    return (
      <Layout
        currentPage={page}
        navItems={doctorNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <DoctorAppointments

          onBack={() =>
            setPage("doctor")
          }

          onStartConsultation={(appointmentId) => {

            setSelectedAppointmentId(
              appointmentId
            );

            setPage("doctor-consultation");
          }}

          onViewConsultation={(appointmentId) => {

            setSelectedAppointmentId(
              appointmentId
            );

            setPage("doctor-view-consultation");

            setHistoryBackPage(
              "doctor-appointments"
            );

            setPage("doctor-view-consultation");
          }}

          onViewHistory={(patientId) => {

            setSelectedPatientId(
              patientId
            );

            setPage("doctor-patient-history");

            setHistoryBackPage(
              "doctor-appointments"
            );

            setPage("doctor-patient-history");
          }}

        />
      </Layout>
    );
  }


  // ============================================================
  // DOCTOR CONSULTATION
  // ============================================================

  if (page === "doctor-consultation") {

    return (
      <Layout
        // Consultation belongs to the Appointments section.
        currentPage="doctor-appointments"
        navItems={doctorNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <Consultation

          appointmentId={
            selectedAppointmentId
          }

          onBack={() =>
            setPage("doctor-appointments")
          }

          onSaved={(appointmentId) => {

            setSelectedAppointmentId(
              appointmentId
            );

            setHistoryBackPage(
              "doctor-appointments"
            );

            setPage(
              "doctor-view-consultation"
            );
          }}

        />
      </Layout>
    );
  }


  // ============================================================
  // DOCTOR PATIENTS
  // ============================================================

  if (page === "doctor-patients") {

    return (
      <Layout
        currentPage={page}
        navItems={doctorNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <DoctorPatients

          onBack={() =>
            setPage("doctor")
          }

          onViewHistory={(patientId) => {

            setSelectedPatientId(
              patientId
            );

            setPage(
              "doctor-patient-history"
            );

            setHistoryBackPage(
              "doctor-patients"
            );

            setPage(
              "doctor-patient-history"
            );
          }}

        />
      </Layout>
    );
  }


  // ============================================================
  // DOCTOR PATIENT HISTORY
  // ============================================================

  if (page === "doctor-patient-history") {

    return (
      <Layout
        // Patient History belongs to the Patients section.
        currentPage="doctor-patients"
        navItems={doctorNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <PatientHistory

          patientId={
            selectedPatientId
          }

          onBack={() =>
            setPage(historyBackPage)
          }

        />
      </Layout>
    );
  }


  // ============================================================
  // VIEW COMPLETED CONSULTATION
  // ============================================================

  if (page === "doctor-view-consultation") {

    return (
      <Layout
        // View Consultation belongs to the Appointments section.
        currentPage="doctor-appointments"
        navItems={doctorNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <ViewConsultation

          appointmentId={
            selectedAppointmentId
          }

          onBack={() =>
            setPage(historyBackPage)
          }

        />
      </Layout>
    );
  }


  // ============================================================
  // ======================== PHARMACY ==========================
  // ============================================================

  // Pharmacy sections shown in the shared HealthSync navbar.
  const pharmacyNavItems = [
    {
      label: "Dashboard",
      page: "pharmacist",
    },
    {
      label: "Medicines",
      page: "medicine-inventory",
    },
    {
      label: "Prescriptions",
      page: "prescriptions",
    },
    {
      label: "Medicine Bills",
      page: "medicine-bills",
    },
    {
      label: "Sales Reports",
      page: "sales-reports",
    },
  ];


  if (
    page === "pharmacist" ||
    page === "medicine-inventory" ||
    page === "prescriptions" ||
    page === "medicine-bills" ||
    page === "sales-reports"
  ) {

    return (
      <Layout
        // Shared HealthSync navigation for all Pharmacy pages.
        currentPage={page}
        navItems={pharmacyNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >

        {page === "pharmacist" && (

          <PharmacyDashboard

            onMedicines={() =>
              setPage("medicine-inventory")
            }

            onPrescriptions={() =>
              setPage("prescriptions")
            }

            onBills={() =>
              setPage("medicine-bills")
            }

            onSalesReports={() =>
              setPage("sales-reports")
            }

            onLogout={handleLogout}

          />

        )}


        {page === "medicine-inventory" && (

          <MedicineInventory

            onBack={() =>
              setPage("pharmacist")
            }

          />

        )}


        {page === "prescriptions" && (

          <Prescriptions

            onBack={() =>
              setPage("pharmacist")
            }

          />

        )}


        {page === "medicine-bills" && (

          <MedicineBills

            onBack={() =>
              setPage("pharmacist")
            }

          />

        )}


        {page === "sales-reports" && (

          <SalesReports

            onBack={() =>
              setPage("pharmacist")
            }

          />

        )}

      </Layout>
    );
  }


  // ============================================================
  // ====================== LABORATORY ==========================
  // ============================================================

  // Laboratory sections shown in the shared HealthSync navbar.
  const laboratoryNavItems = [
    {
      label: "Dashboard",
      page: "laboratory",
    },
    {
      label: "Lab Tests",
      page: "lab-tests",
    },
    {
      label: "Prescriptions",
      page: "lab-requests",
    },
    {
      label: "Lab results",
      page: "lab-results",
    },
  ];

  if (page === "lab-tests") {
    return (
      <Layout
        // Lab Tests is a main Laboratory navigation section.
        currentPage="lab-tests"
        navItems={laboratoryNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <LabTests
          onPageChange={setPage}
        />
      </Layout>
    );
  }


  if (page === "lab-requests") {
    return (
      <Layout
        // Lab Requests belongs to the Laboratory workflow.
        currentPage="lab-requests"
        navItems={laboratoryNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <LabRequests
          onPageChange={setPage}
        />
      </Layout>
    );
  }


  if (page === "lab-results") {
    return (
      <Layout
        // Lab Results is a main Laboratory navigation section.
        currentPage="lab-results"
        navItems={laboratoryNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <LabResults
          onPageChange={setPage}
        />
      </Layout>
    );
  }


  if (page === "enter-lab-result") {

    return (
      <EnterLabResult
        onPageChange={setPage}
      />
    );
  }


  if (page === "laboratory") {
    return (
      <Layout
        // Shared HealthSync navigation for the Laboratory module.
        currentPage="laboratory"
        navItems={laboratoryNavItems}
        onNavigate={setPage}
        onLogout={handleLogout}
      >
        <LaboratoryDashboard
          onLogout={handleLogout}
          onPageChange={setPage}
        />
      </Layout>
    );
  }


  // ============================================================
  // DEFAULT
  // ============================================================

  return (
    <Login
      onLogin={handleLogin}
    />
  );
}

export default App;