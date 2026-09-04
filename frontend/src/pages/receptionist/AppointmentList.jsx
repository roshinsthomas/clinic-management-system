import { useEffect, useState } from "react";

function AppointmentList({ onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [appointmentIdFilter, setAppointmentIdFilter] =
    useState("");

  /*
    CURRENT_UPCOMING
    HISTORY
    ALL
  */
  const [viewMode, setViewMode] =
    useState("CURRENT_UPCOMING");

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
      DATE HELPERS
  ========================================================== */

  const getTodayDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isPastAppointment = (appointment) => {
    if (!appointment?.appointment_date) {
      return false;
    }

    return (
      appointment.appointment_date <
      getTodayDate()
    );
  };

  const isCurrentOrUpcoming = (appointment) => {
    if (!appointment?.appointment_date) {
      return false;
    }

    return (
      appointment.appointment_date >=
      getTodayDate()
    );
  };

  /* ==========================================================
      STATUS HELPERS
  ========================================================== */

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    switch (value) {
      case "scheduled":
        return "Scheduled";

      case "in consultation":
        return "In Consultation";

      case "completed":
        return "Completed";

      case "missed":
        return "Missed";

      case "consultation not completed":
        return "Missed";

      case "cancelled":
      case "canceled":
        return "Cancelled";

      default:
        return status || "";
    }
  };

  const isScheduled = (appointment) => {
    return (
      normalizeStatus(
        appointment?.status
      ) === "Scheduled"
    );
  };

  const isInConsultation = (appointment) => {
    return (
      normalizeStatus(
        appointment?.status
      ) === "In Consultation"
    );
  };

  const isCompleted = (appointment) => {
    return (
      normalizeStatus(
        appointment?.status
      ) === "Completed"
    );
  };

  const isMissed = (appointment) => {
    return (
      normalizeStatus(
        appointment?.status
      ) === "Missed"
    );
  };

  const isCancelled = (appointment) => {
    return (
      normalizeStatus(
        appointment?.status
      ) === "Cancelled"
    );
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
            data.error ||
            "Failed to load appointments."
        );
      }

      const list = Array.isArray(data)
        ? data
        : data.results || [];

      setAppointments(list);

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
      FILTER APPOINTMENTS
  ========================================================== */

  useEffect(() => {
    let result = [...appointments];

    /*
      VIEW MODE
    */

    if (viewMode === "CURRENT_UPCOMING") {
      result = result.filter(
        (appointment) =>
          isCurrentOrUpcoming(appointment)
      );
    }

    if (viewMode === "HISTORY") {
      result = result.filter(
        (appointment) =>
          isPastAppointment(appointment)
      );
    }

    /*
      DATE FILTER
    */

    if (dateFilter) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_date ===
          dateFilter
      );
    }

    /*
      APPOINTMENT TYPE
    */

    if (typeFilter) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_type ===
          typeFilter
      );
    }

    /*
      APPOINTMENT ID
    */

    if (appointmentIdFilter) {
      result = result.filter(
        (appointment) =>
          String(
            appointment.appointment_id
          ).includes(
            appointmentIdFilter.trim()
          )
      );
    }

    /*
      Sort by date and time
    */

    result.sort((a, b) => {
      const dateTimeA = `${a.appointment_date || ""} ${
        a.appointment_time || ""
      }`;

      const dateTimeB = `${b.appointment_date || ""} ${
        b.appointment_time || ""
      }`;

      return dateTimeA.localeCompare(
        dateTimeB
      );
    });

    setFilteredAppointments(result);

  }, [
    appointments,
    viewMode,
    dateFilter,
    typeFilter,
    appointmentIdFilter,
  ]);

  /* ==========================================================
      CLEAR FILTERS
  ========================================================== */

  const clearFilters = () => {
    setDateFilter("");
    setTypeFilter("");
    setAppointmentIdFilter("");
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
    const status = normalizeStatus(
      appointment?.status
    );

    /*
      Only Scheduled appointments can be edited.
    */

    if (status !== "Scheduled") {
      setSelectedAppointment(appointment);
      setEditMode(false);

      if (status === "Completed") {
        setError(
          "Completed appointments cannot be edited."
        );
      } else if (status === "Missed") {
        setError(
          "Missed appointments cannot be edited. Create a new appointment if rescheduling is required."
        );
      } else if (status === "In Consultation") {
        setError(
          "Appointments in consultation cannot be edited."
        );
      } else if (status === "Cancelled") {
        setError(
          "Cancelled appointments cannot be edited."
        );
      }

      setMessage("");
      return;
    }

    /*
      Prevent editing past appointments.
    */

    if (isPastAppointment(appointment)) {
      setSelectedAppointment(appointment);
      setEditMode(false);
      setError(
        "Past appointments are view-only and cannot be edited."
      );
      setMessage("");
      return;
    }

    setSelectedAppointment(appointment);

    setEditData({
      appointment_date:
        appointment.appointment_date || "",

      appointment_time:
        appointment.appointment_time
          ? appointment.appointment_time.slice(
              0,
              5
            )
          : "",

      appointment_type:
        appointment.appointment_type || "",

      status: "Scheduled",
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

      let slots = Array.isArray(data)
        ? [...data]
        : [
            ...(data.slots ||
              data.available_slots ||
              []),
          ];

      /*
        Keep the currently selected appointment
        time available while editing.
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

      const currentStatus =
        normalizeStatus(
          selectedAppointment?.status
        );

      /*
        Only Scheduled appointments can be edited.
      */

      if (currentStatus !== "Scheduled") {
        throw new Error(
          "Only scheduled appointments can be edited."
        );
      }

      /*
        Extra protection against editing
        a past appointment.
      */

      if (
        isPastAppointment(
          selectedAppointment
        )
      ) {
        throw new Error(
          "Past appointments are view-only and cannot be edited."
        );
      }

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

      /*
        Status remains Scheduled.
        Receptionist cannot change an appointment
        to In Consultation, Completed or Missed.
      */

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

            status: "Scheduled",
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
    const status = normalizeStatus(
      appointment?.status
    );

    /*
      Only Scheduled appointments can be cancelled.
    */

    if (status !== "Scheduled") {
      setSelectedAppointment(appointment);
      setEditMode(false);

      if (status === "Completed") {
        setError(
          "Completed appointments cannot be cancelled."
        );
      } else if (status === "Missed") {
        setError(
          "Missed appointments cannot be cancelled."
        );
      } else if (status === "In Consultation") {
        setError(
          "Appointments in consultation cannot be cancelled."
        );
      } else if (status === "Cancelled") {
        setError(
          "This appointment is already cancelled."
        );
      }

      setMessage("");
      return;
    }

    /*
      Past appointments should not be cancelled.
    */

    if (isPastAppointment(appointment)) {
      setSelectedAppointment(appointment);
      setEditMode(false);
      setError(
        "Past appointments are view-only and cannot be cancelled."
      );
      setMessage("");
      return;
    }

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
            data.error ||
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
      RESCHEDULE MISSED APPOINTMENT
  ========================================================== */

  const handleReschedule = (appointment) => {
    /*
      Do not modify the missed appointment.
      Receptionist will create a new appointment.
    */

    setSelectedAppointment(null);
    setEditMode(false);
    setMessage("");
    setError("");

    /*
      The parent navigation is intentionally not called here
      because this component does not receive a direct
      Schedule Appointment navigation callback.

      The user can return to Appointment Management and
      choose Schedule Appointment to create a new appointment.
    */
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

    return (
      appointment.patient_name ||
      appointment.patient ||
      "-"
    );
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

    return (
      appointment.doctor_name ||
      appointment.doctor ||
      "-"
    );
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

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const [
      year,
      month,
      day,
    ] = dateValue.split("-");

    return `${day}-${month}-${year}`;
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
    switch (
      normalizeStatus(status)
    ) {
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
    const pastAppointment =
      isPastAppointment(
        selectedAppointment
      );

    const status =
      normalizeStatus(
        selectedAppointment.status
      );

    const canEdit =
      !pastAppointment &&
      status === "Scheduled";

    const canCancel =
      !pastAppointment &&
      status === "Scheduled";

    const canReschedule =
      status === "Missed";

    return (
      <div
        className="min-vh-100"
        style={{
          backgroundColor: "#f5f7fb",
        }}
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
            Appointment Details
          </span>
        </nav>

        <div className="container py-4">

          {/* PAGE HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>
              <h2 className="fw-bold mb-1">
                {editMode
                  ? "Edit Appointment"
                  : "Appointment Details"}
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

          {/* PAST APPOINTMENT NOTICE */}

          {pastAppointment &&
            !error && (
              <div className="alert alert-secondary">
                <strong>Appointment History:</strong>{" "}
                This appointment date has passed.
                Historical appointments are
                view-only.
              </div>
            )}

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

          {/* DETAILS CARD */}

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
                      min={getTodayDate()}
                      onChange={
                        handleEditChange
                      }
                    />
                  ) : (
                    <input
                      className="form-control"
                      value={formatDate(
                        selectedAppointment.appointment_date
                      )}
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

                    <input
                      type="text"
                      className="form-control"
                      value="Scheduled"
                      disabled
                    />

                  ) : (

                    <div className="pt-2">

                      <span
                        className={`badge ${getStatusClass(
                          selectedAppointment.status
                        )}`}
                      >
                        {
                          normalizeStatus(
                            selectedAppointment.status
                          ) || "-"
                        }
                      </span>

                    </div>

                  )}

                </div>

              </div>

              {/* STATUS INFORMATION */}

              {!editMode &&
                status ===
                  "In Consultation" && (
                  <div className="alert alert-warning mt-4 mb-0">
                    <strong>In Consultation:</strong>{" "}
                    The doctor is currently attending
                    this patient. Receptionist editing
                    and cancellation are disabled.
                  </div>
                )}

              {!editMode &&
                status ===
                  "Completed" && (
                  <div className="alert alert-success mt-4 mb-0">
                    <strong>Completed:</strong>{" "}
                    The consultation has been completed.
                    This appointment is view-only.
                  </div>
                )}

              {!editMode &&
                status === "Missed" && (
                  <div className="alert alert-secondary mt-4 mb-0">
                    <strong>Missed / Not Completed:</strong>{" "}
                    The consultation did not take place.
                    If required, the receptionist can
                    create a new appointment.
                  </div>
                )}

              {!editMode &&
                status === "Cancelled" && (
                  <div className="alert alert-danger mt-4 mb-0">
                    <strong>Cancelled:</strong>{" "}
                    This appointment has been cancelled.
                    It is view-only.
                  </div>
                )}

              {/* BUTTONS */}

              <div className="d-flex justify-content-end gap-2 mt-5">

                {!editMode && (
                  <>

                    {canEdit && (
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
                    )}

                    {canCancel && (
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

                    {canReschedule && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={
                          handleReschedule
                        }
                      >
                        Schedule New Appointment
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
                      onClick={
                        handleUpdate
                      }
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

  const currentCount =
    appointments.filter(
      (appointment) =>
        isCurrentOrUpcoming(appointment)
    ).length;

  const historyCount =
    appointments.filter(
      (appointment) =>
        isPastAppointment(appointment)
    ).length;

  const pageTitle =
    viewMode === "CURRENT_UPCOMING"
      ? "Current & Upcoming Appointments"
      : viewMode === "HISTORY"
      ? "Appointment History"
      : "All Appointments";

  const pageDescription =
    viewMode === "CURRENT_UPCOMING"
      ? "View and manage today's and upcoming patient appointments."
      : viewMode === "HISTORY"
      ? "View previous appointments and historical records."
      : "View all current, upcoming and historical appointments.";

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#f5f7fb",
      }}
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
          Appointment Management
        </span>

      </nav>

      <div className="container-fluid p-4 p-md-5">

        {/* PAGE HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              {pageTitle}
            </h2>

            <p className="text-muted mb-0">
              {pageDescription}
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
            APPOINTMENT OVERVIEW
        ==================================================== */}

        <div className="row g-3 mb-4">

          <div className="col-12 col-md-4">

            <div
              className={`card border-0 shadow-sm h-100 ${
                viewMode === "CURRENT_UPCOMING"
                  ? "border-start border-primary border-4"
                  : ""
              }`}
              role="button"
              onClick={() =>
                setViewMode(
                  "CURRENT_UPCOMING"
                )
              }
            >

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <small className="text-muted">
                      CURRENT & UPCOMING
                    </small>

                    <h3 className="fw-bold mb-0 mt-1">
                      {currentCount}
                    </h3>
                  </div>

                  <div className="fs-2">
                    📅
                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="col-12 col-md-4">

            <div
              className={`card border-0 shadow-sm h-100 ${
                viewMode === "HISTORY"
                  ? "border-start border-secondary border-4"
                  : ""
              }`}
              role="button"
              onClick={() =>
                setViewMode("HISTORY")
              }
            >

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <small className="text-muted">
                      APPOINTMENT HISTORY
                    </small>

                    <h3 className="fw-bold mb-0 mt-1">
                      {historyCount}
                    </h3>
                  </div>

                  <div className="fs-2">
                    📋
                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="col-12 col-md-4">

            <div
              className={`card border-0 shadow-sm h-100 ${
                viewMode === "ALL"
                  ? "border-start border-dark border-4"
                  : ""
              }`}
              role="button"
              onClick={() =>
                setViewMode("ALL")
              }
            >

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <small className="text-muted">
                      ALL APPOINTMENTS
                    </small>

                    <h3 className="fw-bold mb-0 mt-1">
                      {appointments.length}
                    </h3>
                  </div>

                  <div className="fs-2">
                    🏥
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            FILTER CARD
        ==================================================== */}

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">

            <div className="row g-3 align-items-end">

              {/* VIEW */}

              <div className="col-12 col-md-3">

                <label className="form-label fw-semibold">
                  Appointment View
                </label>

                <select
                  className="form-select"
                  value={viewMode}
                  onChange={(e) =>
                    setViewMode(
                      e.target.value
                    )
                  }
                >

                  <option value="CURRENT_UPCOMING">
                    Current & Upcoming
                  </option>

                  <option value="HISTORY">
                    Appointment History
                  </option>

                  <option value="ALL">
                    All Appointments
                  </option>

                </select>

              </div>

              {/* DATE */}

              <div className="col-12 col-md-3">

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

              {/* TYPE */}

              <div className="col-12 col-md-3">

                <label className="form-label fw-semibold">
                  Appointment Type
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

              {/* ID */}

              <div className="col-12 col-md-3">

                <label className="form-label fw-semibold">
                  Appointment ID
                </label>

                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="Enter appointment ID"
                  value={
                    appointmentIdFilter
                  }
                  onChange={(e) =>
                    setAppointmentIdFilter(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* CLEAR */}

              <div className="col-12">

                <div className="d-flex justify-content-end">

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear Filters
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            HISTORY INFORMATION
        ==================================================== */}

        {viewMode === "HISTORY" && (
          <div className="alert alert-secondary">

            <strong>Appointment History:</strong>{" "}
            Previous appointments are retained for
            reference and record keeping. Historical
            appointments are view-only.

          </div>
        )}

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
                  Try changing the selected
                  view or filters.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead
                    style={{
                      backgroundColor:
                        "#f1f4f9",
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
                      (appointment) => {

                        const past =
                          isPastAppointment(
                            appointment
                          );

                        const status =
                          normalizeStatus(
                            appointment.status
                          );

                        const canEdit =
                          !past &&
                          status ===
                            "Scheduled";

                        const canCancel =
                          !past &&
                          status ===
                            "Scheduled";

                        const canReschedule =
                          status ===
                          "Missed";

                        return (
                          <tr
                            key={
                              appointment.appointment_id
                            }
                            className={
                              past
                                ? "table-light"
                                : ""
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

                              {formatDate(
                                appointment.appointment_date
                              )}

                              {past && (
                                <span className="badge bg-secondary ms-2">
                                  Past
                                </span>
                              )}

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
                                  status ||
                                  "-"
                                }
                              </span>

                            </td>

                            <td>

                              <div className="d-flex justify-content-center gap-2">

                                {/* VIEW */}

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

                                {/* EDIT */}

                                {canEdit && (
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
                                )}

                                {/* CANCEL */}

                                {canCancel && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      handleCancel(
                                        appointment
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>
                                )}

                                {/* RESCHEDULE MISSED */}

                                {canReschedule && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      handleView(
                                        appointment
                                      )
                                    }
                                  >
                                    Reschedule
                                  </button>
                                )}

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

        {/* RESULT COUNT */}

        {!loading &&
          filteredAppointments.length >
            0 && (

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

            {viewMode ===
              "CURRENT_UPCOMING" && (
              <span>
                {" "}
                — current & upcoming
              </span>
            )}

            {viewMode === "HISTORY" && (
              <span>
                {" "}
                — appointment history
              </span>
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default AppointmentList;