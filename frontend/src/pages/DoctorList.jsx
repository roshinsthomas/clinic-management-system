import { useEffect, useState } from "react";
import {
  getDoctors,
  updateDoctorStatus,
} from "../services/api";

function DoctorList({ onBack }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // ACTIVATE / DEACTIVATE DOCTOR
  const handleStatusChange = async (doctor) => {
    try {
      setError("");

      await updateDoctorStatus(
        doctor.staff_id,
        !doctor.status
      );

      await loadDoctors();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Doctor Management
          </h2>

          <p className="text-muted mb-0">
            Manage clinic doctors
          </p>
        </div>

        <button
          className="btn btn-secondary"
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

      {/* Doctor Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Doctors
            </h5>

            <span className="badge bg-primary">
              {doctors.length} Doctors
            </span>
          </div>

          {loading ? (
            <p className="text-muted">
              Loading doctors...
            </p>
          ) : doctors.length === 0 ? (
            <p className="text-muted">
              No doctors found.
            </p>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Consultation Fee</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.staff_id}>

                      <td>
                        {doctor.staff_id}
                      </td>

                      <td className="fw-semibold">
                        {`${doctor.first_name || ""} ${
                          doctor.last_name || ""
                        }`.trim() || "-"}
                      </td>

                      <td>
                        {doctor.username || "-"}
                      </td>

                      <td>
                        {doctor.dob || "-"}
                      </td>

                      <td>
                        {doctor.gender || "-"}
                      </td>

                      <td>
                        {doctor.phone || "-"}
                      </td>

                      <td>
                        {doctor.department || "-"}
                      </td>

                      <td>
                        {doctor.specialization || "-"}
                      </td>

                      <td>
                        {doctor.consultation_fee
                          ? `₹${doctor.consultation_fee}`
                          : "-"}
                      </td>

                      {/* Status */}
                      <td>
                        {doctor.status ? (
                          <span className="badge bg-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          className={
                            doctor.status
                              ? "btn btn-sm btn-outline-danger"
                              : "btn btn-sm btn-outline-success"
                          }
                          onClick={() =>
                            handleStatusChange(doctor)
                          }
                        >
                          {doctor.status
                            ? "Deactivate"
                            : "Activate"}
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

export default DoctorList;