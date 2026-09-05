import { useState } from "react";

import Login from "./pages/Login";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepartmentList from "./pages/admin/DepartmentList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";
import MedicineList from "./pages/admin/MedicineList";

// ================= PHARMACY =================
import MedicineInventory from "./pages/pharmacy/MedicineInventory";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import Prescriptions from "./pages/pharmacy/Prescriptions";
import MedicineBills from "./pages/pharmacy/MedicineBills";
import PharmacyLayout from "./pages/pharmacy/PharmacyLayout";
import SalesReports from "./pages/pharmacy/SalesReports";

// ================= DOCTOR =================
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// ================= RECEPTIONIST =================
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import PatientRegistration from "./pages/receptionist/PatientRegistration";
import PatientList from "./pages/receptionist/PatientList";
import ScheduleAppointment from "./pages/receptionist/ScheduleAppointment";
import AppointmentList from "./pages/receptionist/AppointmentList";
import CreateBill from "./pages/receptionist/CreateBill";
import BillList from "./pages/receptionist/BillList";


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

  // Opens Schedule Appointment for the patient from
  // a missed appointment without changing the old appointment.
  const handleRescheduleAppointment = (appointment) => {
    setSelectedPatientId(appointment.patient);
    setPage("schedule-appointment");
  };

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

    setLoggedIn(false);
    setPage("dashboard");

    // Clear any previously selected patient
    setSelectedPatientId(null);

    // Clear any previously selected appointment
    setSelectedAppointmentId(null);
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


  // DEPARTMENT MANAGEMENT

  if (page === "departments") {

    return (
      <DepartmentList
        onBack={() => setPage("admin")}
      />
    );
  }


  // STAFF MANAGEMENT

  if (page === "staff") {

    return (
      <StaffList
        onBack={() => setPage("admin")}
      />
    );
  }


  // DOCTOR MANAGEMENT

  if (page === "doctors") {

    return (
      <DoctorList
        onBack={() => setPage("admin")}
      />
    );
  }


  // MEDICINE MANAGEMENT

  if (page === "medicines") {

    return (
      <MedicineList
        onBack={() => setPage("admin")}
      />
    );
  }


  // ADMIN DASHBOARD

  if (page === "admin") {

    return (
      <AdminDashboard
        onDepartmentClick={() => setPage("departments")}
        onStaffClick={() => setPage("staff")}
        onDoctorClick={() => setPage("doctors")}
        onMedicineClick={() => setPage("medicines")}
        onLogout={handleLogout}
      />
    );
  }


  // ============================================================
  // ==================== RECEPTIONIST ==========================
  // ============================================================


  // RECEPTIONIST DASHBOARD

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


  // PATIENT REGISTRATION

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


  // PATIENT LIST

  if (page === "patient-list") {

    return (
      <PatientList
        onBack={() =>
          setPage("receptionist")
        }
      />
    );
  }


  // SCHEDULE APPOINTMENT

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


  // APPOINTMENT LIST

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


  // CREATE BILL

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

      />
    );
  }


  // BILL LIST

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
  // ======================== DOCTOR =============================
  // ============================================================

  if (page === "doctor") {

    return (
      <DoctorDashboard
        onLogout={handleLogout}
      />
    );
  }


  // ============================================================
  // ======================== PHARMACY ===========================
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

        {/* Pharmacy Dashboard */}

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


        {/* Medicine Inventory */}

        {page === "medicine-inventory" && (

          <MedicineInventory

            onBack={() =>
              setPage("pharmacist")
            }

          />

        )}


        {/* Prescriptions */}

        {page === "prescriptions" && (

          <Prescriptions

            onBack={() =>
              setPage("pharmacist")
            }

          />

        )}


        {/* Medicine Bills */}

        {page === "medicine-bills" && (

          <MedicineBills

            onBack={() =>
              setPage("pharmacist")
            }

          />

        )}


        {/* Sales Reports */}

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

  if (page === "laboratory") {

    return (
      <div className="container-fluid min-vh-100 bg-light p-4">

        <h2 className="fw-bold">
          Laboratory Dashboard
        </h2>

        <p className="text-muted">
          Welcome to the Laboratory Dashboard
        </p>

        <button
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
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