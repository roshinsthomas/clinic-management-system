import React, { useEffect, useState } from "react";

import {
  getLabRequests,
  createLabResult,
} from "../../services/laboratoryService";


function EnterLabResult({ onPageChange }) {

  const [prescription, setPrescription] = useState(null);

  const [result, setResult] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  // Load selected prescription
  useEffect(() => {

    const prescriptionId =
      localStorage.getItem(
        "selected_lab_prescription"
      );

    if (!prescriptionId) {

      setError(
        "No laboratory test selected."
      );

      setLoading(false);

      return;
    }

    loadPrescription(prescriptionId);

  }, []);


  const loadPrescription = async (
    prescriptionId
  ) => {

    try {

      setLoading(true);
      setError("");

      const requests =
        await getLabRequests();

      const selectedRequest =
        requests.find(
          (request) =>
            String(
              request.lab_prescription_id
            ) === String(prescriptionId)
        );


      if (!selectedRequest) {

        setError(
          "Laboratory prescription not found."
        );

        return;
      }


      if (selectedRequest.status !== "PENDING") {

        setError(
          "This laboratory test has already been completed."
        );

        return;
      }


      setPrescription(
        selectedRequest
      );

    } catch (err) {

      setError(
        err.message ||
        "Failed to load laboratory test"
      );

    } finally {

      setLoading(false);

    }
  };


  // Submit result
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    if (result.trim() === "") {

      setError(
        "Please enter the test result."
      );

      return;
    }


    if (!prescription) {

      setError(
        "Laboratory prescription not found."
      );

      return;
    }


    try {

      setSubmitting(true);


      let resultValue =
        result.trim();


      if (remarks.trim() !== "") {

        resultValue +=
          `\nRemarks: ${remarks.trim()}`;

      }


      await createLabResult({

        lab_prescription:
          prescription.lab_prescription_id,

        result_value:
          resultValue,

      });


      alert(
        "Laboratory result submitted successfully."
      );


      localStorage.removeItem(
        "selected_lab_prescription"
      );


      setResult("");
      setRemarks("");


      onPageChange("lab-results");

    } catch (err) {

      setError(
        err.message ||
        "Failed to submit laboratory result"
      );

    } finally {

      setSubmitting(false);

    }
  };


  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Perform Laboratory Test
          </h2>

          <p className="text-muted mb-0">
            Enter the test result and submit it
          </p>

        </div>


        <button
          className="btn btn-outline-primary"
          onClick={() =>
            onPageChange("laboratory")
          }
        >
          ← Back to Dashboard
        </button>

      </div>


      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {loading ? (

        <div className="text-center p-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-2 text-muted">
            Loading laboratory test...
          </p>

        </div>

      ) : prescription ? (

        <>

          {/* Test Information */}
          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-3">
                Test Information
              </h5>


              <div className="row g-3">

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Patient Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      prescription.patient_name
                    }
                    readOnly
                  />

                </div>


                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Test Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      prescription.test_name
                    }
                    readOnly
                  />

                </div>


                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Requested By
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      prescription.doctor_name
                    }
                    readOnly
                  />

                </div>


                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Sample
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      prescription.sample_required
                    }
                    readOnly
                  />

                </div>


                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Normal Range
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      prescription.normal_range
                    }
                    readOnly
                  />

                </div>


                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value="Pending"
                    readOnly
                  />

                </div>

              </div>

            </div>

          </div>


          {/* Result Form */}
          <div className="card border-0 shadow-sm">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-3">
                Test Result
              </h5>


              <form onSubmit={handleSubmit}>

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Result
                  </label>

                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Enter laboratory test result..."
                    value={result}
                    onChange={(e) =>
                      setResult(e.target.value)
                    }
                  />

                </div>


                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Remarks
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter additional remarks..."
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(e.target.value)
                    }
                  />

                </div>


                <div className="d-flex gap-2">

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Result"}
                  </button>


                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {

                      setResult("");
                      setRemarks("");
                      setError("");

                    }}
                  >
                    Clear
                  </button>

                </div>

              </form>

            </div>

          </div>

        </>

      ) : null}

    </div>
  );
}


export default EnterLabResult;