import React, { useEffect, useState } from "react";

import {
  getLabRequests,
} from "../../services/laboratoryService";


function LabRequests({ onPageChange }) {

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadRequests = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getLabRequests();

      setRequests(data);

    } catch (err) {

      setError(
        err.message ||
        "Failed to load laboratory requests"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadRequests();
  }, []);


  const handleEnterResult = (prescriptionId) => {

    localStorage.setItem(
      "selected_lab_prescription",
      prescriptionId
    );

    onPageChange("enter-lab-result");
  };


  const handleViewResult = (prescriptionId) => {

    localStorage.setItem(
      "selected_lab_prescription",
      prescriptionId
    );

    onPageChange("lab-results");
  };


  const filteredRequests = requests.filter(
    (request) => {

      const patientName =
        request.patient_name?.toLowerCase() || "";

      const testName =
        request.test_name?.toLowerCase() || "";

      const doctorName =
        request.doctor_name?.toLowerCase() || "";

      const searchValue =
        search.toLowerCase();

      return (
        patientName.includes(searchValue) ||
        testName.includes(searchValue) ||
        doctorName.includes(searchValue)
      );
    }
  );


  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Lab Test Requests
          </h2>

          <p className="text-muted mb-0">
            Manage laboratory test requests
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


      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <input
            type="text"
            className="form-control"
            placeholder="Search patient or test..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Test Requests
          </h5>


          {loading ? (

            <div className="text-center py-4">
              Loading laboratory requests...
            </div>

          ) : filteredRequests.length === 0 ? (

            <div className="text-center text-muted py-4">
              No laboratory requests found.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Test</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredRequests.map(
                    (request, index) => (

                      <tr
                        key={
                          request.lab_prescription_id
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td className="fw-semibold">
                          {request.patient_name}
                        </td>

                        <td>
                          {request.test_name}
                        </td>

                        <td>
                          {request.doctor_name}
                        </td>

                        <td>

                          {request.status ===
                          "PENDING" ? (

                            <span className="badge bg-warning text-dark">
                              Pending
                            </span>

                          ) : (

                            <span className="badge bg-success">
                              Completed
                            </span>

                          )}

                        </td>

                        <td>

                          {request.status ===
                          "PENDING" ? (

                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                handleEnterResult(
                                  request.lab_prescription_id
                                )
                              }
                            >
                              Enter Result
                            </button>

                          ) : (

                            <button
                              className="btn btn-sm btn-info"
                              onClick={() =>
                                handleViewResult(
                                  request.lab_prescription_id
                                )
                              }
                            >
                              View Result
                            </button>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


export default LabRequests;