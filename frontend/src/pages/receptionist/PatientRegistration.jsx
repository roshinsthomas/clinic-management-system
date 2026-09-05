import { useState } from "react";

function PatientRegistration({ onBack, onScheduleAppointment }) {
  const getInitialFormData = () => ({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    blood_group: "",
    status: "Active",
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate valid DOB range
  const today = new Date();

  const todayString = (() => {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const maxDobDate = new Date(today);
  maxDobDate.setDate(maxDobDate.getDate() - 1);

  const minDobDate = new Date(today);
  minDobDate.setFullYear(minDobDate.getFullYear() - 120);

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const minimumDob = formatDateForInput(minDobDate);
  const maximumDob = formatDateForInput(maxDobDate);

  const validateName = (value, required = true) => {
    if (!value) {
      return required ? "This field is required." : "";
    }

    if (value.trim() !== value) {
      return "Leading or trailing spaces are not allowed.";
    }

    if (/\s{2,}/.test(value)) {
      return "Only single spaces are allowed between words.";
    }

    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)) {
      return "Only alphabets and single spaces are allowed.";
    }

    return "";
  };

  const validateDob = (dob) => {
    if (!dob) {
      return "Date of birth is required.";
    }

    if (dob < minimumDob) {
      return "Patient age cannot be more than 120 years.";
    }

    if (dob >= todayString) {
      return "Date of birth must be before today.";
    }

    const selectedDob = new Date(`${dob}T00:00:00`);

    if (Number.isNaN(selectedDob.getTime())) {
      return "Please enter a valid date of birth.";
    }

    let age =
      today.getFullYear() -
      selectedDob.getFullYear();

    const monthDifference =
      today.getMonth() -
      selectedDob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < selectedDob.getDate())
    ) {
      age--;
    }

    if (age > 120) {
      return "Patient age cannot be more than 120 years.";
    }

    if (age < 1) {
      return "Patient must be at least 1 year old.";
    }

    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) {
      return "Phone number is required.";
    }

    if (!/^\d+$/.test(phone)) {
      return "Phone number must contain digits only.";
    }

    if (!/^[789]/.test(phone)) {
      return "Phone number must start with 7, 8, or 9.";
    }

    if (phone.length !== 10) {
      return "Phone number must contain exactly 10 digits.";
    }

    return "";
  };

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required.";
    }

    if (email.trim() !== email) {
      return "Leading or trailing spaces are not allowed.";
    }

    if (/\s/.test(email)) {
      return "Spaces are not allowed in email.";
    }

    if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
      return "Enter a valid email ending with .com.";
    }

    return "";
  };

  const validateAddress = (address) => {
    if (!address) {
      return "Address is required.";
    }

    if (!address.trim()) {
      return "Address cannot contain only spaces.";
    }

    if (address.trim() !== address) {
      return "Leading or trailing spaces are not allowed.";
    }

    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
        return validateName(value, true);

      case "last_name":
        return validateName(value, false);

      case "dob":
        return validateDob(value);

      case "gender":
        return value ? "" : "Gender is required.";

      case "phone":
        return validatePhone(value);

      case "email":
        return validateEmail(value);

      case "blood_group":
        return value ? "" : "Blood group is required.";

      case "address":
        return validateAddress(value);

      default:
        return "";
    }
  };

  const validateAllFields = () => {
    const errors = {};

    Object.keys(formData).forEach((name) => {
      if (name === "status") return;

      const fieldError = validateField(name, formData[name]);

      if (fieldError) {
        errors[name] = fieldError;
      }
    });

    setFieldErrors(errors);
    setTouched({
      first_name: true,
      last_name: true,
      dob: true,
      gender: true,
      address: true,
      phone: true,
      email: true,
      blood_group: true,
    });

    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // Phone should never accept non-digits.
    // This also prevents special characters/letters from entering the field.
    if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Names should not accept numbers or special characters.
    // Spaces are retained so the validation message can be shown immediately.
    if (name === "first_name" || name === "last_name") {
      newValue = value.replace(/[^A-Za-z ]/g, "");
    }

    setFormData((previous) => ({
      ...previous,
      [name]: newValue,
    }));

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));

    const validationError = validateField(name, newValue);

    setFieldErrors((previous) => ({
      ...previous,
      [name]: validationError,
    }));

    setMessage("");
    setError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));

    const validationError = validateField(name, value);

    setFieldErrors((previous) => ({
      ...previous,
      [name]: validationError,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const isValid = validateAllFields();

    if (!isValid) {
      setError("Please correct the highlighted fields before registering.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/receptionist/patients/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const backendErrors = {};

        Object.keys(data || {}).forEach((field) => {
          if (Array.isArray(data[field]) && data[field].length > 0) {
            backendErrors[field] = data[field][0];
          }
        });

        if (Object.keys(backendErrors).length > 0) {
          setFieldErrors(backendErrors);
          setTouched((previous) => ({
            ...previous,
            ...Object.fromEntries(
              Object.keys(backendErrors).map((field) => [field, true])
            ),
          }));
        }

        throw new Error(
          data.detail ||
            data.non_field_errors?.[0] ||
            "Please correct the highlighted fields."
        );
      }

      setMessage("Patient registered successfully!");

      const newPatientId = data.patient_id;

      setFormData(getInitialFormData());
      setFieldErrors({});
      setTouched({});

      // Continue directly to Schedule Appointment and preselect
      // the patient that was just registered.
      if (onScheduleAppointment && newPatientId) {
        onScheduleAppointment(newPatientId);
      }
    } catch (err) {
      console.error("Patient registration error:", err);
      setError(err.message || "Failed to register patient.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData(getInitialFormData());
    setFieldErrors({});
    setTouched({});
    setMessage("");
    setError("");
  };

  const renderFieldError = (name) => {
    if (!touched[name] || !fieldErrors[name]) {
      return null;
    }

    return (
      <div className="text-danger small mt-1">
        {fieldErrors[name]}
      </div>
    );
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">

        <div className="mb-4">
          <h2 className="fw-bold">
            Patient Registration
          </h2>

          <p className="text-muted">
            Register a new patient in the clinic.
          </p>
        </div>

        {/* Back Button */}
        <button
          type="button"
          className="btn btn-outline-secondary mb-3"
          onClick={onBack}
        >
          ← Back
        </button>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">

            <form onSubmit={handleSubmit} noValidate>

              <div className="row g-3">

                {/* First Name */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    className={`form-control ${
                      touched.first_name && fieldErrors.first_name
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter first name"
                    required
                  />

                  {renderFieldError("first_name")}
                </div>

                {/* Last Name */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    className={`form-control ${
                      touched.last_name && fieldErrors.last_name
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter last name"
                  />

                  {renderFieldError("last_name")}
                </div>

                {/* Date of Birth */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dob"
                    className={`form-control ${
                      touched.dob && fieldErrors.dob
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.dob}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={minimumDob}
                    max={maximumDob}
                    required
                  />

                  <small className="text-muted">
                    Valid age: 1–120 years
                  </small>

                  {renderFieldError("dob")}
                </div>

                {/* Gender */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Gender
                  </label>

                  <select
                    name="gender"
                    className={`form-select ${
                      touched.gender && fieldErrors.gender
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                  {renderFieldError("gender")}
                </div>

                {/* Phone */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    className={`form-control ${
                      touched.phone && fieldErrors.phone
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter 10-digit phone number"
                    inputMode="numeric"
                    maxLength="10"
                    required
                  />

                  {renderFieldError("phone")}
                </div>

                {/* Email */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className={`form-control ${
                      touched.email && fieldErrors.email
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter email address"
                    required
                  />

                  {renderFieldError("email")}
                </div>

                {/* Blood Group */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Blood Group
                  </label>

                  <select
                    name="blood_group"
                    className={`form-select ${
                      touched.blood_group && fieldErrors.blood_group
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.blood_group}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">
                      Select blood group
                    </option>

                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>

                  {renderFieldError("blood_group")}
                </div>

                {/* Status */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* Address */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Address
                  </label>

                  <textarea
                    name="address"
                    className={`form-control ${
                      touched.address && fieldErrors.address
                        ? "is-invalid"
                        : ""
                    }`}
                    rows="4"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter patient address"
                    required
                  ></textarea>

                  {renderFieldError("address")}
                </div>

              </div>

              {/* Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-2 mt-4">

                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading
                    ? "Registering..."
                    : "Register Patient"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={clearForm}
                  disabled={loading}
                >
                  Clear
                </button>

              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default PatientRegistration;
