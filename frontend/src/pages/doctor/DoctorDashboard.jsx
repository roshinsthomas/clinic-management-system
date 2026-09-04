import { useEffect, useState } from "react";
import axios from "axios";

// Main dashboard for the Doctor module.
function DoctorDashboard({
  onLogout,
  onAppointments,
  onPatients,
  onStartConsultation,
  onViewConsultation,
}) {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the JWT access token stored after login.
    const token = localStorage.getItem("access_token");

    // Load today's appointments for the logged-in doctor.
    axios
      .get("http://127.0.0.1:8000/api/doctor/appointments/today/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAppointments(response.data);
        setError("");
      })
      .catch((error) => {
        console.error("Error loading appointments:", error);
        setError("Unable to load today's appointments.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">
      {/* Dashboard header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Doctor Dashboard</h2>
          <p className="text-muted mb-0">
            Today's Appointments
          </p>
        </div>

        <button
          className="btn btn-outline-danger"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* Doctor navigation */}
      <div className="d-flex gap-2 mb-4">
        <button
          className="btn btn-primary"
          onClick={onAppointments}
        >
          Appointments
        </button>

        <button
          className="btn btn-secondary"
          onClick={onPatients}
        >
          Patients
        </button>
      </div>

      {/* Show an error if the API request fails. */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">
            Today's Appointments
          </h5>

          {loading ? (
            <p className="text-muted">
              Loading appointments...
            </p>
          ) : appointments.length === 0 ? (
            <p className="text-muted">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient</th>
                    <th>Department</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.appointment_id}>
                      <td>{appointment.token_no ?? "-"}</td>
                      <td>{appointment.patient_name}</td>
                      <td>{appointment.department}</td>
                      <td>{appointment.appointment_time}</td>
                      <td>{appointment.status}</td>

                      <td>
                        {appointment.status === "Completed" ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              onViewConsultation(appointment.appointment_id)
                            }
                          >
                            View Consultation
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              onStartConsultation(appointment.appointment_id)
                            }
                          >
                            Start Consultation
                          </button>
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
    </div>
  );
}

export default DoctorDashboard;