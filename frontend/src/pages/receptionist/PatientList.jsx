import { useEffect, useState } from "react";

function PatientList({ onBack }) {
  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [viewingPatient, setViewingPatient] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editingPatient, setEditingPatient] = useState(null);

  const token = localStorage.getItem("access_token");

  // ==========================================
  // FETCH PATIENTS
  // ==========================================

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/receptionist/patients/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch patients."
        );
      }

      setPatients(data);
    } catch (error) {
      setError(error.message);
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
      const fullName = `${patient.first_name || ""} ${
        patient.last_name || ""
      }`
        .toLowerCase()
        .trim();

      return fullName.includes(searchText);
    }

    // Phone - PARTIAL MATCH
    if (searchType === "phone") {
      return String(patient.phone || "").includes(searchText);
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

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/patients/${patient.patient_id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load patient details."
        );
      }

      setViewingPatient(data);
    } catch (error) {
      setError(error.message);
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
  // EDIT PATIENT
  // ==========================================

  const handleEdit = (patient) => {
    setEditingPatient({ ...patient });
    setViewingPatient(null);
    setError("");
    setSuccess("");
  };

  // ==========================================
  // EDIT FIELD CHANGE
  // ==========================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingPatient({
      ...editingPatient,
      [name]: value,
    });
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

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/patients/${editingPatient.patient_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: editingPatient.first_name,
            last_name: editingPatient.last_name,
            dob: editingPatient.dob,
            gender: editingPatient.gender,
            address: editingPatient.address,
            phone: editingPatient.phone,
            email: editingPatient.email,
            blood_group: editingPatient.blood_group,
            status: editingPatient.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || JSON.stringify(data)
        );
      }

      // Refresh patient list from database
      await fetchPatients();

      // Return to Patient List
      setEditingPatient(null);

      setSuccess(
        "Patient details updated successfully."
      );
    } catch (error) {
      setError(error.message);
    }
  };

  // ==========================================
  // DISABLE / ENABLE PATIENT
  // ==========================================

  const handleToggleStatus = async (patient) => {
    const isActive = patient.status === "Active";

    const newStatus = isActive
      ? "Inactive"
      : "Active";

    const action = isActive
      ? "disable"
      : "enable";

    const confirmAction = window.confirm(
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

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/patients/${patient.patient_id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || JSON.stringify(data)
        );
      }

      // Refresh the patient list
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
      setError(error.message);
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
                        className={`badge ${
                          viewingPatient.status === "Active"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
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

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    handleEdit(viewingPatient)
                  }
                >
                  Edit Patient
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

            {/* BACK BUTTON - RIGHT CORNER */}

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

              <form onSubmit={handleUpdate}>

                <div className="row g-3">

                  {/* PATIENT ID */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Patient ID
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editingPatient.patient_id || ""}
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
                      className="form-control"
                      value={
                        editingPatient.first_name || ""
                      }
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  {/* LAST NAME */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="last_name"
                      className="form-control"
                      value={
                        editingPatient.last_name || ""
                      }
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  {/* DATE OF BIRTH */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={editingPatient.dob || ""}
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  {/* GENDER */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Gender
                    </label>

                    <select
                      name="gender"
                      className="form-select"
                      value={
                        editingPatient.gender || ""
                      }
                      onChange={handleEditChange}
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

                  </div>

                  {/* PHONE */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={
                        editingPatient.phone || ""
                      }
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={
                        editingPatient.email || ""
                      }
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  {/* BLOOD GROUP */}

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Blood Group
                    </label>

                    <select
                      name="blood_group"
                      className="form-select"
                      value={
                        editingPatient.blood_group || ""
                      }
                      onChange={handleEditChange}
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

                  </div>

                  {/* ADDRESS */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Address
                    </label>

                    <textarea
                      name="address"
                      className="form-control"
                      rows="4"
                      value={
                        editingPatient.address || ""
                      }
                      onChange={handleEditChange}
                      required
                    ></textarea>

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

        <div className="mb-4">

          <button
            type="button"
            className="btn btn-outline-secondary mb-3"
            onClick={onBack}
          >
            ← Back
          </button>

          <h2 className="fw-bold">
            Patient List
          </h2>

          <p className="text-muted mb-0">
            Search, view, edit and disable registered
            patients.
          </p>

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
                    setSearchType(e.target.value);
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

                    {filteredPatients.map((patient) => (

                      <tr key={patient.patient_id}>

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
                            className={`badge ${
                              patient.status === "Active"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
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
                                handleView(patient)
                              }
                            >
                              View
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleEdit(patient)
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
                                  handleToggleStatus(patient)
                                }
                              >
                                Disable
                              </button>

                            ) : (

                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  handleToggleStatus(patient)
                                }
                              >
                                Enable
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    ))}

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