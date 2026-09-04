import React, { useEffect, useState } from "react";

import {
  getLabResults,
  getLabBills,
  createLabBill,
  payLabBill,
  emailLabBill,
} from "../../services/laboratoryService";


const LabResults = ({ onPageChange }) => {

  const [results, setResults] = useState([]);
  const [bills, setBills] = useState([]);

  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState(false);
  const [message, setMessage] = useState("");


  // Load results and bills
  const loadData = async () => {

    try {

      setLoading(true);

      const resultData = await getLabResults();
      const billData = await getLabBills();

      setResults(
        Array.isArray(resultData)
          ? resultData
          : resultData.results || []
      );

      setBills(
        Array.isArray(billData)
          ? billData
          : billData.results || []
      );

    } catch (error) {

      console.error(error);

      setMessage(
        error.message ||
        "Failed to load laboratory data"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // Find bill for a result
  const getBillForResult = (result) => {

    return bills.find(
      (bill) =>
        bill.lab_prescription ===
        result.lab_prescription
    );

  };


  // Generate bill
  const handleGenerateBill = async (result) => {

    try {

      setMessage("");

      const existingBill =
        getBillForResult(result);

      if (existingBill) {

        setSelectedBill(existingBill);

        return;
      }


      const data = await createLabBill({
        lab_prescription:
          result.lab_prescription,
      });


      const newBill =
        data.bill || data;


      setBills((previousBills) => [
        ...previousBills,
        newBill,
      ]);


      setSelectedBill(newBill);

      setMessage(
        "Laboratory bill generated successfully."
      );

    } catch (error) {

      console.error(error);

      setMessage(
        error.message ||
        "Failed to generate laboratory bill"
      );

    }

  };


  // Complete payment
  const handlePayBill = async () => {

    if (!selectedBill) {
      return;
    }


    try {

      setPayingBill(true);
      setMessage("");


      const data = await payLabBill(
        selectedBill.lab_bill_id
      );


      const updatedBill =
        data.bill || data;


      setBills((previousBills) =>
        previousBills.map((bill) =>
          bill.lab_bill_id ===
          updatedBill.lab_bill_id
            ? updatedBill
            : bill
        )
      );


      setSelectedBill(updatedBill);


      setMessage(
        "Payment completed successfully."
      );

    } catch (error) {

      console.error(error);

      setMessage(
        error.message ||
        "Failed to complete payment"
      );

    } finally {

      setPayingBill(false);

    }

  };


  // Email bill
  const handleEmailBill = async () => {

    if (!selectedBill) {
      return;
    }


    if (
      selectedBill.payment_status !==
      "PAID"
    ) {

      setMessage(
        "Payment must be completed before emailing the bill."
      );

      return;
    }


    try {

      setMessage("");


      const data = await emailLabBill(
      selectedBill.lab_bill_id
    );

    // Update the bill in local state so the UI changes immediately.
    setBills((previousBills) =>
      previousBills.map((bill) =>
        bill.lab_bill_id === selectedBill.lab_bill_id
          ? {
              ...bill,
              emailed_status: data.emailed_status,
            }
          : bill
      )
    );

    // Update the currently opened bill card too.
    setSelectedBill((previousBill) => ({
      ...previousBill,
      emailed_status: data.emailed_status,
    }));

    setMessage(
      "Laboratory bill emailed successfully."
    );
  } catch (error) {
    console.error(error);

    setMessage(
      error.message ||
      "Failed to email laboratory bill"
    );
  }
};


  if (loading) {

    return (

      <div className="container mt-4">

        <h2>
          Laboratory Results
        </h2>

        <p>
          Loading...
        </p>

      </div>

    );

  }


  return (

    <div className="container mt-4">


      {/* Back to Laboratory Dashboard */}

      <div className="d-flex justify-content-end mb-3">

        <button
          className="btn btn-secondary"
          onClick={() =>
            onPageChange("laboratory")
          }
        >
          ← Back to Dashboard
        </button>

      </div>


      <h2 className="mb-4">
        Laboratory Results
      </h2>


      {message && (

        <div className="alert alert-info">
          {message}
        </div>

      )}


      {results.length === 0 ? (

        <div className="alert alert-secondary">

          No laboratory results found.

        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-bordered table-striped">

            <thead>

              <tr>

                <th>
                  Patient
                </th>

                <th>
                  Test
                </th>

                <th>
                  Department
                </th>

                <th>
                  Doctor
                </th>

                <th>
                  Result
                </th>

                <th>
                  Report Date
                </th>

                <th>
                  Bill Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {results.map((result) => {

                const bill =
                  getBillForResult(result);


                return (

                  <tr
                    key={result.result_id}
                  >

                    <td>
                      {result.patient_name}
                    </td>

                    <td>
                      {result.test_name}
                    </td>

                    <td>
                      {result.department}
                    </td>

                    <td>
                      {result.doctor_name}
                    </td>

                    <td>
                      {result.result_value}
                    </td>

                    <td>

                      {new Date(
                        result.report_date
                      ).toLocaleString()}

                    </td>


                    <td>

                      {!bill && (

                        <span className="badge bg-secondary m-2">
                          Not Generated
                        </span>

                      )}


                      {bill &&
                        bill.payment_status ===
                        "PENDING" && (

                          <span className="badge bg-warning text-dark m-2">
                            Payment Pending
                          </span>

                        )}


                      {bill &&
                        bill.payment_status ===
                        "PAID" && (

                          <span className="badge bg-success m-2">
                            Paid
                          </span>

                        )}

                    </td>


                    <td>

                      <button
                        className="btn btn-primary btn-sm m-2"
                        onClick={() =>
                          setSelectedResult(result)
                        }
                      >
                        View Result
                      </button>


                      {!bill ? (

                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            handleGenerateBill(result)
                          }
                        >
                          Generate Bill
                        </button>

                      ) : (

                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() =>
                            setSelectedBill(bill)
                          }
                        >
                          View Bill
                        </button>

                      )}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}


      {/* Result Details */}

      {selectedResult && (

        <div className="card mt-4">

          <div className="card-header">

            <h4 className="mb-0">
              Laboratory Result
            </h4>

          </div>


          <div className="card-body">

            <p>
              <strong>
                Patient:
              </strong>{" "}
              {selectedResult.patient_name}
            </p>

            <p>
              <strong>
                Test:
              </strong>{" "}
              {selectedResult.test_name}
            </p>

            <p>
              <strong>
                Department:
              </strong>{" "}
              {selectedResult.department}
            </p>

            <p>
              <strong>
                Sample Required:
              </strong>{" "}
              {selectedResult.sample_required}
            </p>

            <p>
              <strong>
                Normal Range:
              </strong>{" "}
              {selectedResult.normal_range}
            </p>

            <p>
              <strong>
                Doctor:
              </strong>{" "}
              {selectedResult.doctor_name}
            </p>

            <p>
              <strong>
                Result:
              </strong>{" "}
              {selectedResult.result_value}
            </p>

            <p>
              <strong>
                Tested By:
              </strong>{" "}
              {selectedResult.tested_by_name}
            </p>

            <p>
              <strong>
                Report Date:
              </strong>{" "}

              {new Date(
                selectedResult.report_date
              ).toLocaleString()}

            </p>


            <button
              className="btn btn-secondary"
              onClick={() =>
                setSelectedResult(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* Bill Details */}

      {selectedBill && (

        <div className="card mt-4">

          <div className="card-header">

            <h4 className="mb-0">
              Laboratory Bill
            </h4>

          </div>


          <div className="card-body">

            <p>
              <strong>
                Bill ID:
              </strong>{" "}
              {selectedBill.lab_bill_id}
            </p>

            <p>
              <strong>
                Patient:
              </strong>{" "}
              {selectedBill.patient}
            </p>

            <p>
              <strong>
                Amount:
              </strong>{" "}
              ₹{selectedBill.amount}
            </p>


            <p>

              <strong>
                Payment Status:
              </strong>{" "}


              {selectedBill.payment_status ===
              "PAID" ? (

                <span className="badge bg-success">
                  Paid
                </span>

              ) : (

                <span className="badge bg-warning text-dark">
                  Payment Pending
                </span>

              )}

            </p>


            <div className="mt-3">


              {/* Complete Payment */}

              {selectedBill.payment_status !==
                "PAID" && (

                <button
                  className="btn btn-success me-2"
                  onClick={handlePayBill}
                  disabled={payingBill}
                >

                  {payingBill
                    ? "Processing Payment..."
                    : "Complete Payment"}

                </button>

              )}


              {/* Email only after payment */}

              {/* Allow emailing only after payment and only once. */}
              {selectedBill.payment_status === "PAID" && (
                <button
                  className={
                    selectedBill.emailed_status
                      ? "btn btn-success me-2"
                      : "btn btn-primary me-2"
                  }
                  onClick={handleEmailBill}
                  disabled={selectedBill.emailed_status}
                >
                  {selectedBill.emailed_status
                    ? "Email Sent"
                    : "Email Bill"}
                </button>
              )}


              <button
                className="btn btn-secondary"
                onClick={() =>
                  setSelectedBill(null)
                }
              >
                Close
              </button>

            </div>


            {selectedBill.payment_status !==
              "PAID" && (

              <div className="text-muted mt-3">

                Complete the payment before
                emailing the laboratory bill.

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

};


export default LabResults;