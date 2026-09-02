function AdminDashboard() {
  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">
            Clinic Management System
          </p>
        </div>

        <button className="btn btn-outline-danger">
          Logout
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="row g-4">

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Departments</h6>
              <h2 className="fw-bold">0</h2>
              <p className="text-muted mb-0">
                Manage departments
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Staff</h6>
              <h2 className="fw-bold">0</h2>
              <p className="text-muted mb-0">
                Manage staff members
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Doctors</h6>
              <h2 className="fw-bold">0</h2>
              <p className="text-muted mb-0">
                Manage doctors
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Medicines</h6>
              <h2 className="fw-bold">0</h2>
              <p className="text-muted mb-0">
                Manage medicines
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
        <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
         <h6 className="text-muted">Lab Tests</h6>
        <h2 className="fw-bold">0</h2>
        <p className="text-muted mb-0">
        Manage lab tests
        </p>
        </div>
     </div>
    </div>

      </div>

    </div>
  );
}

export default AdminDashboard;