import { useEffect, useState } from "react";
import { getPharmacyDashboardSummary } from "../../services/pharmacyApi";
function PharmacyDashboard({
  onMedicines,
  onPrescriptions,
  onBills,
  onSalesReports,
}) {
  const [summary, setSummary] = useState({
  total_medicines: 0,
  low_stock: 0,
  pending_prescriptions: 0,
  todays_bills: 0,
});

const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadSummary = async () => {
    try {
      const data = await getPharmacyDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to load dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  loadSummary();
}, []);

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Pharmacy Dashboard
        </h2>

        <p className="text-muted mb-0">
          Manage medicines, prescriptions, billing and sales
        </p>
      </div>


      {/* ================= SUMMARY CARDS ================= */}
      <div className="row g-4 mb-4">

        {/* Total Medicines */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h6 className="text-muted">
                Total Medicines
              </h6>

              <h2 className="fw-bold">
                {loading ? "..." : summary.total_medicines}
              </h2>

              <p className="text-muted mb-0">
                Available medicines
              </p>

            </div>
          </div>
        </div>


        {/* Low Stock */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h6 className="text-muted">
                Low Stock
              </h6>

              <h2 className="fw-bold">
              {loading ? "..." : summary.low_stock}
              </h2>

              <p className="text-muted mb-0">
                Medicines need restocking
              </p>

            </div>
          </div>
        </div>


        {/* Pending Prescriptions */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h6 className="text-muted">
                Pending Prescriptions
              </h6>

              <h2 className="fw-bold">
                {loading ? "..." : summary.pending_prescriptions}
              </h2>

              <p className="text-muted mb-0">
                Waiting for dispensing
              </p>

            </div>
          </div>
        </div>


        {/* Today's Bills */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">

              <h6 className="text-muted">
                Today's Bills
              </h6>

              <h2 className="fw-bold">
                {loading ? "..." : summary.todays_bills}
              </h2>

              <p className="text-muted mb-0">
                Medicine bills today
              </p>

            </div>
          </div>
        </div>

      </div>


      {/* ================= QUICK ACTIONS ================= */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-4">
            Pharmacy Management
          </h5>

          <div className="row g-3">

            {/* Medicines */}
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary w-100 p-3"
                onClick={onMedicines}
              >
                💊 Manage Medicines
              </button>
            </div>


            {/* Prescriptions */}
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary w-100 p-3"
                onClick={onPrescriptions}
              >
                📋 View Prescriptions
              </button>
            </div>


            {/* Bills */}
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary w-100 p-3"
                onClick={onBills}
              >
                🧾 View Medicine Bills
              </button>
            </div>

            {/* Sales Reports */}
      <div className="col-md-4">
        <button
          type="button"
          className="btn btn-primary w-100 p-3"
          onClick={onSalesReports}
        >
          📊 Sales & Reports
        </button>
      </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PharmacyDashboard;