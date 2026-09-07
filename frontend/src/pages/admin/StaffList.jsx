import { useEffect, useState } from "react";

import {
  getStaff,
  addStaff,
  updateStaff,
  updateStaffStatus,
  getDepartments,
} from "../../services/adminService";

function StaffList({ onBack }) {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // SEARCH
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    address: "",
    specialization: "",
    consultation_fee: "",
    status: true,
  });

  // ============================================================
  // LOAD STAFF
  // ============================================================

  const loadStaff = async (search = searchTerm) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getStaff(search);
      setStaff(data);
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to load staff."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    // Load staff and departments when the page opens.
    loadStaff("");

    getDepartments()
      .then((data) => {
        setDepartments(data);
      })
      .catch(() => {
        setErrorMessage(
          "Failed to load departments."
        );
      });
  }, []);

  // ============================================================
  // SEARCH SUGGESTIONS
  // ============================================================

  const getSearchSuggestions = () => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return staff
      .filter((member) => {
        const name =
          `${member.first_name || ""} ${member.last_name || ""
            }`
            .trim()
            .toLowerCase();

        const username = (
          member.username || ""
        ).toLowerCase();

        const email = (
          member.email || ""
        ).toLowerCase();

        const phone = (
          member.phone || ""
        ).toLowerCase();

        const role = (
          member.role || ""
        ).toLowerCase();

        return (
          name.includes(search) ||
          username.includes(search) ||
          email.includes(search) ||
          phone.includes(search) ||
          role.includes(search)
        );
      })
      .slice(0, 5);
  };

  const suggestions = getSearchSuggestions();

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = async () => {
    setShowSuggestions(false);
    await loadStaff(searchTerm);
  };

  const handleClear = async () => {
    setSearchTerm("");
    setShowSuggestions(false);
    await loadStaff("");
  };

  // Select the suggested staff member using their unique username.
  // The backend can reliably search the username field.
  const handleSuggestionClick = async (member) => {
    const searchValue = member.username;

    setSearchTerm(searchValue);
    setShowSuggestions(false);

    await loadStaff(searchValue);
  };

  // ============================================================
  // NAME KEYBOARD VALIDATION
  // ONLY A-Z / a-z ALLOWED
  // ============================================================

  const handleNameKeyDown = (e) => {
    // Allow Ctrl / Cmd combinations
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Allow normal editing/navigation keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
    ];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Only allow A-Z and a-z
    if (!/^[A-Za-z]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ============================================================
  // PHONE KEYBOARD VALIDATION
  // ONLY 0-9 ALLOWED
  // ============================================================

  const handlePhoneKeyDown = (e) => {
    // Allow Ctrl / Cmd combinations
    // This allows Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X etc.
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Allow normal editing/navigation keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
    ];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Only allow numbers 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    let newValue =
      type === "checkbox"
        ? checked
        : value;

    // ----------------------------------------------------------
    // FIRST NAME / LAST NAME
    // Only alphabets
    // Also removes invalid characters from pasted text.
    // ----------------------------------------------------------

    if (
      name === "first_name" ||
      name === "last_name"
    ) {
      newValue = value.replace(
        /[^A-Za-z]/g,
        ""
      );
    }

    // ----------------------------------------------------------
    // PHONE
    // Only digits
    // Also removes alphabets/symbols from pasted text.
    // ----------------------------------------------------------

    if (name === "phone") {
      newValue = value.replace(
        /\D/g,
        ""
      );

      // Maximum 10 digits
      newValue = newValue.slice(0, 10);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: newValue,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ============================================================
  // RESET FORM
  // ============================================================

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
      address: "",
      specialization: "",
      consultation_fee: "",
      status: true,
    });

    setFieldErrors({});
    setEditingStaff(null);
  };

  // ============================================================
  // ADD STAFF
  // ============================================================

  const handleAddStaff = () => {
    resetForm();
    setShowForm(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // ============================================================
  // EDIT STAFF
  // ============================================================

  const handleEditStaff = (member) => {
    setEditingStaff(member);

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
      department: member.department || "",
      address: member.address || "",
      specialization:
        member.specialization || "",
      consultation_fee:
        member.consultation_fee !== null &&
          member.consultation_fee !== undefined
          ? member.consultation_fee
          : "",
      status:
        member.status === undefined
          ? true
          : member.status,
    });

    setShowForm(true);
    setSuccessMessage("");
    setErrorMessage("");
    setFieldErrors({});
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    const errors = {};

    const firstName =
      formData.first_name.trim();

    const lastName =
      formData.last_name.trim();

    const username =
      formData.username.trim();

    const email =
      formData.email.trim();

    const phone =
      formData.phone.trim();

    const address =
      formData.address.trim();

    // ----------------------------------------------------------
    // FIRST NAME
    // ----------------------------------------------------------

    if (!firstName) {
      errors.first_name =
        "First name is required.";
    } else if (
      !/^[A-Za-z]+$/.test(firstName)
    ) {
      errors.first_name =
        "First name can contain only letters.";
    }

    // ----------------------------------------------------------
    // LAST NAME
    // ----------------------------------------------------------

    if (!lastName) {
      errors.last_name =
        "Last name is required.";
    } else if (
      !/^[A-Za-z]+$/.test(lastName)
    ) {
      errors.last_name =
        "Last name can contain only letters.";
    }

    // ----------------------------------------------------------
    // USERNAME
    // ----------------------------------------------------------

    if (!username) {
      errors.username =
        "Username is required.";
    }

    // ----------------------------------------------------------
    // EMAIL
    // ----------------------------------------------------------

    if (!email) {
      errors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      errors.email =
        "Enter a valid email address.";
    }

    // ----------------------------------------------------------
    // PASSWORD
    // ----------------------------------------------------------

    if (
      !editingStaff &&
      !formData.password
    ) {
      errors.password =
        "Password is required.";
    } else if (
      formData.password &&
      formData.password.length < 8
    ) {
      errors.password =
        "Password must contain at least 8 characters.";
    }

    // ----------------------------------------------------------
    // DATE OF BIRTH
    // ----------------------------------------------------------

    if (!formData.dob) {
      errors.dob =
        "Date of birth is required.";
    } else {
      const selectedDate =
        new Date(formData.dob);

      const today = new Date();

      let age =
        today.getFullYear() -
        selectedDate.getFullYear();

      const monthDifference =
        today.getMonth() -
        selectedDate.getMonth();

      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
          selectedDate.getDate()
        )
      ) {
        age--;
      }

      if (age < 18) {
        errors.dob =
          "Staff must be at least 18 years old.";
      }
    }

    // ----------------------------------------------------------
    // GENDER
    // ----------------------------------------------------------

    if (!formData.gender) {
      errors.gender =
        "Gender is required.";
    }

    // ----------------------------------------------------------
    // PHONE
    // ----------------------------------------------------------

    if (!phone) {
      errors.phone =
        "Phone number is required.";
    } else if (
      !/^\d{10}$/.test(phone)
    ) {
      errors.phone =
        "Phone number must contain exactly 10 digits.";
    } else if (
      !/^[6789]\d{9}$/.test(phone)
    ) {
      errors.phone =
        "Phone number must start with 6, 7, 8, or 9.";
    }

    // ----------------------------------------------------------
    // ROLE
    // ----------------------------------------------------------

    if (!formData.role) {
      errors.role =
        "Role is required.";
    }

    // ----------------------------------------------------------
    // ADDRESS
    // ----------------------------------------------------------

    if (!address) {
      errors.address =
        "Address is required.";
    }

    // ----------------------------------------------------------
    // DOCTOR VALIDATION
    // ----------------------------------------------------------

    if (formData.role === "DOCTOR") {
      if (
        !formData.specialization.trim()
      ) {
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

    return (
      Object.keys(errors).length === 0
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const data = {
        first_name:
          formData.first_name.trim(),

        last_name:
          formData.last_name.trim(),

        username:
          formData.username.trim(),

        email:
          formData.email.trim(),

        dob:
          formData.dob,

        gender:
          formData.gender,

        phone:
          formData.phone.trim(),

        role:
          formData.role,

        address:
          formData.address.trim(),

        status:
          formData.status,
      };

      // --------------------------------------------------------
      // PASSWORD
      // --------------------------------------------------------

      if (
        formData.password.trim()
      ) {
        data.password =
          formData.password;
      }

      // --------------------------------------------------------
      // DOCTOR FIELDS
      // --------------------------------------------------------

      if (
        formData.role === "DOCTOR"
      ) {
        data.department = Number(
          formData.department
        );
        data.specialization =
          formData.specialization.trim();

        data.consultation_fee =
          Number(
            formData.consultation_fee
          );
      }

      // --------------------------------------------------------
      // EDIT STAFF
      // --------------------------------------------------------

      if (editingStaff) {
        await updateStaff(
          editingStaff.staff_id,
          data
        );

        setSuccessMessage(
          "Staff updated successfully."
        );
      }

      // --------------------------------------------------------
      // ADD STAFF
      // --------------------------------------------------------

      else {
        await addStaff(data);

        setSuccessMessage(
          "Staff added successfully."
        );
      }

      await loadStaff(searchTerm);

      resetForm();
      setShowForm(false);
    } catch (error) {
      let message =
        error.message ||
        "Unable to save staff.";

      if (
        error.responseData &&
        typeof error.responseData === "object"
      ) {
        const backendErrors = {};

        Object.keys(
          error.responseData
        ).forEach((key) => {
          const value =
            error.responseData[key];

          backendErrors[key] =
            Array.isArray(value)
              ? value.join(" ")
              : String(value);
        });

        setFieldErrors(
          backendErrors
        );

        message =
          "Please correct the highlighted fields.";
      }

      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // STATUS CHANGE
  // ============================================================

  const handleStatusChange = async (
    member
  ) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await updateStaffStatus(
        member.staff_id,
        !member.status
      );

      setSuccessMessage(
        `Staff status ${member.status
          ? "deactivated"
          : "activated"
        } successfully.`
      );

      await loadStaff(searchTerm);
    } catch (error) {
      setErrorMessage(
        error.message ||
        "Unable to update staff status."
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">
            Staff Management
          </h2>

          <p className="text-muted mb-0">
            Manage staff details, roles and status.
          </p>
        </div>



        {!showForm && (
          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={handleAddStaff}
          >
            Add Staff
          </button>
        )}

        {/* ======================================================
          ADD STAFF BUTTON
          ====================================================== */}


      </div>

      {/* ======================================================
          SUCCESS MESSAGE
          ====================================================== */}

      {successMessage && (
        <div
          className="alert alert-success"
          role="alert"
        >
          {successMessage}
        </div>
      )}

      {/* ======================================================
          ERROR MESSAGE
          ====================================================== */}

      {errorMessage && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {/* ======================================================
          ADD / EDIT FORM
          ====================================================== */}

      {showForm ? (
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">

            <div className="mb-4">
              <h4 className="mb-1">
                {editingStaff
                  ? "Edit Staff"
                  : "Add Staff"}
              </h4>

              <p className="text-muted mb-0">
                Enter the staff information below.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* FIRST NAME */}

                <div className="col-md-6">
                  <label className="form-label">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    className={`form-control ${fieldErrors.first_name
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.first_name
                    }
                    onChange={handleChange}
                    onKeyDown={handleNameKeyDown}
                    autoComplete="off"
                  />

                  {fieldErrors.first_name && (
                    <div className="invalid-feedback">
                      {
                        fieldErrors.first_name
                      }
                    </div>
                  )}
                </div>

                {/* LAST NAME */}

                <div className="col-md-6">
                  <label className="form-label">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    className={`form-control ${fieldErrors.last_name
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.last_name
                    }
                    onChange={handleChange}
                    onKeyDown={handleNameKeyDown}
                    autoComplete="off"
                  />

                  {fieldErrors.last_name && (
                    <div className="invalid-feedback">
                      {
                        fieldErrors.last_name
                      }
                    </div>
                  )}
                </div>

                {/* USERNAME */}

                <div className="col-md-6">
                  <label className="form-label">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    className={`form-control ${fieldErrors.username
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.username
                    }
                    onChange={handleChange}
                  />

                  {fieldErrors.username && (
                    <div className="invalid-feedback">
                      {
                        fieldErrors.username
                      }
                    </div>
                  )}
                </div>

                {/* EMAIL */}

                <div className="col-md-6">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className={`form-control ${fieldErrors.email
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.email
                    }
                    onChange={handleChange}
                  />

                  {fieldErrors.email && (
                    <div className="invalid-feedback">
                      {
                        fieldErrors.email
                      }
                    </div>
                  )}
                </div>

                {/* PASSWORD */}

                <div className="col-md-6">
                  <label className="form-label">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    className={`form-control ${fieldErrors.password
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.password
                    }
                    onChange={handleChange}
                    placeholder={
                      editingStaff
                        ? "Leave blank to keep current password"
                        : ""
                    }
                  />

                  {fieldErrors.password && (
                    <div className="invalid-feedback">
                      {
                        fieldErrors.password
                      }
                    </div>
                  )}
                </div>

                {/* DATE OF BIRTH */}

                <div className="col-md-6">
                  <label className="form-label">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dob"
                    className={`form-control ${fieldErrors.dob
                      ? "is-invalid"
                      : ""
                      }`}
                    value={formData.dob}
                    onChange={handleChange}
                  />

                  {fieldErrors.dob && (
                    <div className="invalid-feedback">
                      {fieldErrors.dob}
                    </div>
                  )}
                </div>

                {/* GENDER */}

                <div className="col-md-6">
                  <label className="form-label">
                    Gender
                  </label>

                  <select
                    name="gender"
                    className={`form-select ${fieldErrors.gender
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.gender
                    }
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
                      {
                        fieldErrors.gender
                      }
                    </div>
                  )}
                </div>

                {/* PHONE */}

                <div className="col-md-6">
                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    className={`form-control ${fieldErrors.phone
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.phone
                    }
                    onChange={handleChange}
                    onKeyDown={handlePhoneKeyDown}
                    maxLength="10"
                    inputMode="numeric"
                    autoComplete="off"
                  />

                  {fieldErrors.phone && (
                    <div className="invalid-feedback">
                      {
                        fieldErrors.phone
                      }
                    </div>
                  )}
                </div>

                {/* ROLE */}

                <div className="col-md-6">
                  <label className="form-label">
                    Role
                  </label>

                  <select
                    name="role"
                    className={`form-select ${fieldErrors.role
                      ? "is-invalid"
                      : ""
                      }`}
                    value={
                      formData.role
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Role
                    </option>

                    <option value="DOCTOR">
                      Doctor
                    </option>

                    <option value="RECEPTIONIST">
                      Receptionist
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
                      {
                        fieldErrors.role
                      }
                    </div>
                  )}
                </div>

                {/* ==================================================
                    DOCTOR FIELDS
                    ================================================== */}

                {formData.role === "DOCTOR" && (
                  <>
                    {/* DEPARTMENT */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Department
                      </label>

                      <select
                        name="department"
                        className={`form-select ${fieldErrors.department
                          ? "is-invalid"
                          : ""
                          }`}
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="">
                          Select Department
                        </option>

                        {/* Only active departments can be assigned to doctors. */}
                        {departments
                          .filter((department) => department.status)
                          .map((department) => (
                            <option
                              key={department.department_id}
                              value={department.department_id}
                            >
                              {department.department_name}
                            </option>
                          ))}
                      </select>

                      {fieldErrors.department && (
                        <div className="invalid-feedback">
                          {fieldErrors.department}
                        </div>
                      )}
                    </div>

                    {/* SPECIALIZATION */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Specialization
                      </label>

                      <input
                        type="text"
                        name="specialization"
                        className={`form-control ${fieldErrors.specialization
                          ? "is-invalid"
                          : ""
                          }`}
                        value={
                          formData.specialization
                        }
                        onChange={
                          handleChange
                        }
                      />

                      {fieldErrors.specialization && (
                        <div className="invalid-feedback">
                          {
                            fieldErrors.specialization
                          }
                        </div>
                      )}
                    </div>

                    {/* CONSULTATION FEE */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Consultation Fee
                      </label>

                      <input
                        type="number"
                        name="consultation_fee"
                        className={`form-control ${fieldErrors.consultation_fee
                          ? "is-invalid"
                          : ""
                          }`}
                        value={
                          formData.consultation_fee
                        }
                        onChange={
                          handleChange
                        }
                        min="0"
                        step="0.01"
                      />

                      {fieldErrors.consultation_fee && (
                        <div className="invalid-feedback">
                          {
                            fieldErrors.consultation_fee
                          }
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ADDRESS */}

                <div className="col-12">
                  <label className="form-label">
                    Address
                  </label>

                  <textarea
                    name="address"
                    className={`form-control ${fieldErrors.address
                      ? "is-invalid"
                      : ""
                      }`}
                    rows="3"
                    value={
                      formData.address
                    }
                    onChange={handleChange}
                  />

                  {fieldErrors.address && (
                    <div className="invalid-feedback">
                      {
                        fieldErrors.address
                      }
                    </div>
                  )}
                </div>

                {/* STATUS */}

                <div className="col-12">
                  <div className="form-check">

                    <input
                      type="checkbox"
                      name="status"
                      className="form-check-input"
                      id="staffStatus"
                      checked={
                        formData.status
                      }
                      onChange={handleChange}
                    />

                    <label
                      className="form-check-label"
                      htmlFor="staffStatus"
                    >
                      Active Staff
                    </label>

                  </div>
                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="d-flex gap-2 mt-4">

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingStaff
                      ? "Update Staff"
                      : "Save Staff"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        </div>
      ) : (
        <>

          {/* ====================================================
              SEARCH
              ==================================================== */}

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-body">

              <div className="mb-3">

                <div className="input-group">

                  {/* SEARCH INPUT */}

                  <div
                    style={{
                      position: "relative",
                      flex: 1,
                    }}
                  >

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, username, email, phone or role..."
                      value={searchTerm}
                      autoComplete="off"
                      onChange={async (e) => {
                        const value = e.target.value;

                        setSearchTerm(value);
                        setShowSuggestions(true);

                        // Refresh the staff data using the current search text
                        // so suggestions are not limited to the previous result.
                        if (value.trim()) {
                          await loadStaff(value);
                        } else {
                          await loadStaff("");
                        }
                      }}
                      onFocus={() => {
                        if (
                          searchTerm.trim()
                        ) {
                          setShowSuggestions(
                            true
                          );
                        }
                      }}
                      onKeyDown={(e) => {

                        if (
                          e.key === "Enter"
                        ) {
                          handleSearch();
                        }

                        if (
                          e.key === "Escape"
                        ) {
                          setShowSuggestions(
                            false
                          );
                        }

                      }}
                    />



                    {/* ==================================================
                        SEARCH SUGGESTION DROPDOWN
                        ================================================== */}

                    {showSuggestions &&
                      searchTerm.trim() &&
                      suggestions.length > 0 && (

                        <div
                          style={{
                            position:
                              "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor:
                              "#fff",
                            border:
                              "1px solid #dee2e6",
                            borderTop:
                              "none",
                            borderRadius:
                              "0 0 6px 6px",
                            boxShadow:
                              "0 4px 12px rgba(0,0,0,0.15)",
                            zIndex: 1000,
                            overflow:
                              "hidden",
                          }}
                        >

                          {suggestions.map(
                            (member) => (

                              <div
                                key={
                                  member.staff_id ||
                                  member.id
                                }
                                onMouseDown={() =>
                                  handleSuggestionClick(
                                    member
                                  )
                                }
                                style={{
                                  padding:
                                    "10px 14px",
                                  cursor:
                                    "pointer",
                                  borderBottom:
                                    "1px solid #eee",
                                  backgroundColor:
                                    "#fff",
                                }}
                                onMouseEnter={(
                                  e
                                ) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f8f9fa";
                                }}
                                onMouseLeave={(
                                  e
                                ) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#fff";
                                }}
                              >

                                <div
                                  style={{
                                    fontWeight:
                                      "600",
                                    color:
                                      "#212529",
                                  }}
                                >
                                  {
                                    member.first_name
                                  }{" "}
                                  {
                                    member.last_name
                                  }
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      "13px",
                                    color:
                                      "#6c757d",
                                    marginTop:
                                      "3px",
                                  }}
                                >
                                  {
                                    member.username
                                  }

                                  {" • "}

                                  {
                                    member.email
                                  }

                                  {" • "}

                                  {
                                    member.role
                                  }
                                </div>

                              </div>

                            )
                          )}

                        </div>
                      )}

                  </div>

                  {/* SEARCH BUTTON */}

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      handleSearch
                    }
                  >
                    Search
                  </button>

                  {/* CLEAR BUTTON */}

                  {searchTerm && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={
                        handleClear
                      }
                    >
                      Clear
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              STAFF TABLE
              ==================================================== */}

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5 className="mb-0">
                  Staff
                </h5>

                <span className="text-muted">
                  {staff.length} Staff
                </span>

              </div>

              {loading ? (

                <div className="text-center py-5">
                  <p className="text-muted mb-0">
                    Loading staff...
                  </p>
                </div>

              ) : staff.length === 0 ? (

                <div className="text-center py-5">
                  <p className="text-muted mb-0">
                    No staff found.
                  </p>
                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover align-middle mb-0">

                    <thead className="table-light">

                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>

                    </thead>

                    <tbody>

                      {staff.map(
                        (member) => (

                          <tr
                            key={
                              member.staff_id ||
                              member.id
                            }
                          >

                            <td>
                              {
                                member.first_name
                              }{" "}
                              {
                                member.last_name
                              }
                            </td>

                            <td>
                              {
                                member.username
                              }
                            </td>

                            <td>
                              {
                                member.email
                              }
                            </td>

                            <td>
                              {
                                member.phone
                              }
                            </td>

                            <td>
                              {
                                member.role
                              }
                            </td>

                            <td>

                              <span
                                className={`badge ${member.status
                                  ? "bg-success"
                                  : "bg-secondary"
                                  }`}
                              >
                                {member.status
                                  ? "Active"
                                  : "Inactive"}
                              </span>

                            </td>

                            <td>

                              <div className="d-flex gap-2">

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    handleEditStaff(
                                      member
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className={`btn btn-sm ${member.status
                                    ? "btn-outline-danger"
                                    : "btn-outline-success"
                                    }`}
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

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </div>

        </>

      )}

    </div>
  );
}

export default StaffList;