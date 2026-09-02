function PharmacyDashboard({ onMedicines, onPrescriptions, onBills, onBack }) {
  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Pharmacy Dashboard
          </h2>

          <p className="text-muted mb-0">
            Clinic Management System
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          Back to Dashboard
        </button>

      </div>


      {/* Summary Cards */}
      <div className="row g-4 mb-4">

        {/* Total Medicines */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Total Medicines
              </h6>

              <h2 className="fw-bold">
                0
              </h2>

              <p className="text-muted mb-0">
                Available medicines
              </p>
            </div>
          </div>
        </div>


        {/* Low Stock */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Low Stock
              </h6>

              <h2 className="fw-bold">
                0
              </h2>

              <p className="text-muted mb-0">
                Medicines need restocking
              </p>
            </div>
          </div>
        </div>


        {/* Pending Prescriptions */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Pending Prescriptions
              </h6>

              <h2 className="fw-bold">
                0
              </h2>

              <p className="text-muted mb-0">
                Waiting for dispensing
              </p>
            </div>
          </div>
        </div>


        {/* Today's Bills */}
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Today's Bills
              </h6>

              <h2 className="fw-bold">
                0
              </h2>

              <p className="text-muted mb-0">
                Medicine bills today
              </p>
            </div>
          </div>
        </div>

      </div>


      {/* Quick Actions */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-4">
            Pharmacy Management
          </h5>

          <div className="row g-3">

            <div className="col-md-4">
              <button
                className="btn btn-primary w-100 p-3"
                onClick={onMedicines}
              >
                💊 Medicines
              </button>
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-primary w-100 p-3"
                onClick={onPrescriptions}
              >
                📋 Prescriptions
              </button>
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-primary w-100 p-3"
                onClick={onBills}
              >
                🧾 Medicine Bills
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PharmacyDashboard;