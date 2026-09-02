import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import DepartmentList from "./pages/DepartmentList";
import StaffList from "./pages/StaffList";
import DoctorList from "./pages/DoctorList";
function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [page, setPage] = useState("dashboard");

  const handleLogin = () => {
    setLoggedIn(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (page === "departments") {
    return (
      <DepartmentList
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "staff") {
    return (
      <StaffList
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "doctors") {
  return (
    <DoctorList
      onBack={() => setPage("dashboard")}
    />
  );
  }

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