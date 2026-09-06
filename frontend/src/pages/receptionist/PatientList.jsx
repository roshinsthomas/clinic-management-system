import { useEffect, useState } from "react";

// Receptionist patient API functions.
import {
  getPatients,
  getPatientById,
  updatePatient,
  updatePatientStatus,
} from "../../services/receptionistService";


function PatientList({ onBack, onScheduleAppointment }) {

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [viewingPatient, setViewingPatient] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editingPatient, setEditingPatient] = useState(null);

  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});


  // ==========================================
  // FETCH PATIENTS
  // ==========================================

  const fetchPatients = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getPatients();

      // Support both normal arrays and DRF paginated responses.
      const patientList = Array.isArray(data)
        ? data
        : data.results || [];

      setPatients(patientList);

    } catch (error) {

      setError(
        error.message || "Failed to fetch patients."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    fetchPatients();

  }, []);


  // ==========================================
  // SEARCH
  // ==========================================

  const filteredPatients = patients.filter((patient) => {

    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }


    // Patient ID - EXACT MATCH
    if (searchType === "id") {

      return (
        String(patient.patient_id || "")
          .toLowerCase()
          .trim() === searchText
      );
    }


    // Name - PARTIAL MATCH
    if (searchType === "name") {

      const fullName =
        `${patient.first_name || ""} ${patient.last_name || ""}`
          .toLowerCase()
          .trim();

      return fullName.includes(searchText);
    }


    // Phone - PARTIAL MATCH
    if (searchType === "phone") {

      return String(
        patient.phone || ""
      ).includes(searchText);
    }


    return true;
  });


  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const handleClear = () => {

    setSearch("");
    setError("");
    setSuccess("");
  };


  // ==========================================
  // VIEW PATIENT
  // ==========================================

  const handleView = async (patient) => {

    try {

      setError("");
      setSuccess("");
      setViewLoading(true);

      setViewingPatient(null);
      setEditingPatient(null);

      const data = await getPatientById(
        patient.patient_id
      );

      setViewingPatient(data);

    } catch (error) {

      setError(
        error.message ||
        "Failed to load patient details."
      );

    } finally {

      setViewLoading(false);
    }
  };


  // ==========================================
  // BACK FROM VIEW PAGE
  // ==========================================

  const handleBackFromView = () => {

    setViewingPatient(null);
    setError("");
    setSuccess("");
  };


  // ==========================================
  // EDIT PATIENT VALIDATION
  // ==========================================

  const today = new Date();


  const formatDateForInput = (date) => {

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  // Maximum DOB = yesterday.
  // A patient cannot have today's date or a future date.
  const maxDobDate = new Date(today);

  maxDobDate.setDate(
    maxDobDate.getDate() - 1
  );


  // Minimum DOB = 120 years ago.
  const minDobDate = new Date(today);

  minDobDate.setFullYear(
    minDobDate.getFullYear() - 120
  );


  const minimumDob =
    formatDateForInput(minDobDate);

  const maximumDob =
    formatDateForInput(maxDobDate);


  // ==========================================
  // NAME VALIDATION
  // ==========================================

  const validateName = (
    value,
    required = true
  ) => {

    if (!value) {

      return required
        ? "This field is required."
        : "";
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


  // ==========================================
  // DOB VALIDATION
  // ==========================================

  const validateDob = (dob) => {

    if (!dob) {

      return "Date of birth is required.";
    }


    if (dob < minimumDob) {

      return "Patient age cannot be more than 120 years.";
    }


    if (dob >= formatDateForInput(today)) {

      return "Date of birth must be before today.";
    }


    const selectedDob =
      new Date(`${dob}T00:00:00`);


    if (
      Number.isNaN(
        selectedDob.getTime()
      )
    ) {

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
      (
        monthDifference === 0 &&
        today.getDate() < selectedDob.getDate()
      )
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


  // ==========================================
  // PHONE VALIDATION
  // ==========================================

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


  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

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


  // ==========================================
  // ADDRESS VALIDATION
  // ==========================================

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


  // ==========================================
  // EDIT FIELD VALIDATION
  // ==========================================

  const validateEditField = (
    name,
    value
  ) => {

    switch (name) {

      case "first_name":
        return validateName(value, true);

      case "last_name":
        return validateName(value, false);

      case "dob":
        return validateDob(value);

      case "gender":
        return value
          ? ""
          : "Gender is required.";

      case "phone":
        return validatePhone(value);

      case "email":
        return validateEmail(value);

      case "blood_group":
        return value
          ? ""
          : "Blood group is required.";

      case "address":
        return validateAddress(value);

      default:
        return "";
    }
  };


  // ==========================================
  // EDIT PATIENT
  // ==========================================

  const handleEdit = (patient) => {

    setEditingPatient({
      ...patient
    });

    setViewingPatient(null);

    setEditFieldErrors({});
    setEditTouched({});

    setError("");
    setSuccess("");
  };


  // ==========================================
  // EDIT FIELD CHANGE
  // ==========================================

  const handleEditChange = (e) => {

    const {
      name,
      value
    } = e.target;


    let newValue = value;


    // Phone:
    // Keep digits only and maximum 10 digits.
    if (name === "phone") {

      newValue =
        value
          .replace(/\D/g, "")
          .slice(0, 10);
    }


    // Names:
    // Keep alphabets and spaces only.
    if (
      name === "first_name" ||
      name === "last_name"
    ) {

      newValue =
        value.replace(
          /[^A-Za-z ]/g,
          ""
        );
    }


    setEditingPatient(
      (previous) => ({
        ...previous,
        [name]: newValue,
      })
    );


    setEditTouched(
      (previous) => ({
        ...previous,
        [name]: true,
      })
    );


    const validationError =
      validateEditField(
        name,
        newValue
      );


    setEditFieldErrors(
      (previous) => ({
        ...previous,
        [name]: validationError,
      })
    );


    setError("");
    setSuccess("");
  };


  // ==========================================
  // EDIT FIELD BLUR
  // ==========================================

  const handleEditBlur = (e) => {

    const {
      name,
      value
    } = e.target;


    setEditTouched(
      (previous) => ({
        ...previous,
        [name]: true,
      })
    );


    const validationError =
      validateEditField(
        name,
        value
      );


    setEditFieldErrors(
      (previous) => ({
        ...previous,
        [name]: validationError,
      })
    );
  };


  // ==========================================
  // EDIT FIELD ERROR
  // ==========================================

  const renderEditFieldError = (name) => {

    if (
      !editTouched[name] ||
      !editFieldErrors[name]
    ) {

      return null;
    }


    return (
      <div className="text-danger small mt-1">
        {editFieldErrors[name]}
      </div>
    );
  };


  // ==========================================
  // VALIDATE ALL EDIT FIELDS
  // ==========================================

  const validateAllEditFields = () => {

    const errors = {};


    [
      "first_name",
      "last_name",
      "dob",
      "gender",
      "phone",
      "email",
      "blood_group",
      "address"
    ].forEach((name) => {

      const fieldError =
        validateEditField(
          name,
          editingPatient?.[name] || ""
        );


      if (fieldError) {

        errors[name] = fieldError;
      }
    });


    setEditFieldErrors(errors);


    setEditTouched({

      first_name: true,
      last_name: true,
      dob: true,
      gender: true,
      phone: true,
      email: true,
      blood_group: true,
      address: true,

    });


    return (
      Object.keys(errors).length === 0
    );
  };


  // ==========================================
  // BACK FROM EDIT PAGE
  // ==========================================

  const handleBackFromEdit = () => {

    setEditingPatient(null);

    setError("");
    setSuccess("");
  };


  // ==========================================
  // UPDATE PATIENT
  // ==========================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!validateAllEditFields()) {

      setError(
        "Please correct the highlighted fields before updating."
      );

      return;
    }


    try {

      const patientData = {

        first_name:
          editingPatient.first_name,

        last_name:
          editingPatient.last_name,

        dob:
          editingPatient.dob,

        gender:
          editingPatient.gender,

        address:
          editingPatient.address,

        phone:
          editingPatient.phone,

        email:
          editingPatient.email,

        blood_group:
          editingPatient.blood_group,

        status:
          editingPatient.status,
      };


      await updatePatient(
        editingPatient.patient_id,
        patientData
      );


      // Refresh patient list.
      await fetchPatients();


      // Return to Patient List.
      setEditingPatient(null);

      setEditFieldErrors({});
      setEditTouched({});


      setSuccess(
        "Patient details updated successfully."
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to update patient."
      );
    }
  };


  // ==========================================
  // DISABLE / ENABLE PATIENT
  // ==========================================

  const handleToggleStatus = async (
    patient
  ) => {

    const isActive =
      patient.status === "Active";


    const newStatus =
      isActive
        ? "Inactive"
        : "Active";


    const action =
      isActive
        ? "disable"
        : "enable";


    const confirmAction =
      window.confirm(

        isActive

          ? `Are you sure you want to disable Patient ID ${patient.patient_id}?`

          : `Are you sure you want to enable Patient ID ${patient.patient_id}?`

      );


    if (!confirmAction) {

      return;
    }


    try {

      setError("");
      setSuccess("");


      await updatePatientStatus(
        patient.patient_id,
        newStatus
      );


      await fetchPatients();


      if (action === "disable") {

        setSuccess(
          `Patient ID ${patient.patient_id} has been disabled successfully.`
        );

      } else {

        setSuccess(
          `Patient ID ${patient.patient_id} has been enabled successfully.`
        );
      }

    } catch (error) {

      setError(
        error.message ||
        `Failed to ${action} patient.`
      );
    }
  };


  // ==========================================
  // VIEW PAGE - LOADING
  // ==========================================

  if (viewLoading) {

    return (
      <div className="container-fluid bg-light min-vh-100 py-4">

        <div className="container">

          <div className="card border-0 shadow-sm">

            <div className="card-body p-5 text-center">

              <div className="spinner-border text-primary"></div>

              <p className="mt-3 mb-0 text-muted">
                Loading complete patient details...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================
  // VIEW PATIENT PAGE
  // ==========================================

  if (viewingPatient) {

    return (
      <div className="container-fluid bg-light min-vh-100 py-4">

        <div className="container">

          {/* PAGE HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h2 className="fw-bold mb-1">
                Patient Details
              </h2>

              <p className="text-muted mb-0">
                Complete information for Patient ID{" "}
                {viewingPatient.patient_id}
              </p>

            </div>


            {/* BACK BUTTON */}

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleBackFromView}
            >
              ← Back
            </button>

          </div>


          {/* PATIENT DETAILS CARD */}

          <div className="card border-0 shadow-sm">

            <div className="card-body p-4">

              <div className="row g-4">

                {/* PATIENT ID */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Patient ID
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.patient_id}
                    </h6>

                  </div>

                </div>


                {/* STATUS */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Status
                    </small>

                    <div className="mt-1">

                      <span
                        className={
                          `badge ${
                            viewingPatient.status === "Active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`
                        }
                      >
                        {viewingPatient.status}
                      </span>

                    </div>

                  </div>

                </div>


                {/* FIRST NAME */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      First Name
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.first_name || "-"}
                    </h6>

                  </div>

                </div>


                {/* LAST NAME */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Last Name
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.last_name || "-"}
                    </h6>

                  </div>

                </div>


                {/* DATE OF BIRTH */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Date of Birth
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.dob || "-"}
                    </h6>

                  </div>

                </div>


                {/* GENDER */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Gender
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.gender || "-"}
                    </h6>

                  </div>

                </div>


                {/* PHONE */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Phone Number
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.phone || "-"}
                    </h6>

                  </div>

                </div>


                {/* EMAIL */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Email
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.email || "-"}
                    </h6>

                  </div>

                </div>


                {/* BLOOD GROUP */}

                <div className="col-12 col-md-6">

                  <div className="border rounded p-3 h-100">

                    <small className="text-muted">
                      Blood Group
                    </small>

                    <h6 className="mb-0 mt-1">
                      {viewingPatient.blood_group || "-"}
                    </h6>

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="col-12">

                  <div className="border rounded p-3">

                    <small className="text-muted">
                      Address
                    </small>

                    <p className="mb-0 mt-1">
                      {viewingPatient.address || "-"}
                    </p>

                  </div>

                </div>

              </div>


              {/* ACTION BUTTONS */}

              <div className="d-flex justify-content-end gap-2 mt-4">

                {/* EDIT PATIENT */}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    handleEdit(viewingPatient)
                  }
                >
                  Edit Patient
                </button>


                {/* SCHEDULE APPOINTMENT */}

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {

                    if (
                      viewingPatient.status !== "Active"
                    ) {
                      return;
                    }

                    if (
                      onScheduleAppointment
                    ) {
                      onScheduleAppointment(
                        viewingPatient
                      );
                    }

                  }}
                  disabled={
                    viewingPatient.status !== "Active"
                  }
                  title={
                    viewingPatient.status !== "Active"
                      ? "Inactive patients cannot be scheduled for an appointment."
                      : "Schedule an appointment for this patient."
                  }
                >
                  Schedule Appointment
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================
  // EDIT PATIENT PAGE
  // ==========================================

  if (editingPatient) {

    return (
      <div className="container-fluid bg-light min-vh-100 py-4">

        <div className="container">

          {/* PAGE HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h2 className="fw-bold mb-1">
                Edit Patient
              </h2>

              <p className="text-muted mb-0">
                Update information for Patient ID{" "}
                {editingPatient.patient_id}
              </p>

            </div>


            {/* BACK BUTTON */}

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleBackFromEdit}
            >
              ← Back
            </button>

          </div>


          {/* EDIT CARD */}

          <div className="card border-0 shadow-sm">

            <div className="card-body p-4">

              <form
                onSubmit={handleUpdate}
                noValidate
              >

                <div className="row g-3">

                  {/* PATIENT ID */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Patient ID
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        editingPatient.patient_id || ""
                      }
                      disabled
                    />

                    <small className="text-muted">
                      Patient ID cannot be changed.
                    </small>

                  </div>


                  {/* STATUS */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Status
                    </label>

                    <select
                      name="status"
                      className="form-select"
                      value={
                        editingPatient.status || "Active"
                      }
                      onChange={handleEditChange}
                    >

                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>

                    </select>

                  </div>


                  {/* FIRST NAME */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="first_name"
                      className={
                        `form-control ${
                          editTouched.first_name &&
                          editFieldErrors.first_name
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      value={
                        editingPatient.first_name || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
                      placeholder="Enter first name"
                      required
                    />

                    {renderEditFieldError(
                      "first_name"
                    )}

                  </div>


                  {/* LAST NAME */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="last_name"
                      className={
                        `form-control ${
                          editTouched.last_name &&
                          editFieldErrors.last_name
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      value={
                        editingPatient.last_name || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
                      placeholder="Enter last name"
                      required
                    />

                    {renderEditFieldError(
                      "last_name"
                    )}

                  </div>


                  {/* DATE OF BIRTH */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dob"
                      className={
                        `form-control ${
                          editTouched.dob &&
                          editFieldErrors.dob
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      value={
                        editingPatient.dob || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
                      min={minimumDob}
                      max={maximumDob}
                      required
                    />

                    <small className="text-muted">
                      Valid age: 1–120 years
                    </small>

                    {renderEditFieldError("dob")}

                  </div>


                  {/* GENDER */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Gender
                    </label>

                    <select
                      name="gender"
                      className={
                        `form-select ${
                          editTouched.gender &&
                          editFieldErrors.gender
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      value={
                        editingPatient.gender || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
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

                    {renderEditFieldError("gender")}

                  </div>


                  {/* PHONE */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      className={
                        `form-control ${
                          editTouched.phone &&
                          editFieldErrors.phone
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      value={
                        editingPatient.phone || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
                      placeholder="Enter 10-digit phone number"
                      inputMode="numeric"
                      maxLength="10"
                      required
                    />

                    {renderEditFieldError("phone")}

                  </div>


                  {/* EMAIL */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className={
                        `form-control ${
                          editTouched.email &&
                          editFieldErrors.email
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      value={
                        editingPatient.email || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
                      placeholder="Enter email address"
                      required
                    />

                    {renderEditFieldError("email")}

                  </div>


                  {/* BLOOD GROUP */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Blood Group
                    </label>

                    <select
                      name="blood_group"
                      className={
                        `form-select ${
                          editTouched.blood_group &&
                          editFieldErrors.blood_group
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      value={
                        editingPatient.blood_group || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
                      required
                    >

                      <option value="">
                        Select blood group
                      </option>

                      <option value="A+">
                        A+
                      </option>

                      <option value="A-">
                        A-
                      </option>

                      <option value="B+">
                        B+
                      </option>

                      <option value="B-">
                        B-
                      </option>

                      <option value="AB+">
                        AB+
                      </option>

                      <option value="AB-">
                        AB-
                      </option>

                      <option value="O+">
                        O+
                      </option>

                      <option value="O-">
                        O-
                      </option>

                    </select>

                    {renderEditFieldError(
                      "blood_group"
                    )}

                  </div>


                  {/* ADDRESS */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Address
                    </label>

                    <textarea
                      name="address"
                      className={
                        `form-control ${
                          editTouched.address &&
                          editFieldErrors.address
                            ? "is-invalid"
                            : ""
                        }`
                      }
                      rows="4"
                      value={
                        editingPatient.address || ""
                      }
                      onChange={handleEditChange}
                      onBlur={handleEditBlur}
                      placeholder="Enter patient address"
                      required
                    ></textarea>

                    {renderEditFieldError(
                      "address"
                    )}

                  </div>

                </div>


                {/* FORM BUTTONS */}

                <div className="d-flex justify-content-end gap-2 mt-4">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleBackFromEdit}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update Patient
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================
  // PATIENT LIST PAGE
  // ==========================================

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">

      <div className="container">

        {/* PAGE HEADER */}

        <div className="mb-4 d-flex justify-content-between align-items-start">

          <div className="mb-4">

            <h2 className="fw-bold">
              Patient List
            </h2>

            <p className="text-muted mb-0">
              Search, view, edit and disable registered
              patients.
            </p>

          </div>


          <button
            type="button"
            className="btn btn-outline-secondary mb-3"
            onClick={onBack}
          >
            ← Back
          </button>

        </div>


        {/* SUCCESS MESSAGE */}

        {success && (

          <div className="alert alert-success">
            {success}
          </div>

        )}


        {/* ERROR MESSAGE */}

        {error && (

          <div className="alert alert-danger">
            {error}
          </div>

        )}


        {/* SEARCH CARD */}

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="row g-3 align-items-end">

              {/* SEARCH TYPE */}

              <div className="col-12 col-md-4">

                <label className="form-label fw-semibold">
                  Search By
                </label>

                <select
                  className="form-select"
                  value={searchType}
                  onChange={(e) => {

                    setSearchType(
                      e.target.value
                    );

                    setSearch("");
                  }}
                >

                  <option value="id">
                    Patient ID
                  </option>

                  <option value="name">
                    Name
                  </option>

                  <option value="phone">
                    Phone Number
                  </option>

                </select>

              </div>


              {/* SEARCH INPUT */}

              <div className="col-12 col-md-5">

                <label className="form-label fw-semibold">
                  Search Patient
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder={
                    searchType === "id"
                      ? "Enter exact Patient ID"
                      : searchType === "name"
                        ? "Enter patient name"
                        : "Enter phone number"
                  }
                />

              </div>


              {/* CLEAR */}

              <div className="col-12 col-md-3">

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={handleClear}
                >
                  Clear
                </button>

              </div>

            </div>

          </div>

        </div>


        {/* PATIENT TABLE */}

        {loading ? (

          <div className="text-center py-5">

            <div className="spinner-border text-primary"></div>

            <p className="mt-2 text-muted">
              Loading patients...
            </p>

          </div>

        ) : filteredPatients.length === 0 ? (

          <div className="alert alert-info">
            No patients found.
          </div>

        ) : (

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>

                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Phone</th>
                      <th>Blood Group</th>
                      <th>Status</th>
                      <th>Actions</th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredPatients.map(
                      (patient) => (

                        <tr
                          key={
                            patient.patient_id
                          }
                        >

                          <td className="fw-semibold">
                            {patient.patient_id}
                          </td>


                          <td>
                            {patient.first_name}{" "}
                            {patient.last_name}
                          </td>


                          <td>
                            {patient.gender}
                          </td>


                          <td>
                            {patient.phone}
                          </td>


                          <td>
                            {patient.blood_group}
                          </td>


                          <td>

                            <span
                              className={
                                `badge ${
                                  patient.status === "Active"
                                    ? "bg-success"
                                    : "bg-secondary"
                                }`
                              }
                            >
                              {patient.status}
                            </span>

                          </td>


                          <td>

                            <div className="d-flex flex-wrap gap-2">

                              {/* VIEW */}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() =>
                                  handleView(
                                    patient
                                  )
                                }
                              >
                                View
                              </button>


                              {/* EDIT */}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleEdit(
                                    patient
                                  )
                                }
                              >
                                Edit
                              </button>


                              {/* DISABLE / ENABLE */}

                              {patient.status === "Active" ? (

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleToggleStatus(
                                      patient
                                    )
                                  }
                                >
                                  Disable
                                </button>

                              ) : (

                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  onClick={() =>
                                    handleToggleStatus(
                                      patient
                                    )
                                  }
                                >
                                  Enable
                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


export default PatientList;