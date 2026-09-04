import { useEffect, useState } from "react";
import axios from "axios";

// Displays the selected patient's details and consultation history.
function PatientHistory({ patientId, onBack }) {
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get the Doctor JWT token stored during login.
    const token = localStorage.getItem("access_token");

    // Load the patient's complete history.
    axios
      .get(
        `http://127.0.0.1:8000/api/doctor/patients/${patientId}/history/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setPatient(response.data.patient);
        setHistory(response.data.history);
        setError("");
      })
      .catch((error) => {
        console.error("Error loading patient history:", error);
        setError("Unable to load patient history.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patientId]);

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">
      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Patient History</h2>
          <p className="text-muted mb-0">
            Previous appointments and consultations
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          Back
        </button>
      </div>

      {/* Display API errors. */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading patient history...</p>
      ) : patient ? (
        <>
          {/* Patient information */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Patient Details</h5>

              <div className="row">
                <div className="col-md-4 mb-2">
                  <strong>Patient ID:</strong> {patient.patient_id}
                </div>

                <div className="col-md-4 mb-2">
                  <strong>Name:</strong> {patient.name}
                </div>

                <div className="col-md-4 mb-2">
                  <strong>Date of Birth:</strong> {patient.dob}
                </div>

                <div className="col-md-4 mb-2">
                  <strong>Gender:</strong> {patient.gender}
                </div>

                <div className="col-md-4 mb-2">
                  <strong>Blood Group:</strong> {patient.blood_group || "-"}
                </div>

                <div className="col-md-4 mb-2">
                  <strong>Phone:</strong> {patient.phone}
                </div>

                <div className="col-md-6 mb-2">
                  <strong>Email:</strong> {patient.email || "-"}
                </div>

                <div className="col-md-6 mb-2">
                  <strong>Address:</strong> {patient.address}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment and consultation history */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">History</h5>

              {history.length === 0 ? (
                <p className="text-muted">
                  No appointment history found.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Consultation</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.map((item) => (
                        <tr key={item.appointment_id}>
                          <td>{item.appointment_date}</td>
                          <td>{item.appointment_time}</td>
                          <td>{item.doctor}</td>
                          <td>{item.department}</td>
                          <td>{item.status}</td>

                          <td>
                            {item.consultation ? (
                              <div>
                                <div>
                                  <strong>Symptoms:</strong>{" "}
                                  {item.consultation.symptoms}
                                </div>

                                <div>
                                  <strong>Diagnosis:</strong>{" "}
                                  {item.consultation.diagnosis}
                                </div>

                                <div>
                                  <strong>Notes:</strong>{" "}
                                  {item.consultation.notes || "-"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted">
                                No consultation
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default PatientHistory;