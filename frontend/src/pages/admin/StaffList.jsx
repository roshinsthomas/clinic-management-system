import { useEffect, useState } from "react";
import {
  getStaff,
  getDepartments,
  addStaff,
  updateStaff,
  updateStaffStatus,
} from "../../services/api";

function StaffList({ onBack }) {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    phone: "",
    role: "",
    department: "",
    specialization: "",
    consultation_fee: "",
    address: "",
    status: true,
  });

  const loadStaff = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getStaff();
      setStaff(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    loadStaff();
    loadDepartments();
  }, []);

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      dob: "",
      gender: "",
      phone: "",
      role: "",
      department: "",
      specialization: "",
      consultation_fee: "",
      address: "",
      status: true,
    });

    setFieldErrors({});
    setEditingStaff(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "role") {
      setFormData({
        ...formData,
        role: value,
        department: "",
        specialization:
          value === "DOCTOR"
            ? formData.specialization
            : "",
        consultation_fee:
          value === "DOCTOR"
            ? formData.consultation_fee
            : "",
      });

      setFieldErrors({
        ...fieldErrors,
        role: "",
        department: "",
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setFieldErrors({
      ...fieldErrors,
      [name]: "",
    });
  };

  const getDepartmentOptions = () => {
    if (!formData.role) {
      return [];
    }

    const activeDepartments = departments.filter(
      (department) => department.status
    );

    if (formData.role === "RECEPTIONIST") {
      return activeDepartments.filter(
        (department) =>
          department.department_name
            .toLowerCase()
            .trim() === "front office"
      );
    }

    if (formData.role === "PHARMACIST") {
      return activeDepartments.filter(
        (department) =>
          department.department_name
            .toLowerCase()
            .trim() === "pharmacy"
      );
    }

    if (formData.role === "LAB_TECHNICIAN") {
      return activeDepartments.filter(
        (department) =>
          department.department_name
            .toLowerCase()
            .trim() === "laboratory"
      );
    }

    if (formData.role === "DOCTOR") {
      return activeDepartments.filter((department) => {
        const name = department.department_name
          .toLowerCase()
          .trim();

        return (
          name !== "front office" &&
          name !== "pharmacy" &&
          name !== "laboratory"
        );
      });
    }

    return [];
  };

  const departmentOptions = getDepartmentOptions();

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required.";
    } else if (
      !/^[A-Za-z][A-Za-z '-]*$/.test(
        formData.first_name.trim()
      )
    ) {
      errors.first_name =
        "First name can contain only letters.";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required.";
    } else if (
      !/^[A-Za-z][A-Za-z '-]*$/.test(
        formData.last_name.trim()
      )
    ) {
      errors.last_name =
        "Last name can contain only letters.";
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!editingStaff && !formData.password) {
      errors.password = "Password is required.";
    }

    if (
      editingStaff &&
      formData.password &&
      formData.password.length < 8
    ) {
      errors.password =
        "Password must be at least 8 characters.";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required.";
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.dob);

      if (selectedDate >= today) {
        errors.dob =
          "Date of birth must be in the past.";
      }
    }

    if (!formData.gender) {
      errors.gender = "Gender is required.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone =
        "Phone number must be exactly 10 digits.";
    }

    if (!formData.role) {
      errors.role = "Role is required.";
    }

    if (!formData.department) {
      errors.department = "Department is required.";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required.";
    }

    if (formData.role === "DOCTOR") {
      if (!formData.specialization.trim()) {
        errors.specialization =
          "Specialization is required for doctors.";
      }

      if (
        formData.consultation_fee === "" ||
        formData.consultation_fee === null
      ) {
        errors.consultation_fee =
          "Consultation fee is required for doctors.";
      } else if (
        Number(formData.consultation_fee) < 0
      ) {
        errors.consultation_fee =
          "Consultation fee cannot be negative.";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleAddClick = () => {
    resetForm();
    setSuccessMessage("");
    setErrorMessage("");
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setSuccessMessage("");
    setErrorMessage("");
    setFieldErrors({});

    setFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      username: member.username || "",
      email: member.email || "",
      password: "",
      dob: member.dob || "",
      gender: member.gender || "",
      phone: member.phone || "",
      role: member.role || "",
      department:
        member.department !== null &&
        member.department !== undefined
          ? String(member.department)
          : "",
      specialization: member.specialization || "",
      consultation_fee:
        member.consultation_fee !== null &&
        member.consultation_fee !== undefined
          ? String(member.consultation_fee)
          : "",
      address: member.address || "",
      status: member.status,
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const staffData = {
        ...formData,
        department: formData.department
          ? Number(formData.department)
          : null,
        consultation_fee:
          formData.consultation_fee
            ? formData.consultation_fee
            : null,
      };

      if (!staffData.password) {
        delete staffData.password;
      }

      if (editingStaff) {
        await updateStaff(
          editingStaff.staff_id,
          staffData
        );

        setSuccessMessage(
          "Staff member updated successfully."
        );
      } else {
        await addStaff(staffData);

        setSuccessMessage(
          "Staff member created successfully."
        );
      }

      await loadStaff();

      resetForm();
      setShowForm(false);
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong."
      );

      if (error.responseData) {
        setFieldErrors(error.responseData);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleStatusChange = async (member) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await updateStaffStatus(
        member.staff_id,
        !member.status
      );

      await loadStaff();

      setSuccessMessage(
        member.status
          ? "Staff member deactivated successfully."
          : "Staff member activated successfully."
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    if (!search) {
      return true;
    }

    const fullName =
      `${member.first_name || ""} ${
        member.last_name || ""
      }`.toLowerCase();

    const username =
      (member.username || "").toLowerCase();

    const email =
      (member.email || "").toLowerCase();

    const phone =
      (member.phone || "").toLowerCase();

    const role =
      (member.role || "").toLowerCase();

    const department = String(
      member.department || ""
    ).toLowerCase();

    return (
      fullName.includes(search) ||
      username.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      role.includes(search) ||
      department.includes(search)
    );
  });

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (item) =>
        String(item.department_id) ===
        String(departmentId)
    );

    return department
      ? department.department_name
      : "-";
  };

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">
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

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      {!showForm ? (
        <>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-1">
                    Staff Members
                  </h5>

                  <p className="text-muted mb-0">
                    View and manage clinic staff
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleAddClick}
                >
                  + Add Staff
                </button>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  Staff List
                </h5>

                <span className="badge bg-primary">
                  {filteredStaff.length} Staff
                </span>
              </div>

              {loading ? (
                <p className="text-muted">
                  Loading staff...
                </p>
              ) : filteredStaff.length === 0 ? (
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
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStaff.map((member) => (
                        <tr key={member.staff_id}>
                          <td>
                            {member.staff_id}
                          </td>

                          <td className="fw-semibold">
                            {`${member.first_name || ""} ${
                              member.last_name || ""
                            }`.trim() || "-"}
                          </td>

                          <td>
                            {member.username || "-"}
                          </td>

                          <td>
                            {member.email || "-"}
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
                            {getDepartmentName(
                              member.department
                            )}
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
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleEdit(member)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className={
                                  member.status
                                    ? "btn btn-sm btn-outline-danger"
                                    : "btn btn-sm btn-outline-success"
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    member
                                  )
                                }
                              >
                                {member.status
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
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
        </>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4 className="fw-bold mb-4">
              {editingStaff
                ? "Update Staff"
                : "Add Staff"}
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    First Name *
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    className={
                      fieldErrors.first_name
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    value={formData.first_name}
                    onChange={handleChange}
                  />

                  {fieldErrors.first_name && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.first_name
                      )
                        ? fieldErrors.first_name[0]
                        : fieldErrors.first_name}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Last Name *
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    className={
                      fieldErrors.last_name
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    value={formData.last_name}
                    onChange={handleChange}
                  />

                  {fieldErrors.last_name && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.last_name
                      )
                        ? fieldErrors.last_name[0]
                        : fieldErrors.last_name}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Username *
                  </label>

                  <input
                    type="text"
                    name="username"
                    className={
                      fieldErrors.username
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    value={formData.username}
                    onChange={handleChange}
                  />

                  {fieldErrors.username && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.username
                      )
                        ? fieldErrors.username[0]
                        : fieldErrors.username}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    className={
                      fieldErrors.email
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    value={formData.email}
                    onChange={handleChange}
                  />

                  {fieldErrors.email && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.email
                      )
                        ? fieldErrors.email[0]
                        : fieldErrors.email}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Password{" "}
                    {!editingStaff && "*"}
                  </label>

                  <input
                    type="password"
                    name="password"
                    className={
                      fieldErrors.password
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      editingStaff
                        ? "Leave blank to keep current password"
                        : ""
                    }
                  />

                  {fieldErrors.password && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.password
                      )
                        ? fieldErrors.password[0]
                        : fieldErrors.password}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Date of Birth *
                  </label>

                  <input
                    type="date"
                    name="dob"
                    className={
                      fieldErrors.dob
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    value={formData.dob}
                    onChange={handleChange}
                  />

                  {fieldErrors.dob && (
                    <div className="invalid-feedback">
                      {Array.isArray(fieldErrors.dob)
                        ? fieldErrors.dob[0]
                        : fieldErrors.dob}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Gender *
                  </label>

                  <select
                    name="gender"
                    className={
                      fieldErrors.gender
                        ? "form-select is-invalid"
                        : "form-select"
                    }
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </select>

                  {fieldErrors.gender && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.gender
                      )
                        ? fieldErrors.gender[0]
                        : fieldErrors.gender}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Phone *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    className={
                      fieldErrors.phone
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  {fieldErrors.phone && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.phone
                      )
                        ? fieldErrors.phone[0]
                        : fieldErrors.phone}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Role *
                  </label>

                  <select
                    name="role"
                    className={
                      fieldErrors.role
                        ? "form-select is-invalid"
                        : "form-select"
                    }
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Role
                    </option>

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

                  {fieldErrors.role && (
                    <div className="invalid-feedback">
                      {Array.isArray(fieldErrors.role)
                        ? fieldErrors.role[0]
                        : fieldErrors.role}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Department *
                  </label>

                  <select
                    name="department"
                    className={
                      fieldErrors.department
                        ? "form-select is-invalid"
                        : "form-select"
                    }
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!formData.role}
                  >
                    <option value="">
                      {!formData.role
                        ? "Select Role First"
                        : "Select Department"}
                    </option>

                    {departmentOptions.map(
                      (department) => (
                        <option
                          key={
                            department.department_id
                          }
                          value={
                            department.department_id
                          }
                        >
                          {department.department_name}
                        </option>
                      )
                    )}
                  </select>

                  {fieldErrors.department && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.department
                      )
                        ? fieldErrors.department[0]
                        : fieldErrors.department}
                    </div>
                  )}

                  {formData.role &&
                    departmentOptions.length === 0 && (
                      <div className="text-danger mt-1">
                        No matching department found.
                      </div>
                    )}
                </div>

                {formData.role === "DOCTOR" && (
                  <>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Specialization *
                      </label>

                      <input
                        type="text"
                        name="specialization"
                        className={
                          fieldErrors.specialization
                            ? "form-control is-invalid"
                            : "form-control"
                        }
                        value={
                          formData.specialization
                        }
                        onChange={handleChange}
                      />

                      {fieldErrors.specialization && (
                        <div className="invalid-feedback">
                          {Array.isArray(
                            fieldErrors.specialization
                          )
                            ? fieldErrors
                                .specialization[0]
                            : fieldErrors.specialization}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Consultation Fee *
                      </label>

                      <input
                        type="number"
                        name="consultation_fee"
                        className={
                          fieldErrors.consultation_fee
                            ? "form-control is-invalid"
                            : "form-control"
                        }
                        value={
                          formData.consultation_fee
                        }
                        onChange={handleChange}
                        min="0"
                      />

                      {fieldErrors.consultation_fee && (
                        <div className="invalid-feedback">
                          {Array.isArray(
                            fieldErrors.consultation_fee
                          )
                            ? fieldErrors
                                .consultation_fee[0]
                            : fieldErrors.consultation_fee}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="col-12 mb-3">
                  <label className="form-label">
                    Address *
                  </label>

                  <textarea
                    name="address"
                    className={
                      fieldErrors.address
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>

                  {fieldErrors.address && (
                    <div className="invalid-feedback">
                      {Array.isArray(
                        fieldErrors.address
                      )
                        ? fieldErrors.address[0]
                        : fieldErrors.address}
                    </div>
                  )}
                </div>

                <div className="col-12 mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="status"
                      className="form-check-input"
                      checked={formData.status}
                      onChange={handleChange}
                      id="status"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="status"
                    >
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingStaff
                  ? "Update Staff"
                  : "Add Staff"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffList;