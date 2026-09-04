import { useEffect, useState } from "react";
import axios from "axios";

// Displays unique patients who have appointments with the logged-in doctor.
function DoctorPatients({ onBack, onViewHistory }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get the Doctor JWT token stored during login.
    const token = localStorage.getItem("access_token");

    // Use the Doctor appointments API to obtain the doctor's patients.
    axios
      .get("http://127.0.0.1:8000/api/doctor/appointments/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Remove duplicate patients who have multiple appointments.
        const uniquePatients = Array.from(
          new Map(
            response.data.map((appointment) => [
              appointment.patient_id,
              {
                patient_id: appointment.patient_id,
                patient_name: appointment.patient_name,
              },
            ])
          ).values()
        );

        setPatients(uniquePatients);
        setError("");
      })
      .catch((error) => {
        console.error("Error loading patients:", error);
        setError("Unable to load patients.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">
      {/* Page header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Patients</h2>
          <p className="text-muted mb-0">
            Patients assigned to you through appointments
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Display API errors. */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <p className="text-muted">Loading patients...</p>
          ) : patients.length === 0 ? (
            <p className="text-muted">No patients found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Patient Name</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.patient_id}>
                      <td>{patient.patient_id}</td>
                      <td>{patient.patient_name}</td>

                      <td>
                        {/* Open the complete history of this patient. */}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            onViewHistory(patient.patient_id)
                          }
                        >
                          View History
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
    </div>
  );
}

export default DoctorPatients;