import { useEffect, useState } from "react";

function AppointmentList({ onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [editMode, setEditMode] = useState(false);

  const [editData, setEditData] = useState({
    appointment_date: "",
    appointment_time: "",
    appointment_type: "",
    status: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };


  /* ==========================================================
      FETCH APPOINTMENTS
  ========================================================== */

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/receptionist/appointments/",
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to load appointments."
        );
      }

      const list = Array.isArray(data)
        ? data
        : data.results || [];

      setAppointments(list);
      setFilteredAppointments(list);

    } catch (err) {
      setError(
        err.message ||
          "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAppointments();
  }, []);


  /* ==========================================================
      FILTERS
  ========================================================== */

  useEffect(() => {
    let result = [...appointments];

    if (dateFilter) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_date ===
          dateFilter
      );
    }

    if (typeFilter) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_type ===
          typeFilter
      );
    }

    setFilteredAppointments(result);
  }, [
    dateFilter,
    typeFilter,
    appointments,
  ]);


  const clearFilters = () => {
    setDateFilter("");
    setTypeFilter("");
  };


  /* ==========================================================
      VIEW
  ========================================================== */

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setEditMode(false);
    setMessage("");
    setError("");
  };


  /* ==========================================================
      EDIT
  ========================================================== */

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);

    setEditData({
      appointment_date:
        appointment.appointment_date || "",

      appointment_time:
        appointment.appointment_time
          ? appointment.appointment_time.slice(0, 5)
          : "",

      appointment_type:
        appointment.appointment_type || "",

      status:
        appointment.status || "Scheduled",
    });

    setEditMode(true);
    setMessage("");
    setError("");
  };


  const handleEditChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* ==========================================================
      FETCH AVAILABLE SLOTS FOR EDIT
  ========================================================== */

  useEffect(() => {
    if (
      editMode &&
      selectedAppointment &&
      editData.appointment_date &&
      selectedAppointment.doctor
    ) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [
    editMode,
    selectedAppointment,
    editData.appointment_date,
  ]);


  const fetchAvailableSlots = async () => {
    try {
      const doctorId =
        typeof selectedAppointment.doctor ===
        "object"
          ? selectedAppointment.doctor.staff_id
          : selectedAppointment.doctor;

      if (!doctorId) {
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/available-slots/?doctor=${doctorId}&date=${editData.appointment_date}`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAvailableSlots([]);
        return;
      }

      const slots = Array.isArray(data)
        ? data
        : data.slots ||
          data.available_slots ||
          [];

      /*
        Keep the currently selected appointment time
        available while editing.
      */
      const currentTime =
        selectedAppointment.appointment_time
          ? selectedAppointment.appointment_time.slice(
              0,
              5
            )
          : "";

      if (
        currentTime &&
        !slots.includes(currentTime)
      ) {
        slots.push(currentTime);
      }

      slots.sort();

      setAvailableSlots(slots);

    } catch {
      setAvailableSlots([]);
    }
  };


  /* ==========================================================
      UPDATE
  ========================================================== */

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!editData.appointment_date) {
        throw new Error(
          "Please select an appointment date."
        );
      }

      if (!editData.appointment_time) {
        throw new Error(
          "Please select an appointment time."
        );
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/${selectedAppointment.appointment_id}/`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            appointment_date:
              editData.appointment_date,

            appointment_time:
              editData.appointment_time,

            appointment_type:
              editData.appointment_type,

            status:
              editData.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const backendErrors =
          typeof data === "object"
            ? Object.entries(data)
                .map(
                  ([field, messages]) =>
                    `${field}: ${
                      Array.isArray(messages)
                        ? messages.join(", ")
                        : messages
                    }`
                )
                .join(" | ")
            : "Failed to update appointment.";

        throw new Error(
          backendErrors ||
            "Failed to update appointment."
        );
      }

      setMessage(
        "Appointment updated successfully."
      );

      setSelectedAppointment(data);

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.appointment_id ===
          data.appointment_id
            ? data
            : appointment
        )
      );

      setEditMode(false);

    } catch (err) {
      setError(
        err.message ||
          "Failed to update appointment."
      );
    } finally {
      setSaving(false);
    }
  };


  /* ==========================================================
      CANCEL APPOINTMENT
  ========================================================== */

  const handleCancel = async (appointment) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/${appointment.appointment_id}/`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status: "Cancelled",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to cancel appointment."
        );
      }

      setMessage(
        "Appointment cancelled successfully."
      );

      setAppointments((prev) =>
        prev.map((item) =>
          item.appointment_id ===
          appointment.appointment_id
            ? data
            : item
        )
      );

      if (
        selectedAppointment &&
        selectedAppointment.appointment_id ===
          appointment.appointment_id
      ) {
        setSelectedAppointment(data);
      }

    } catch (err) {
      setError(
        err.message ||
          "Failed to cancel appointment."
      );
    }
  };


  /* ==========================================================
      DISPLAY HELPERS
  ========================================================== */

  const getPatientName = (appointment) => {
    if (
      appointment.patient &&
      typeof appointment.patient === "object"
    ) {
      return `${appointment.patient.first_name || ""} ${
        appointment.patient.last_name || ""
      }`.trim();
    }

    return appointment.patient_name ||
      appointment.patient ||
      "-";
  };


  const getDoctorName = (appointment) => {
    if (
      appointment.doctor &&
      typeof appointment.doctor === "object"
    ) {
      return `Dr. ${
        appointment.doctor.first_name || ""
      } ${
        appointment.doctor.last_name || ""
      }`.trim();
    }

    return appointment.doctor_name ||
      appointment.doctor ||
      "-";
  };


  const getDepartmentName = (appointment) => {
    if (
      appointment.department &&
      typeof appointment.department === "object"
    ) {
      return (
        appointment.department.name ||
        appointment.department.department_name ||
        "-"
      );
    }

    return (
      appointment.department_name ||
      appointment.department ||
      "-"
    );
  };


  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  const formatType = (type) => {
    if (type === "WALK_IN") {
      return "Walk-in";
    }

    if (type === "PRIOR_BOOKING") {
      return "Prior Booking";
    }

    return type || "-";
  };


  const getStatusClass = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-primary";

      case "Completed":
        return "bg-success";

      case "Cancelled":
        return "bg-danger";

      case "Missed":
        return "bg-secondary";

      case "In Consultation":
        return "bg-warning text-dark";

      default:
        return "bg-secondary";
    }
  };


  /* ==========================================================
      VIEW PAGE
  ========================================================== */

  if (selectedAppointment) {
    return (
      <div
        className="min-vh-100"
        style={{ backgroundColor: "#f5f7fb" }}
      >

        <nav
          className="navbar navbar-dark px-4 shadow-sm"
          style={{
            backgroundColor: "#14213d",
          }}
        >
          <span className="navbar-brand fw-bold">
            🏥 Clinical Management System
          </span>

          <span className="text-white fw-semibold">
            Appointment Details
          </span>
        </nav>


        <div className="container py-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>
              <h2 className="fw-bold mb-1">
                {editMode
                  ? "Edit Appointment"
                  : "View Appointment"}
              </h2>

              <p className="text-muted mb-0">
                Appointment ID:{" "}
                {selectedAppointment.appointment_id}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setSelectedAppointment(null);
                setEditMode(false);
                setMessage("");
                setError("");
              }}
            >
              ← Back
            </button>

          </div>


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

              <div className="row g-4">

                {/* PATIENT */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Patient
                  </label>

                  <input
                    className="form-control"
                    value={getPatientName(
                      selectedAppointment
                    )}
                    disabled
                  />
                </div>


                {/* DOCTOR */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Doctor
                  </label>

                  <input
                    className="form-control"
                    value={getDoctorName(
                      selectedAppointment
                    )}
                    disabled
                  />
                </div>


                {/* DEPARTMENT */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Department
                  </label>

                  <input
                    className="form-control"
                    value={getDepartmentName(
                      selectedAppointment
                    )}
                    disabled
                  />
                </div>


                {/* DATE */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Date
                  </label>

                  {editMode ? (
                    <input
                      type="date"
                      name="appointment_date"
                      className="form-control"
                      value={
                        editData.appointment_date
                      }
                      onChange={
                        handleEditChange
                      }
                    />
                  ) : (
                    <input
                      className="form-control"
                      value={
                        selectedAppointment.appointment_date ||
                        "-"
                      }
                      disabled
                    />
                  )}

                </div>


                {/* TIME */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Time
                  </label>

                  {editMode ? (

                    <select
                      name="appointment_time"
                      className="form-select"
                      value={
                        editData.appointment_time
                      }
                      onChange={
                        handleEditChange
                      }
                    >

                      <option value="">
                        Select Time
                      </option>

                      {availableSlots.map(
                        (slot) => (
                          <option
                            key={slot}
                            value={slot}
                          >
                            {formatTime(slot)}
                          </option>
                        )
                      )}

                    </select>

                  ) : (
                    <input
                      className="form-control"
                      value={formatTime(
                        selectedAppointment.appointment_time
                      )}
                      disabled
                    />
                  )}

                </div>


                {/* TYPE */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Type
                  </label>

                  {editMode ? (

                    <select
                      name="appointment_type"
                      className="form-select"
                      value={
                        editData.appointment_type
                      }
                      onChange={
                        handleEditChange
                      }
                    >

                      <option value="WALK_IN">
                        Walk-in
                      </option>

                      <option value="PRIOR_BOOKING">
                        Prior Booking
                      </option>

                    </select>

                  ) : (
                    <input
                      className="form-control"
                      value={formatType(
                        selectedAppointment.appointment_type
                      )}
                      disabled
                    />
                  )}

                </div>


                {/* TOKEN */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Token Number
                  </label>

                  <input
                    className="form-control"
                    value={
                      selectedAppointment.token_no ||
                      "-"
                    }
                    disabled
                  />

                </div>


                {/* STATUS */}

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  {editMode ? (

                    <select
                      name="status"
                      className="form-select"
                      value={
                        editData.status
                      }
                      onChange={
                        handleEditChange
                      }
                    >

                      <option value="Scheduled">
                        Scheduled
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>

                    </select>

                  ) : (

                    <div className="pt-2">
                      <span
                        className={`badge ${getStatusClass(
                          selectedAppointment.status
                        )}`}
                      >
                        {
                          selectedAppointment.status ||
                          "-"
                        }
                      </span>
                    </div>

                  )}

                </div>

              </div>


              {/* BUTTONS */}

              <div className="d-flex justify-content-end gap-2 mt-5">

                {!editMode && (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        handleEdit(
                          selectedAppointment
                        )
                      }
                    >
                      Edit Appointment
                    </button>

                    {selectedAppointment.status !==
                      "Cancelled" && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() =>
                          handleCancel(
                            selectedAppointment
                          )
                        }
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </>
                )}


                {editMode && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEditMode(false);
                        setError("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={saving}
                      onClick={handleUpdate}
                    >
                      {saving
                        ? "Updating..."
                        : "Update Appointment"}
                    </button>
                  </>
                )}

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }


  /* ==========================================================
      LIST PAGE
  ========================================================== */

  return (
    <div
      className="min-vh-100"
      style={{ backgroundColor: "#f5f7fb" }}
    >

      {/* HEADER */}

      <nav
        className="navbar navbar-dark px-4 shadow-sm"
        style={{
          backgroundColor: "#14213d",
        }}
      >

        <span className="navbar-brand fw-bold">
          🏥 Clinical Management System
        </span>

        <span className="text-white fw-semibold">
          Appointment List
        </span>

      </nav>


      <div className="container-fluid p-4 p-md-5">


        {/* PAGE HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2 className="fw-bold mb-1">
              Appointment List
            </h2>

            <p className="text-muted mb-0">
              View and manage scheduled appointments.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onBack}
          >
            ← Back
          </button>

        </div>


        {/* MESSAGES */}

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


        {/* ====================================================
            FILTER CARD
        ==================================================== */}

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="row g-3 align-items-end">

              {/* DATE FILTER */}

              <div className="col-12 col-md-5">

                <label className="form-label fw-semibold">
                  Filter by Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* TYPE FILTER */}

              <div className="col-12 col-md-5">

                <label className="form-label fw-semibold">
                  Filter by Appointment Type
                </label>

                <select
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    All Appointment Types
                  </option>

                  <option value="WALK_IN">
                    Walk-in
                  </option>

                  <option value="PRIOR_BOOKING">
                    Prior Booking
                  </option>

                </select>

              </div>


              {/* CLEAR */}

              <div className="col-12 col-md-2">

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="card border-0 shadow-sm">

          <div className="card-body p-0">

            {loading ? (

              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                />
                <p className="text-muted mt-3 mb-0">
                  Loading appointments...
                </p>
              </div>

            ) : filteredAppointments.length ===
              0 ? (

              <div className="text-center py-5">

                <div className="fs-1 mb-3">
                  📅
                </div>

                <h5 className="fw-bold">
                  No appointments found
                </h5>

                <p className="text-muted mb-0">
                  Try changing the selected filters.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead
                    style={{
                      backgroundColor: "#f1f4f9",
                    }}
                  >

                    <tr>

                      <th className="px-4 py-3">
                        Appointment ID
                      </th>

                      <th className="py-3">
                        Patient
                      </th>

                      <th className="py-3">
                        Doctor
                      </th>

                      <th className="py-3">
                        Department
                      </th>

                      <th className="py-3">
                        Date
                      </th>

                      <th className="py-3">
                        Time
                      </th>

                      <th className="py-3">
                        Type
                      </th>

                      <th className="py-3">
                        Status
                      </th>

                      <th className="py-3 text-center">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredAppointments.map(
                      (appointment) => (

                        <tr
                          key={
                            appointment.appointment_id
                          }
                        >

                          <td className="px-4 fw-semibold">
                            #
                            {
                              appointment.appointment_id
                            }
                          </td>

                          <td>
                            {getPatientName(
                              appointment
                            )}
                          </td>

                          <td>
                            {getDoctorName(
                              appointment
                            )}
                          </td>

                          <td>
                            {getDepartmentName(
                              appointment
                            )}
                          </td>

                          <td>
                            {
                              appointment.appointment_date
                            }
                          </td>

                          <td>
                            {formatTime(
                              appointment.appointment_time
                            )}
                          </td>

                          <td>
                            {formatType(
                              appointment.appointment_type
                            )}
                          </td>

                          <td>

                            <span
                              className={`badge ${getStatusClass(
                                appointment.status
                              )}`}
                            >
                              {
                                appointment.status ||
                                "-"
                              }
                            </span>

                          </td>

                          <td>

                            <div className="d-flex justify-content-center gap-2">

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleView(
                                    appointment
                                  )
                                }
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  handleEdit(
                                    appointment
                                  )
                                }
                              >
                                Edit
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


        {/* RESULT COUNT */}

        {!loading &&
          filteredAppointments.length > 0 && (
            <div className="text-muted small mt-3">
              Showing{" "}
              <strong>
                {filteredAppointments.length}
              </strong>{" "}
              appointment
              {filteredAppointments.length !==
              1
                ? "s"
                : ""}
            </div>
          )}

      </div>

    </div>
  );
}

export default AppointmentList;