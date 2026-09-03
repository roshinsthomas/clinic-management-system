import { useEffect, useState } from "react";
import { getMedicineBills } from "../../services/pharmacyApi";

function MedicineBills({ onBack }) {

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBill, setSelectedBill] = useState(null);


  // Load bills
  const loadBills = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getMedicineBills();

      setBills(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadBills();

  }, []);


  // Close bill
  const closeBill = () => {

    setSelectedBill(null);

  };


  return (

    <div className="container-fluid min-vh-100 bg-light p-4">


      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Medicine Bills
          </h2>

          <p className="text-muted mb-0">
            View medicine bills generated from dispensing
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


      {/* Error */}

      {error && (

        <div className="alert alert-danger">
          {error}
        </div>

      )}


      {/* Bills */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">


          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Generated Bills
            </h5>


            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={loadBills}
              disabled={loading}
            >
              Refresh
            </button>

          </div>


          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-2">
                Loading bills...
              </p>

            </div>

          ) : bills.length === 0 ? (

            <div className="text-center py-5">

              <h6 className="fw-bold">
                No Medicine Bills
              </h6>

              <p className="text-muted mb-0">
                No medicine bills have been generated yet.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>Bill Number</th>

                    <th>Patient</th>
                    <th>Doctor</th>

                    <th>Medicine</th>

                    <th>Quantity</th>

                    <th>Total Amount</th>

                    <th>Date</th>

                    <th>Status</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {bills.map((bill) => (

                    <tr key={bill.id}>

                      <td className="fw-semibold">
                        {bill.bill_number}
                      </td>


                      <td>
                        {bill.patient_name}
                      </td>

                        <td>
                        {bill.doctor_name}
                        </td>

                      <td>
                        {bill.medicine_name}
                      </td>


                      <td>
                        {bill.quantity}
                      </td>


                      <td>
                        ₹{bill.total_amount}
                      </td>


                      <td>
                        {new Date(
                          bill.bill_date
                        ).toLocaleString()}
                      </td>


                      <td>

                        <span className="badge bg-success">

                          {bill.dispensed_status}

                        </span>

                      </td>


                      <td>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            setSelectedBill(bill)
                          }
                        >
                          View Bill
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* BILL DETAILS MODAL */}

      {selectedBill && (

        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content print-bill">


              {/* Modal Header */}

              <div className="modal-header no-print">

                <h5 className="modal-title fw-bold">
                  Medicine Bill
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeBill}
                ></button>

              </div>


              {/* Bill */}

              <div className="modal-body">

                <div className="text-center mb-4">

                  <h4 className="fw-bold">
                    Clinic Management System
                  </h4>

                  <p className="text-muted mb-0">
                    Medicine Bill
                  </p>

                </div>


                <hr />


                {/* Bill Information */}

                <div className="row mb-3">

                  <div className="col-6">

                    <strong>
                      Bill Number
                    </strong>

                    <p className="mb-0">
                      {selectedBill.bill_number}
                    </p>

                  </div>


                  <div className="col-6">

                    <strong>
                      Date
                    </strong>

                    <p className="mb-0">

                      {new Date(
                        selectedBill.bill_date
                      ).toLocaleString()}

                    </p>

                  </div>

                </div>


                {/* Patient */}

                <div className="mb-3">

                  <strong>
                    Patient
                  </strong>

                  <p className="mb-0">
                    {selectedBill.patient_name}
                  </p>

                </div>
                <div className="mb-3">

                <strong>
                    Doctor
                </strong>

                <p className="mb-0">
                    {selectedBill.doctor_name}
                </p>

                </div>


                {/* Appointment */}

                <div className="mb-3">

                  <strong>
                    Appointment ID
                  </strong>

                  <p className="mb-0">
                    {selectedBill.appointment_id}
                  </p>

                </div>


                <hr />


                {/* Medicine Details */}

                <h6 className="fw-bold mb-3">
                  Medicine Details
                </h6>


                <div className="table-responsive">

                  <table className="table table-bordered">

                    <thead>

                      <tr>

                        <th>
                          Medicine
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Price / Unit
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      <tr>

                        <td>
                          {selectedBill.medicine_name}
                        </td>

                        <td>
                          {selectedBill.quantity}
                        </td>

                        <td>
                          ₹{selectedBill.price_per_unit}
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>


                {/* Total */}

                <div className="d-flex justify-content-between align-items-center mt-4">

                  <h5 className="fw-bold">
                    Total Amount
                  </h5>

                  <h4 className="fw-bold text-success">

                    ₹{selectedBill.total_amount}

                  </h4>

                </div>


                {/* Status */}

                <div className="text-center mt-3">

                  <span className="badge bg-success">

                    {selectedBill.dispensed_status}

                  </span>

                </div>

              </div>


              {/* Footer */}

              <div className="modal-footer no-print">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeBill}
                >
                  Close
                </button>

                <button
  type="button"
  className="btn btn-primary"
  onClick={() => window.print()}
>
   Print Bill
</button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MedicineBills;
<style>
{`
@media print {

  body * {
    visibility: hidden;
  }

  .print-bill,
  .print-bill * {
    visibility: visible;
  }

  .print-bill {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: white;
    padding: 30px;
  }

  .no-print {
    display: none !important;
  }

}
`}
</style>