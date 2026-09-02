import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepartmentList from "./pages/admin/DepartmentList";
import StaffList from "./pages/admin/StaffList";
import DoctorList from "./pages/admin/DoctorList";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [page, setPage] = useState("dashboard");

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

    setLoggedIn(false);
    setPage("dashboard");
  };

  // LOGIN PAGE
  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

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

  // ADMIN DASHBOARD
  if (page === "admin") {
    return (
      <AdminDashboard
        onDepartmentClick={() => setPage("departments")}
        onStaffClick={() => setPage("staff")}
        onDoctorClick={() => setPage("doctors")}
        onLogout={handleLogout}
      />
    );
  }

  // DOCTOR DASHBOARD
  if (page === "doctor") {
    return (
      <div className="container-fluid min-vh-100 bg-light p-4">
        <h2 className="fw-bold">Doctor Dashboard</h2>
        <p className="text-muted">
          Welcome to the Doctor Dashboard
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

  // RECEPTIONIST DASHBOARD
  if (page === "receptionist") {
    return (
      <div className="container-fluid min-vh-100 bg-light p-4">
        <h2 className="fw-bold">Receptionist Dashboard</h2>
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

  // PHARMACIST DASHBOARD
  if (page === "pharmacist") {
    return (
      <div className="container-fluid min-vh-100 bg-light p-4">
        <h2 className="fw-bold">Pharmacy Dashboard</h2>
        <p className="text-muted">
          Welcome to the Pharmacy Dashboard
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

  // LAB TECHNICIAN DASHBOARD
  if (page === "laboratory") {
    return (
      <div className="container-fluid min-vh-100 bg-light p-4">
        <h2 className="fw-bold">Laboratory Dashboard</h2>
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

  // DEFAULT
  return (
    <AdminDashboard
      onDepartmentClick={() => setPage("departments")}
      onStaffClick={() => setPage("staff")}
      onDoctorClick={() => setPage("doctors")}
      onLogout={handleLogout}
    />
  );
}

export default App;