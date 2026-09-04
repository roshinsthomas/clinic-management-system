import { useEffect, useState } from "react";
import axios from "axios";

// Displays all appointments assigned to the logged-in doctor.
function DoctorAppointments({
    onBack,
    onStartConsultation,
    onViewConsultation,
    onViewHistory,
}) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Get the JWT access token stored during login.
        const token = localStorage.getItem("access_token");

        // Load all appointments belonging to the logged-in doctor.
        axios
            .get("http://127.0.0.1:8000/api/doctor/appointments/", {
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
                setError("Unable to load appointments.");
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
                    <h2 className="fw-bold">Appointments</h2>
                    <p className="text-muted mb-0">
                        All appointments assigned to you
                    </p>
                </div>

                {/* Return to the Doctor Dashboard. */}
                <button
                    className="btn btn-outline-secondary"
                    onClick={onBack}
                >
                    Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body">

                    {loading ? (
                        <p className="text-muted">
                            Loading appointments...
                        </p>
                    ) : appointments.length === 0 ? (
                        <p className="text-muted">
                            No appointments found.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Department</th>
                                        <th>Token</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.appointment_id}>
                                            <td>{appointment.appointment_date}</td>

                                            <td>{appointment.appointment_time}</td>

                                            <td>{appointment.patient_name}</td>

                                            <td>{appointment.department}</td>

                                            <td>{appointment.token_no ?? "-"}</td>

                                            <td>{appointment.status}</td>

                                            <td>
                                                <div className="d-flex gap-2">

                                                    {/* Patient history is available from any appointment. */}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            onViewHistory(appointment.patient_id)
                                                        }
                                                    >
                                                        View History
                                                    </button>

                                                    {/* Show consultation actions only for valid appointment statuses. */}
                                                    {appointment.status === "Scheduled" && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() =>
                                                                onStartConsultation(appointment.appointment_id)
                                                            }
                                                        >
                                                            Start Consultation
                                                        </button>
                                                    )}

                                                    {/* Completed consultations can only be viewed. */}
                                                    {appointment.status === "Completed" && (
                                                        <button
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() =>
                                                                onViewConsultation(appointment.appointment_id)
                                                            }
                                                        >
                                                            View Consultation
                                                        </button>
                                                    )}

                                                </div>
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

export default DoctorAppointments;