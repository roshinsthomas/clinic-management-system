import { useEffect, useState } from "react";

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [viewingPatient, setViewingPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

  const token = localStorage.getItem("access_token");

  // FETCH PATIENTS
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

  // SEARCH ONLY BY PATIENT ID OR PHONE NUMBER
  const filteredPatients = patients.filter((patient) => {
    const searchText = search.toLowerCase();

    return (
      patient.patient_id
        .toString()
        .includes(searchText) ||
      patient.phone.includes(search)
    );
  });

  // CLEAR
  const handleClear = () => {
    setSearch("");
    setError("");
    setSuccess("");
    setViewingPatient(null);
    setEditingPatient(null);
  };

  // VIEW
  const handleView = (patient) => {
    setViewingPatient(patient);
    setEditingPatient(null);
    setError("");
    setSuccess("");
  };

  // EDIT
  const handleEdit = (patient) => {
    setEditingPatient({ ...patient });
    setViewingPatient(null);
    setError("");
    setSuccess("");
  };

  // EDIT FIELD CHANGE
  const handleEditChange = (e) => {
    setEditingPatient({
      ...editingPatient,
      [e.target.name]: e.target.value,
    });
  };

  // UPDATE PATIENT
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

      setSuccess(
        "Patient details updated successfully!"
      );

      setEditingPatient(null);

      await fetchPatients();
    } catch (error) {
      setError(error.message);
    }
  };

  // DISABLE PATIENT
  const handleDisable = async (patient) => {
    const confirmDisable = window.confirm(
      `Are you sure you want to disable Patient ID ${patient.patient_id}?`
    );

    if (!confirmDisable) {
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
            status: "Inactive",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || JSON.stringify(data)
        );
      }

      setSuccess(
        `Patient ID ${patient.patient_id} has been disabled successfully.`
      );

      setViewingPatient(null);

      await fetchPatients();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">

        {/* PAGE HEADER */}
        <div className="mb-4">
          <h2 className="fw-bold">Patient List</h2>

          <p className="text-muted mb-0">
            Search, view, edit and disable registered patients.
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

        {/* SEARCH SECTION */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">

            <div className="row g-3 align-items-end">

              <div className="col-12 col-md-9">

                <label className="form-label fw-semibold">
                  Search Patient
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Patient ID or Phone Number"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

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

                            {/* DISABLE */}
                            {patient.status === "Active" ? (

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDisable(patient)
                                }
                              >
                                Disable
                              </button>

                            ) : (

                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                disabled
                              >
                                Disabled
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

        {/* VIEW PATIENT */}
        {viewingPatient && (

          <div className="card border-0 shadow-sm mt-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                  <h4 className="fw-bold mb-1">
                    Patient Details
                  </h4>

                  <p className="text-muted mb-0">
                    Patient ID:{" "}
                    {viewingPatient.patient_id}
                  </p>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setViewingPatient(null)
                  }
                ></button>

              </div>

              <div className="row g-3">

                <div className="col-12 col-md-6">
                  <strong>First Name</strong>
                  <p>{viewingPatient.first_name}</p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Last Name</strong>
                  <p>{viewingPatient.last_name}</p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Date of Birth</strong>
                  <p>{viewingPatient.dob}</p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Gender</strong>
                  <p>{viewingPatient.gender}</p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Phone</strong>
                  <p>{viewingPatient.phone}</p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Email</strong>
                  <p>{viewingPatient.email}</p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Blood Group</strong>
                  <p>{viewingPatient.blood_group}</p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Status</strong>

                  <p>
                    <span
                      className={`badge ${
                        viewingPatient.status === "Active"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {viewingPatient.status}
                    </span>
                  </p>

                </div>

                <div className="col-12">
                  <strong>Address</strong>
                  <p>{viewingPatient.address}</p>
                </div>

              </div>

              {viewingPatient.status === "Active" && (

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() =>
                    handleDisable(viewingPatient)
                  }
                >
                  Disable Patient
                </button>

              )}

            </div>

          </div>

        )}

        {/* EDIT PATIENT */}
        {editingPatient && (

          <div className="card border-0 shadow-sm mt-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                  <h4 className="fw-bold mb-1">
                    Edit Patient
                  </h4>

                  <p className="text-muted mb-0">
                    Patient ID:{" "}
                    {editingPatient.patient_id}
                  </p>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setEditingPatient(null)
                  }
                ></button>

              </div>

              <form onSubmit={handleUpdate}>

                <div className="row g-3">

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="first_name"
                      className="form-control"
                      value={editingPatient.first_name}
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="last_name"
                      className="form-control"
                      value={editingPatient.last_name}
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={editingPatient.dob}
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Gender
                    </label>

                    <select
                      name="gender"
                      className="form-select"
                      value={editingPatient.gender}
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

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={editingPatient.phone}
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={editingPatient.email}
                      onChange={handleEditChange}
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Blood Group
                    </label>

                    <select
                      name="blood_group"
                      className="form-select"
                      value={editingPatient.blood_group}
                      onChange={handleEditChange}
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

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="form-label fw-semibold">
                      Status
                    </label>

                    <select
                      name="status"
                      className="form-select"
                      value={editingPatient.status}
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

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      Address
                    </label>

                    <textarea
                      name="address"
                      className="form-control"
                      rows="3"
                      value={editingPatient.address}
                      onChange={handleEditChange}
                      required
                    ></textarea>

                  </div>

                </div>

                <div className="mt-4 d-flex gap-2">

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update Patient
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setEditingPatient(null)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default PatientList;