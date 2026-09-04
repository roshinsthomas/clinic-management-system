import { useState } from "react";

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


// Laboratory imports
import LaboratoryDashboard from "./pages/Laboratory/LaboratoryDashboard";
import LabTests from "./pages/Laboratory/LabTests";
import LabRequests from "./pages/Laboratory/LabRequests";
import LabResults from "./pages/Laboratory/LabResults";
import EnterLabResult from "./pages/Laboratory/EnterLabResult";


function App() {

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  // Stores the appointment selected for consultation.
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Stores the patient selected for viewing history.
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Stores which page opened Patient History so Back returns correctly.
  const [historyBackPage, setHistoryBackPage] = useState("doctor-appointments");

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
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }


  // STAFF MANAGEMENT

  if (page === "staff") {

    return (
      <StaffList
        onBack={() =>
          setPage("admin")
        }
      />
    );
  }


  // DOCTOR MANAGEMENT

  if (page === "doctors") {

    return (
      <DoctorList
        onBack={() =>
          setPage("admin")
        }
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
  // LAB TEST MANAGEMENT 
  if (page === "admin-lab-tests") {
    return (<LabTestList onBack={() => setPage("admin")}
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
        onLabTestClick={() => setPage("admin-lab-tests")}
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

        onScheduleAppointment={() =>
          setPage("schedule-appointment")
        }

        onAppointmentList={() =>
          setPage("appointment-list")
        }

        onCreateBill={() =>
          setPage("create-bill")
        }

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
        onBack={() =>
          setPage("receptionist")
        }
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
      />
    );
  }


  // CREATE BILL

  if (page === "create-bill") {

    return (
      <CreateBill
        onBack={() =>
          setPage("receptionist")
        }
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
  // ======================== DOCTOR ============================
  // ============================================================

  // DOCTOR DASHBOARD
  if (page === "doctor") {

    return (
      <DoctorDashboard
        // Navigate to the Doctor appointments page.
        onAppointments={() => setPage("doctor-appointments")}

        // Patients page will be connected later.
        onPatients={() => setPage("doctor-patients")}

        // Consultation pages will be connected later.
        onStartConsultation={(appointmentId) => {
          // Store the selected appointment and open the consultation page.
          setSelectedAppointmentId(appointmentId);
          setPage("doctor-consultation");
        }}

        onViewConsultation={(appointmentId) => {
          // Store the completed appointment and open the read-only consultation page.
          setSelectedAppointmentId(appointmentId);
          setPage("doctor-view-consultation");
          setHistoryBackPage("doctor");
          setPage("doctor-view-consultation");
        }}

        onLogout={handleLogout}
      />
    );
  }


  // ALL DOCTOR APPOINTMENTS
  if (page === "doctor-appointments") {
    return (
      <DoctorAppointments
        // Return to the Doctor dashboard.
        onBack={() => setPage("doctor")}

        // These actions will be connected to real pages later.
        onStartConsultation={(appointmentId) => {
          // Store the selected appointment and open the consultation page.
          setSelectedAppointmentId(appointmentId);
          setPage("doctor-consultation");
        }}

        onViewConsultation={(appointmentId) => {
          // Store the completed appointment and open the read-only consultation page.
          setSelectedAppointmentId(appointmentId);
          setPage("doctor-view-consultation");
          setHistoryBackPage("doctor-appointments");
          setPage("doctor-view-consultation");
        }}

        onViewHistory={(patientId) => {
          // Store the selected patient and open the history page.
          setSelectedPatientId(patientId);
          setPage("doctor-patient-history");
          setHistoryBackPage("doctor-appointments");
          setPage("doctor-patient-history");
        }}
      />
    );
  }

  // DOCTOR CONSULTATION
  if (page === "doctor-consultation") {
    return (
      <Consultation
        appointmentId={selectedAppointmentId}

        // Return to the full Doctor appointments page.
        onBack={() => setPage("doctor-appointments")}

        // After saving, open the completed consultation in read-only mode.
        onSaved={(appointmentId) => {
          setSelectedAppointmentId(appointmentId);
          setHistoryBackPage("doctor-appointments");
          setPage("doctor-view-consultation");
        }}
      />
    );
  }

  // DOCTOR PATIENTS
  if (page === "doctor-patients") {
    return (
      <DoctorPatients
        // Return to the Doctor dashboard.
        onBack={() => setPage("doctor")}

        // Patient history page will be connected next.
        onViewHistory={(patientId) => {
          // Store the selected patient and open the history page.
          setSelectedPatientId(patientId);
          setPage("doctor-patient-history");
          setHistoryBackPage("doctor-patients");
          setPage("doctor-patient-history");
        }}
      />
    );
  }

  // DOCTOR PATIENT HISTORY
  if (page === "doctor-patient-history") {
    return (
      <PatientHistory
        patientId={selectedPatientId}

        // Return to the Doctor appointments page.
        onBack={() => setPage(historyBackPage)}
      />
    );
  }

  // VIEW COMPLETED CONSULTATION
  if (page === "doctor-view-consultation") {
    return (
      <ViewConsultation
        appointmentId={selectedAppointmentId}

        // Return to the full appointments page.
        onBack={() => setPage(historyBackPage)}
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
        onBack={() => setPage("dashboard")}
        onLogout={handleLogout}
      >
        {/* Pharmacy Dashboard */}
        {page === "pharmacist" && (
          <PharmacyDashboard
            onMedicines={() => setPage("medicine-inventory")}
            onPrescriptions={() => setPage("prescriptions")}
            onBills={() => setPage("medicine-bills")}
            onSalesReports={() => setPage("sales-reports")}
            onLogout={handleLogout}
          />
        )}

        {/* Medicine Inventory */}
        {page === "medicine-inventory" && (
          <MedicineInventory
            onBack={() => setPage("pharmacist")}
          />
        )}

        {/* Prescriptions */}
        {page === "prescriptions" && (
          <Prescriptions
            onBack={() => setPage("pharmacist")}
          />
        )}

        {/* Medicine Bills */}
        {page === "medicine-bills" && (
          <MedicineBills
            onBack={() => setPage("pharmacist")}
          />
        )}

        {/* Sales Reports */}
        {page === "sales-reports" && (
          <SalesReports
            onBack={() => setPage("pharmacist")}
          />
        )}
      </PharmacyLayout>
    );
  }


  // ============================================================
  // ====================== LABORATORY ===========================
  // ============================================================

  // Display the laboratory test master list.
  if (page === "lab-tests") {
    return (
      <LabTests
        onPageChange={setPage}
      />
    );
  }


  // Display pending laboratory requests.
  if (page === "lab-requests") {
    return (
      <LabRequests
        onPageChange={setPage}
      />
    );
  }


  // Display completed laboratory results.
  if (page === "lab-results") {
    return (
      <LabResults
        onPageChange={setPage}
      />
    );
  }


  // Page used by the lab technician to enter a test result.
  if (page === "enter-lab-result") {
    return (
      <EnterLabResult
        onPageChange={setPage}
      />
    );
  }


  // Laboratory dashboard.
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

  // Fall back to Login if no valid page is selected.
  return (
    <Login
      onLogin={handleLogin}
    />
  );
}

export default App;
