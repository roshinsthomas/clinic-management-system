import { useEffect, useState } from "react";
import {
  getDoctors,
  addDoctor,
  updateDoctor,
  updateDoctorStatus,
  getDepartments,
} from "../../services/api";

function DoctorList({ onBack }) {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const emptyForm = {
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
    department: "",
    specialization: "",
    consultation_fee: "",
    status: true,
  };

  const [form, setForm] = useState(emptyForm);

  const loadDoctors = async (value = "") => {
    try {
      setLoading(true);
      setError("");
      const data = await getDoctors(value);
      setDoctors(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadDepartments();
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    await loadDoctors(value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    setFormErrors({
      ...formErrors,
      [name]: "",
    });
  };

  const openAddForm = () => {
    setEditingDoctor(null);
    setForm(emptyForm);
    setFormErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
    setViewDoctor(null);
  };

  const openEditForm = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      username: doctor.username || "",
      email: doctor.email || "",
      password: "",
      first_name: doctor.first_name || "",
      last_name: doctor.last_name || "",
      dob: doctor.dob || "",
      gender: doctor.gender || "",
      phone: doctor.phone || "",
      address: doctor.address || "",
      department: doctor.department ? String(doctor.department) : "",
      specialization: doctor.specialization || "",
      consultation_fee: doctor.consultation_fee || "",
      status: doctor.status,
    });
    setFormErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
    setViewDoctor(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDoctor(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!form.username.trim()) {
      errors.username = "Username is required.";
    } else if (!/^[A-Za-z0-9_.-]+$/.test(form.username.trim())) {
      errors.username = "Username can contain only letters, numbers, dot, underscore and hyphen.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!editingDoctor && !form.password) {
      errors.password = "Password is required.";
    } else if (form.password && form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!form.first_name.trim()) {
      errors.first_name = "First name is required.";
    } else if (!/^[A-Za-z -']+$/.test(form.first_name.trim())) {
      errors.first_name = "First name can contain only letters.";
    }

    if (!form.last_name.trim()) {
      errors.last_name = "Last name is required.";
    } else if (!/^[A-Za-z -']+$/.test(form.last_name.trim())) {
      errors.last_name = "Last name can contain only letters.";
    }

    if (!form.dob) {
      errors.dob = "Date of birth is required.";
    } else {
      const dob = new Date(form.dob);
      const today = new Date();
      const minimumDate = new Date(
        today.getFullYear() - 22,
        today.getMonth(),
        today.getDate()
      );

      if (dob > minimumDate) {
        errors.dob = "Doctor must be at least 22 years old.";
      }
    }

    if (!form.gender) {
      errors.gender = "Gender is required.";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!form.address.trim()) {
      errors.address = "Address is required.";
    }

    if (!form.department) {
      errors.department = "Department is required.";
    }

    if (!form.specialization.trim()) {
      errors.specialization = "Specialization is required.";
    }

    if (form.consultation_fee === "") {
      errors.consultation_fee = "Consultation fee is required.";
    } else if (Number(form.consultation_fee) <= 0) {
      errors.consultation_fee = "Consultation fee must be greater than 0.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    const doctorData = {
      username: form.username.trim(),
      email: form.email.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      dob: form.dob,
      gender: form.gender,
      phone: form.phone.trim(),
      address: form.address.trim(),
      department: Number(form.department),
      specialization: form.specialization.trim(),
      consultation_fee: Number(form.consultation_fee),
      status: form.status,
    };

    if (form.password.trim()) {
      doctorData.password = form.password;
    }

    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.staff_id, doctorData);
        setSuccess("Doctor updated successfully.");
      } else {
        await addDoctor(doctorData);
        setSuccess("Doctor added successfully.");
      }

      closeForm();
      await loadDoctors(search);
    } catch (error) {
      if (error.responseData) {
        setFormErrors(error.responseData);
      } else {
        setError(error.message);
      }
    }
  };

  const handleStatusChange = async (doctor) => {
    try {
      setError("");
      setSuccess("");

      await updateDoctorStatus(
        doctor.staff_id,
        !doctor.status
      );

      setSuccess(
        doctor.status
          ? "Doctor deactivated successfully."
          : "Doctor activated successfully."
      );

      await loadDoctors(search);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleView = (doctor) => {
    setViewDoctor(doctor);
    setShowForm(false);
  };

  const getError = (field) => {
    if (!formErrors[field]) {
      return "";
    }

    if (Array.isArray(formErrors[field])) {
      return formErrors[field][0];
    }

    return formErrors[field];
  };

  const maxDob = new Date(
    new Date().getFullYear() - 22,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Doctor Management</h2>
          <p className="text-muted mb-0">Manage clinic doctors</p>
        </div>

        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                {editingDoctor ? "Update Doctor" : "Add Doctor"}
              </h5>

              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={closeForm}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                  {getError("first_name") && (
                    <small className="text-danger">
                      {getError("first_name")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                  {getError("last_name") && (
                    <small className="text-danger">
                      {getError("last_name")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                  />
                  {getError("username") && (
                    <small className="text-danger">
                      {getError("username")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                  />
                  {getError("email") && (
                    <small className="text-danger">
                      {getError("email")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Password {editingDoctor && "(Leave blank to keep current)"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                  />
                  {getError("password") && (
                    <small className="text-danger">
                      {getError("password")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={form.dob}
                    max={maxDob}
                    onChange={handleChange}
                  />
                  {getError("dob") && (
                    <small className="text-danger">
                      {getError("dob")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {getError("gender") && (
                    <small className="text-danger">
                      {getError("gender")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength="10"
                    placeholder="Enter 10 digit phone number"
                  />
                  {getError("phone") && (
                    <small className="text-danger">
                      {getError("phone")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Department</label>
                  <select
                    name="department"
                    className="form-select"
                    value={form.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>

                    {departments
                      .filter(
                        (department) =>
                          department.status &&
                          [
                            "neurology",
                            "cardiology",
                            "general medicine",
                          ].includes(
                            department.department_name.toLowerCase()
                          )
                      )
                      .map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.department_name}
                        </option>
                      ))}
                  </select>

                  {getError("department") && (
                    <small className="text-danger">
                      {getError("department")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-control"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="Enter specialization"
                  />
                  {getError("specialization") && (
                    <small className="text-danger">
                      {getError("specialization")}
                    </small>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Consultation Fee</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    className="form-control"
                    value={form.consultation_fee}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter consultation fee"
                  />
                  {getError("consultation_fee") && (
                    <small className="text-danger">
                      {getError("consultation_fee")}
                    </small>
                  )}
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="2"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                  />
                  {getError("address") && (
                    <small className="text-danger">
                      {getError("address")}
                    </small>
                  )}
                </div>

                {editingDoctor && (
                  <div className="col-12 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="status"
                        className="form-check-input"
                        checked={form.status}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">
                        Active
                      </label>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingDoctor ? "Update Doctor" : "Add Doctor"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewDoctor && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Doctor Details</h5>

              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setViewDoctor(null)}
              >
                Close
              </button>
            </div>

            <div className="row">
              <div className="col-md-4 mb-2">
                <strong>ID:</strong> {viewDoctor.staff_id}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Name:</strong>{" "}
                {`${viewDoctor.first_name || ""} ${
                  viewDoctor.last_name || ""
                }`.trim() || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Username:</strong>{" "}
                {viewDoctor.username || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Email:</strong>{" "}
                {viewDoctor.email || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>DOB:</strong> {viewDoctor.dob || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Gender:</strong>{" "}
                {viewDoctor.gender || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Phone:</strong>{" "}
                {viewDoctor.phone || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Department:</strong>{" "}
                {viewDoctor.department_name || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Specialization:</strong>{" "}
                {viewDoctor.specialization || "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Consultation Fee:</strong>{" "}
                {viewDoctor.consultation_fee
                  ? `₹${viewDoctor.consultation_fee}`
                  : "-"}
              </div>

              <div className="col-md-4 mb-2">
                <strong>Status:</strong>{" "}
                {viewDoctor.status ? "Active" : "Inactive"}
              </div>

              <div className="col-12 mt-2">
                <strong>Address:</strong>{" "}
                {viewDoctor.address || "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Doctors</h5>

            <button
              className="btn btn-primary"
              onClick={openAddForm}
            >
              + Add Doctor
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, username, email, phone, department or specialization"
              value={search}
              onChange={handleSearch}
            />
          </div>

          <div className="mb-3">
            <span className="badge bg-primary">
              {doctors.length} Doctors
            </span>
          </div>

          {loading ? (
            <p className="text-muted">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p className="text-muted">No doctors found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.staff_id}>
                      <td>{doctor.staff_id}</td>

                      <td className="fw-semibold">
                        {`${doctor.first_name || ""} ${
                          doctor.last_name || ""
                        }`.trim() || "-"}
                      </td>

                      <td>{doctor.username || "-"}</td>

                      <td>{doctor.phone || "-"}</td>

                      <td>{doctor.department_name || "-"}</td>

                      <td>{doctor.specialization || "-"}</td>

                      <td>
                        {doctor.consultation_fee
                          ? `₹${doctor.consultation_fee}`
                          : "-"}
                      </td>

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

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleView(doctor)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => openEditForm(doctor)}
                        >
                          Edit
                        </button>

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