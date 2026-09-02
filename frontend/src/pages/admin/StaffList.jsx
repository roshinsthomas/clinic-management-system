import { useEffect, useState } from "react";
import {
  getStaff,
  addStaff,
  updateStaffStatus,
} from "../../services/api";

function StaffList({ onBack }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    dob: "",
    gender: "MALE",
    phone: "",
    address: "",
    role: "RECEPTIONIST",
    department: "",
    specialization: "",
    consultation_fee: "",
    status: true,
  });

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

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ADD STAFF
  const handleAddStaff = async () => {
    try {
      setAdding(true);
      setError("");

      await addStaff({
        ...formData,
        department: formData.department
          ? Number(formData.department)
          : null,
        consultation_fee: formData.consultation_fee
          ? formData.consultation_fee
          : null,
      });

      setFormData({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        dob: "",
        gender: "MALE",
        phone: "",
        address: "",
        role: "RECEPTIONIST",
        department: "",
        specialization: "",
        consultation_fee: "",
        status: true,
      });

      setShowAddForm(false);

      await loadStaff();
    } catch (error) {
      setError(error.message);
    } finally {
      setAdding(false);
    }
  };

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

      {/* HEADER */}
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

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* ADD STAFF BUTTON */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-1">
              Staff Members
            </h5>

            <p className="text-muted mb-0">
              Add and manage clinic staff
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setError("");
            }}
          >
            {showAddForm ? "Close Form" : "+ Add Staff"}
          </button>
        </div>
      </div>

      {/* ADD STAFF FORM */}
      {showAddForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">

            <h5 className="fw-bold mb-4">
              Add New Staff
            </h5>

            <div className="row">

              {/* FIRST NAME */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  className="form-control"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* LAST NAME */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  className="form-control"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* USERNAME */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* DOB */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* GENDER */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Gender
                </label>

                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* PHONE */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
              </div>

              {/* ROLE */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Role
                </label>

                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="RECEPTIONIST">
                    Receptionist
                  </option>

                  <option value="DOCTOR">
                    Doctor
                  </option>

                  <option value="PHARMACIST">
                    Pharmacist
                  </option>

                  <option value="LAB_TECHNICIAN">
                    Lab Technician
                  </option>
                </select>
              </div>

              {/* DEPARTMENT */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Department ID
                </label>

                <input
                  type="number"
                  name="department"
                  className="form-control"
                  placeholder="Enter department ID"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              {/* SPECIALIZATION */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Specialization
                </label>

                <input
                  type="text"
                  name="specialization"
                  className="form-control"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </div>

              {/* CONSULTATION FEE */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Consultation Fee
                </label>

                <input
                  type="number"
                  name="consultation_fee"
                  className="form-control"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                />
              </div>

              {/* ADDRESS */}
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">
                  Address
                </label>

                <textarea
                  name="address"
                  className="form-control"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

            </div>

            <button
              className="btn btn-primary me-2"
              onClick={handleAddStaff}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Staff"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowAddForm(false)}
              disabled={adding}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* STAFF TABLE */}
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

                      <td>{member.staff_id}</td>

                      <td className="fw-semibold">
                        {`${member.first_name || ""} ${
                          member.last_name || ""
                        }`.trim() || "-"}
                      </td>

                      <td>
                        {member.username || "-"}
                      </td>

                      <td>
                        {member.dob || "-"}
                      </td>

                      <td>
                        {member.gender || "-"}
                      </td>

                      <td>
                        {member.phone || "-"}
                      </td>

                      <td>
                        <span className="badge bg-info text-dark">
                          {member.role || "-"}
                        </span>
                      </td>

                      <td>
                        {member.department || "-"}
                      </td>

                      <td>
                        {member.specialization || "-"}
                      </td>

                      <td>
                        {member.consultation_fee
                          ? `₹${member.consultation_fee}`
                          : "-"}
                      </td>

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