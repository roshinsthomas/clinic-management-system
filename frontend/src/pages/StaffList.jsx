import { useEffect, useState } from "react";
import {
  getStaff,
  updateStaffStatus,
} from "../services/api";

function StaffList({ onBack }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStaff();
      setStaff(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // ACTIVATE / DEACTIVATE STAFF
  const handleStatusChange = async (member) => {
    try {
      setError("");

      await updateStaffStatus(
        member.staff_id,
        !member.status
      );

      await loadStaff();
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
            Staff Management
          </h2>

          <p className="text-muted mb-0">
            Manage clinic staff members
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

      {/* Staff Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Staff Members
            </h5>

            <span className="badge bg-primary">
              {staff.length} Staff
            </span>
          </div>

          {loading ? (
            <p className="text-muted">
              Loading staff...
            </p>
          ) : staff.length === 0 ? (
            <p className="text-muted">
              No staff members found.
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
                    <th>Role</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {staff.map((member) => (
                    <tr key={member.staff_id}>

                      {/* ID */}
                      <td>
                        {member.staff_id}
                      </td>

                      {/* Name */}
                      <td className="fw-semibold">
                        {`${member.first_name || ""} ${
                          member.last_name || ""
                        }`.trim() || "-"}
                      </td>

                      {/* Username */}
                      <td>
                        {member.username || "-"}
                      </td>

                      {/* DOB */}
                      <td>
                        {member.dob || "-"}
                      </td>

                      {/* Gender */}
                      <td>
                        {member.gender || "-"}
                      </td>

                      {/* Phone */}
                      <td>
                        {member.phone || "-"}
                      </td>

                      {/* Role */}
                      <td>
                        <span className="badge bg-info text-dark">
                          {member.role || "-"}
                        </span>
                      </td>

                      {/* Department */}
                      <td>
                        {member.department || "-"}
                      </td>

                      {/* Specialization */}
                      <td>
                        {member.specialization || "-"}
                      </td>

                      {/* Consultation Fee */}
                      <td>
                        {member.consultation_fee
                          ? `₹${member.consultation_fee}`
                          : "-"}
                      </td>

                      {/* Status */}
                      <td>
                        {member.status ? (
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
                            member.status
                              ? "btn btn-sm btn-outline-danger"
                              : "btn btn-sm btn-outline-success"
                          }
                          onClick={() =>
                            handleStatusChange(member)
                          }
                        >
                          {member.status
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

export default StaffList;