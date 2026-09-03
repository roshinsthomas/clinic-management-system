import { useState } from "react";

import Login from "./pages/Login";

// Admin imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepartmentList from "./pages/admin/DepartmentList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";

// Pharmacy imports
import MedicineInventory from "./pages/pharmacy/MedicineInventory";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import Prescriptions from "./pages/pharmacy/Prescriptions";
import MedicineBills from "./pages/pharmacy/MedicineBills";
import PharmacyLayout from "./pages/pharmacy/PharmacyLayout";
import SalesReports from "./pages/pharmacy/SalesReports";

// Doctor imports
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

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


  const [page, setPage] = useState(() => {

    const role = localStorage.getItem("role");

    if (role === "ADMIN") {
      return "admin";
    } else if (role === "DOCTOR") {
      return "doctor";
    } else if (role === "RECEPTIONIST") {
      return "receptionist";
    } else if (role === "PHARMACIST") {
      return "pharmacist";
    } else if (role === "LAB_TECHNICIAN") {
      return "laboratory";
    }

    return "dashboard";
  });


  // LOGIN
  const handleLogin = (role) => {

    setLoggedIn(true);

    if (role === "ADMIN") {
      setPage("admin");
    } else if (role === "DOCTOR") {
      setPage("doctor");
    } else if (role === "RECEPTIONIST") {
      setPage("receptionist");
    } else if (role === "PHARMACIST") {
      setPage("pharmacist");
    } else if (role === "LAB_TECHNICIAN") {
      setPage("laboratory");
    }
  };


  // LOGOUT
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


  // LOGIN PAGE
  if (!loggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


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


  // ADMIN DASHBOARD
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

        onLogout={handleLogout}
      />
    );
  }


  // DOCTOR DASHBOARD
  if (page === "doctor") {

    return (
      <DoctorDashboard
        onLogout={handleLogout}
      />
    );
  }


  // RECEPTIONIST DASHBOARD
  if (page === "receptionist") {

    return (
      <div className="container-fluid min-vh-100 bg-light p-4">

        <h2 className="fw-bold">
          Receptionist Dashboard
        </h2>

        <p className="text-muted">
          Welcome to the Receptionist Dashboard
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


  // ================= PHARMACY MODULE =================

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


  // ================= LABORATORY MODULE =================


  // LAB TESTS
  if (page === "lab-tests") {

    return (
      <LabTests
        onPageChange={setPage}
      />
    );
  }


  // LAB REQUESTS
  if (page === "lab-requests") {

    return (
      <LabRequests
        onPageChange={setPage}
      />
    );
  }


  // LAB RESULTS
  if (page === "lab-results") {

    return (
      <LabResults
        onPageChange={setPage}
      />
    );
  }


  // ENTER LAB RESULT
  if (page === "enter-lab-result") {

    return (
      <EnterLabResult
        onPageChange={setPage}
      />
    );
  }


  // LABORATORY DASHBOARD
  if (page === "laboratory") {

    return (
      <LaboratoryDashboard
        onLogout={handleLogout}
        onPageChange={setPage}
      />
    );
  }


  // DEFAULT
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

      onLogout={handleLogout}
    />
  );
}


export default App;