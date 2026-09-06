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

  if (page === "departments") {

    return (
      <DepartmentList
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }


  if (page === "staff") {

    return (
      <StaffList
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }


  if (page === "doctors") {

    return (
      <DoctorList
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }


  if (page === "medicines") {

    return (
      <MedicineList
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }


  if (page === "admin-lab-tests") {

    return (
      <LabTestList
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }


  if (page === "admin") {

    return (
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

        onLogout={handleLogout}
      />
    );
  }


  // ============================================================
  // ==================== RECEPTIONIST ==========================
  // ============================================================

  if (page === "receptionist") {

    return (
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

        onLogout={handleLogout}

      />
    );
  }


  // ============================================================
  // PATIENT REGISTRATION
  // ============================================================

  if (page === "patient-registration") {

    return (
      <PatientRegistration

        onBack={() =>
          setPage("receptionist")
        }

        onScheduleAppointment={(patientId) => {

          setSelectedPatientId(patientId);

          setSelectedAppointmentId(null);

          setPage("schedule-appointment");
        }}

      />
    );
  }


  // ============================================================
  // PATIENT LIST
  // ============================================================

  if (page === "patient-list") {

    return (
      <PatientList

        onBack={() =>
          setPage("receptionist")
        }

        // Open Schedule Appointment directly
        // for the patient currently being viewed.
        onScheduleAppointment={(patient) => {

          setSelectedPatientId(
            patient?.patient_id ??
            patient?.id ??
            null
          );

          setSelectedAppointmentId(null);

          setPage("schedule-appointment");
        }}

      />
    );
  }


  // ============================================================
  // SCHEDULE APPOINTMENT
  // ============================================================

  if (page === "schedule-appointment") {

    return (
      <ScheduleAppointment

        initialPatientId={selectedPatientId}

        onBack={() => {

          setSelectedPatientId(null);
          setSelectedAppointmentId(null);

          setPage("receptionist");
        }}

        onAppointmentScheduled={(appointment) => {

          setSelectedAppointmentId(
            appointment?.appointment_id ??
            appointment?.id ??
            null
          );

          setSelectedPatientId(null);

          setPage("create-bill");
        }}

      />
    );
  }


  // ============================================================
  // APPOINTMENT LIST
  // ============================================================

  if (page === "appointment-list") {

    return (
      <AppointmentList

        onBack={() =>
          setPage("receptionist")
        }

        onScheduleAppointment={() => {

          setSelectedPatientId(null);
          setSelectedAppointmentId(null);

          setPage("schedule-appointment");
        }}

        onRescheduleAppointment={
          handleRescheduleAppointment
        }

      />
    );
  }


  // ============================================================
  // CREATE BILL
  // ============================================================

  if (page === "create-bill") {

    return (
      <CreateBill

        initialAppointmentId={
          selectedAppointmentId
        }

        onBack={() => {

          setSelectedAppointmentId(null);

          setPage("receptionist");
        }}

        onPaymentCompleted={(data) => {

          setReceiptData(data);

          setSelectedAppointmentId(null);

          setPage("receipt-bill");
        }}

      />
    );
  }


  // ============================================================
  // RECEIPT BILL
  // ============================================================

  if (page === "receipt-bill") {

    return (
      <ReceiptBill

        receiptData={receiptData}

        onBack={() => {

          setReceiptData(null);

          setPage("receptionist");
        }}

      />
    );
  }


  // ============================================================
  // BILL LIST
  // ============================================================

  if (page === "bill-list") {

    return (
      <BillList
        onBack={() =>
          setPage("receptionist")
        }
      />
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
      <PatientHistory

        patientId={
          selectedPatientId
        }

        onBack={() =>
          setPage(historyBackPage)
        }

      />
    );
  }


  // ============================================================
  // VIEW COMPLETED CONSULTATION
  // ============================================================

  if (page === "doctor-view-consultation") {

    return (
      <ViewConsultation

        appointmentId={
          selectedAppointmentId
        }

        onBack={() =>
          setPage(historyBackPage)
        }

      />
    );
  }


  // ============================================================
  // ======================== PHARMACY ==========================
  // ============================================================

  if (
    page === "pharmacist" ||
    page === "medicine-inventory" ||
    page === "prescriptions" ||
    page === "medicine-bills" ||
    page === "sales-reports"
  ) {

    return (
      <PharmacyLayout

        currentPage={page}

        onNavigate={(newPage) => {
          setPage(newPage);
        }}

        onBack={() =>
          setPage("dashboard")
        }

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

      </PharmacyLayout>
    );
  }


  // ============================================================
  // ====================== LABORATORY ==========================
  // ============================================================

  if (page === "lab-tests") {

    return (
      <LabTests
        onPageChange={setPage}
      />
    );
  }


  if (page === "lab-requests") {

    return (
      <LabRequests
        onPageChange={setPage}
      />
    );
  }


  if (page === "lab-results") {

    return (
      <LabResults
        onPageChange={setPage}
      />
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
      <LaboratoryDashboard
        onLogout={handleLogout}
        onPageChange={setPage}
      />
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