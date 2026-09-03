// Main landing page for the Doctor module.
function DoctorDashboard({ onLogout }) {
  return (
    <div className="container-fluid min-vh-100 bg-light p-4">
      <h2 className="fw-bold">Doctor Dashboard</h2>

      <p className="text-muted">
        Welcome to the Doctor test Dashboard
      </p>

      {/* Ends the current authenticated session. */}
      <button
        className="btn btn-outline-danger"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default DoctorDashboard;