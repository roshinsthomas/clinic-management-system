function ReceptionistDashboard() {
  return (
    <div className="container-fluid min-vh-100 bg-light p-0">

      {/* Header */}
      <nav className="navbar navbar-dark bg-primary px-3 px-md-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            Clinic Management System
          </span>

          <span className="text-white fw-semibold">
            Receptionist
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4 px-3 px-md-4">

        {/* Welcome */}
        <div className="mb-4">
          <h2 className="fw-bold">Receptionist Dashboard</h2>
          <p className="text-muted mb-0">
            Manage patients, appointments and consultation bills.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="row g-4">

          {/* Patients */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold">
                  👥 Patients
                </h5>

                <p className="card-text text-muted">
                  Register new patients and view patient details.
                </p>

                <button className="btn btn-primary">
                  Manage Patients
                </button>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold">
                  📅 Appointments
                </h5>

                <p className="card-text text-muted">
                  Schedule and manage patient appointments.
                </p>

                <button className="btn btn-success">
                  Manage Appointments
                </button>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold">
                  💰 Consultation Bills
                </h5>

                <p className="card-text text-muted">
                  Create and manage consultation bills.
                </p>

                <button className="btn btn-warning">
                  Manage Bills
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ReceptionistDashboard;