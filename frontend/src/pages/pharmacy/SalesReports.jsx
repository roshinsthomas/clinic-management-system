import { useEffect, useState } from "react";
import { getSalesReport } from "../../services/pharmacyApi";

function SalesReports({ onBack }) {

  const [period, setPeriod] = useState("daily");

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // LOAD SALES REPORT
  // =====================================================

  const loadReport = async (selectedPeriod = period) => {

    try {

      setLoading(true);
      setError("");

      const data = await getSalesReport(selectedPeriod);

      setReport(data);

    } catch (err) {

      setError(err.message);

      setReport(null);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD INITIAL REPORT
  // =====================================================

  useEffect(() => {

    loadReport("daily");

  }, []);


  // =====================================================
  // CHANGE PERIOD
  // =====================================================

  const handlePeriodChange = (selectedPeriod) => {

    setPeriod(selectedPeriod);

    loadReport(selectedPeriod);

  };


  return (

    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Sales & Reports
          </h2>

          <p className="text-muted mb-0">
            View medicine sales and revenue reports
          </p>

        </div>


        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="alert alert-danger">
          {error}
        </div>

      )}


      {/* ================================================= */}
      {/* REPORT PERIOD */}
      {/* ================================================= */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Select Report Period
          </h5>


          <div className="d-flex gap-2">

            <button
              type="button"
              className={
                period === "daily"
                  ? "btn btn-primary"
                  : "btn btn-outline-primary"
              }
              onClick={() => handlePeriodChange("daily")}
            >
              Daily
            </button>


            <button
              type="button"
              className={
                period === "weekly"
                  ? "btn btn-primary"
                  : "btn btn-outline-primary"
              }
              onClick={() => handlePeriodChange("weekly")}
            >
              Weekly
            </button>


            <button
              type="button"
              className={
                period === "monthly"
                  ? "btn btn-primary"
                  : "btn btn-outline-primary"
              }
              onClick={() => handlePeriodChange("monthly")}
            >
              Monthly
            </button>


            <button
              type="button"
              className="btn btn-outline-secondary ms-auto"
              onClick={() => loadReport(period)}
              disabled={loading}
            >
              Refresh
            </button>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loading ? (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <div
              className="spinner-border text-primary"
              role="status"
            ></div>

            <p className="text-muted mt-2 mb-0">
              Loading sales report...
            </p>

          </div>

        </div>

      ) : report ? (

        <>

          {/* ================================================= */}
          {/* REPORT PERIOD */}
          {/* ================================================= */}

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body">

              <h5 className="fw-bold mb-1">
                {period === "daily"
                  ? "Daily Sales Report"
                  : period === "weekly"
                  ? "Weekly Sales Report"
                  : "Monthly Sales Report"}
              </h5>

              <p className="text-muted mb-0">

                {report.start_date} to {report.end_date}

              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* SUMMARY CARDS */}
          {/* ================================================= */}

          <div className="row g-4 mb-4">

            {/* Total Bills */}

            <div className="col-md-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    Total Bills
                  </h6>

                  <h2 className="fw-bold">
                    {report.total_bills}
                  </h2>

                  <p className="text-muted mb-0">
                    Medicine bills generated
                  </p>

                </div>

              </div>

            </div>


            {/* Total Quantity */}

            <div className="col-md-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    Medicines Sold
                  </h6>

                  <h2 className="fw-bold">
                    {report.total_quantity}
                  </h2>

                  <p className="text-muted mb-0">
                    Total units dispensed
                  </p>

                </div>

              </div>

            </div>


            {/* Subtotal */}

            <div className="col-md-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    Subtotal
                  </h6>

                  <h2 className="fw-bold">
                    ₹{report.subtotal}
                  </h2>

                  <p className="text-muted mb-0">
                    Before GST
                  </p>

                </div>

              </div>

            </div>


            {/* Revenue */}

            <div className="col-md-6 col-xl-3">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h6 className="text-muted">
                    Total Revenue
                  </h6>

                  <h2 className="fw-bold text-success">
                    ₹{report.total_revenue}
                  </h2>

                  <p className="text-muted mb-0">
                    Including GST
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* FINANCIAL SUMMARY */}
          {/* ================================================= */}

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                Financial Summary
              </h5>


              <div className="table-responsive">

                <table className="table table-bordered align-middle">

                  <tbody>

                    <tr>

                      <th>
                        Report Period
                      </th>

                      <td>
                        {report.period}
                      </td>

                    </tr>


                    <tr>

                      <th>
                        Start Date
                      </th>

                      <td>
                        {report.start_date}
                      </td>

                    </tr>


                    <tr>

                      <th>
                        End Date
                      </th>

                      <td>
                        {report.end_date}
                      </td>

                    </tr>


                    <tr>

                      <th>
                        Total Bills
                      </th>

                      <td>
                        {report.total_bills}
                      </td>

                    </tr>


                    <tr>

                      <th>
                        Total Medicines Sold
                      </th>

                      <td>
                        {report.total_quantity}
                      </td>

                    </tr>


                    <tr>

                      <th>
                        Subtotal
                      </th>

                      <td>
                        ₹{report.subtotal}
                      </td>

                    </tr>


                    <tr>

                      <th>
                        GST
                      </th>

                      <td>
                        ₹{report.total_gst}
                      </td>

                    </tr>


                    <tr>

                      <th>
                        Total Revenue
                      </th>

                      <td className="fw-bold text-success">
                        ₹{report.total_revenue}
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </>

      ) : (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <p className="text-muted mb-0">
              No sales report available.
            </p>

          </div>

        </div>

      )}

    </div>

  );
}

export default SalesReports;