import { useEffect, useState } from "react";
import axios from "axios";


// Read-only page for displaying a completed consultation.
function ViewConsultation({ appointmentId, onBack }) {
    // Stores the completed consultation returned by the backend.
    const [consultation, setConsultation] = useState(null);

    // Handles loading and API errors.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load the completed consultation when this page opens.
    useEffect(() => {
        const loadConsultation = async () => {
            try {
                const token = localStorage.getItem("access_token");

                const response = await axios.get(
                    `http://127.0.0.1:8000/api/doctor/appointments/${appointmentId}/consultation/view/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setConsultation(response.data);
            } catch (err) {
                console.error("Failed to load consultation:", err);

                setError(
                    err.response?.data?.error ||
                    "Unable to load consultation details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadConsultation();
    }, [appointmentId]);

    return (


        <div className="container-fluid min-vh-100 bg-light p-4">
            {/* Page header */}
            {/* Show loading state while the consultation is being retrieved. */}
            {loading && (
                <div className="alert alert-info">
                    Loading consultation...
                </div>
            )}

            {/* Show API errors clearly. */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">View Consultation</h2>
                    <p className="text-muted mb-0">
                        Appointment ID: {appointmentId}
                    </p>
                </div>

                <button
                    className="btn btn-outline-secondary"
                    onClick={onBack}
                >
                    Back to Appointments
                </button>
            </div>

            {/* Consultation details will be loaded from the backend later. */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">
                        Consultation Details
                    </h5>

                    {consultation ? (
                        <>
                            <div className="mb-3">
                                <strong>Symptoms:</strong>
                                <p className="mb-0">{consultation.symptoms}</p>
                            </div>

                            <div className="mb-3">
                                <strong>Diagnosis:</strong>
                                <p className="mb-0">{consultation.diagnosis}</p>
                            </div>

                            <div className="mb-3">
                                <strong>Notes:</strong>
                                <p className="mb-0">
                                    {consultation.notes || "-"}
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="text-muted mb-0">
                            Consultation details will appear here.
                        </p>
                    )}
                </div>
            </div>

            {/* Display all medicines prescribed during this consultation. */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Medicine Prescriptions</h5>

                    {consultation?.medicines?.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Type</th>
                                        <th>Dosage</th>
                                        <th>Quantity</th>
                                        <th>Frequency</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {consultation.medicines.map((medicine) => (
                                        <tr key={medicine.prescription_id}>
                                            <td>{medicine.medicine_name}</td>
                                            <td>{medicine.medicine_type || "-"}</td>
                                            <td>{medicine.dosage}</td>
                                            <td>{medicine.quantity}</td>
                                            <td>{medicine.frequency}</td>
                                            <td>{medicine.duration}</td>
                                            <td>{medicine.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">
                            No medicines were prescribed.
                        </p>
                    )}
                </div>
            </div>

            {/* Display all lab tests prescribed during this consultation. */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Lab Prescriptions</h5>

                    {consultation?.lab_tests?.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Lab Test</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {consultation.lab_tests.map((test) => (
                                        <tr key={test.lab_prescription_id}>
                                            <td>{test.lab_test_name}</td>
                                            <td>{test.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">
                            No lab tests were prescribed.
                        </p>
                    )}
                </div>
            </div>

            {/* Lab results will later be shown when the Laboratory module completes them. */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-3">
                        Lab Results
                    </h5>

                    <p className="text-muted mb-0">
                        Completed lab results will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ViewConsultation;