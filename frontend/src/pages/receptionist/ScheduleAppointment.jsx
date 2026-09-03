import { useEffect, useState } from "react";

function ScheduleAppointment({ onBack }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [formData, setFormData] = useState({
    patient: "",
    department: "",
    doctor: "",
    appointment_type: "WALK_IN",
    appointment_date: "",
    appointment_time: "",
    status: "Scheduled",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  /* ==========================================================
      DATE HELPERS
  ========================================================== */

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getTomorrowDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getMaxBookingDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + 2);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* ==========================================================
      INITIAL DATA
  ========================================================== */

  useEffect(() => {
    fetchData();

    setFormData((prev) => ({
      ...prev,
      appointment_date: getTodayDate(),
    }));
  }, []);

  const fetchData = async () => {
    try {
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        patientsRes,
        doctorsRes,
        departmentsRes,
      ] = await Promise.all([
        fetch(
          "http://127.0.0.1:8000/api/receptionist/patients/",
          {
            method: "GET",
            headers,
          }
        ),

        // CORRECT DOCTOR ENDPOINT
        fetch(
          "http://127.0.0.1:8000/api/doctors/",
          {
            method: "GET",
            headers,
          }
        ),

        // CORRECT DEPARTMENT ENDPOINT
        fetch(
          "http://127.0.0.1:8000/api/departments/",
          {
            method: "GET",
            headers,
          }
        ),
      ]);

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const departmentsData = await departmentsRes.json();

      if (!patientsRes.ok) {
        throw new Error(
          patientsData.detail ||
            patientsData.error ||
            "Failed to fetch patients."
        );
      }

      if (!doctorsRes.ok) {
        throw new Error(
          doctorsData.detail ||
            doctorsData.error ||
            "Failed to fetch doctors."
        );
      }

      if (!departmentsRes.ok) {
        throw new Error(
          departmentsData.detail ||
            departmentsData.error ||
            "Failed to fetch departments."
        );
      }

      setPatients(
        Array.isArray(patientsData)
          ? patientsData
          : patientsData.results || []
      );

      setDoctors(
        Array.isArray(doctorsData)
          ? doctorsData
          : doctorsData.results || []
      );

      setDepartments(
        Array.isArray(departmentsData)
          ? departmentsData
          : departmentsData.results || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load appointment data."
      );
    }
  };

  /* ==========================================================
      FETCH AVAILABLE TIME SLOTS
  ========================================================== */

  useEffect(() => {
    if (
      formData.doctor &&
      formData.appointment_date
    ) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [
    formData.doctor,
    formData.appointment_date,
  ]);

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      setError("");
      setAvailableSlots([]);

      setFormData((prev) => ({
        ...prev,
        appointment_time: "",
      }));

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/available-slots/?doctor=${formData.doctor}&date=${formData.appointment_date}`,
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
          data.detail ||
            data.error ||
            "Failed to fetch available appointment slots."
        );
      }

      let slots = [];

      if (Array.isArray(data)) {
        slots = data;
      } else if (Array.isArray(data.slots)) {
        slots = data.slots;
      } else if (
        Array.isArray(data.available_slots)
      ) {
        slots = data.available_slots;
      }

      setAvailableSlots(slots);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load available slots."
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  /* ==========================================================
      HANDLE FORM CHANGE
  ========================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMessage("");
    setError("");

    // Appointment type
    if (name === "appointment_type") {
      if (value === "WALK_IN") {
        setFormData((prev) => ({
          ...prev,
          appointment_type: value,
          appointment_date: getTodayDate(),
          appointment_time: "",
        }));

        setAvailableSlots([]);

        return;
      }

      if (value === "PRIOR_BOOKING") {
        setFormData((prev) => ({
          ...prev,
          appointment_type: value,
          appointment_date: "",
          appointment_time: "",
        }));

        setAvailableSlots([]);

        return;
      }
    }

    // Department
    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        doctor: "",
        appointment_time: "",
      }));

      setAvailableSlots([]);

      return;
    }

    // Doctor
    if (name === "doctor") {
      setFormData((prev) => ({
        ...prev,
        doctor: value,
        appointment_time: "",
      }));

      return;
    }

    // Appointment date
    if (name === "appointment_date") {
      setFormData((prev) => ({
        ...prev,
        appointment_date: value,
        appointment_time: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ==========================================================
      SUBMIT APPOINTMENT
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (!formData.patient) {
        throw new Error(
          "Please select a patient."
        );
      }

      if (!formData.department) {
        throw new Error(
          "Please select a department."
        );
      }

      if (!formData.doctor) {
        throw new Error(
          "Please select a doctor."
        );
      }

      if (!formData.appointment_date) {
        throw new Error(
          "Please select an appointment date."
        );
      }

      if (!formData.appointment_time) {
        throw new Error(
          "Please select an available appointment time."
        );
      }

      const today = getTodayDate();

      // Walk-in = today only
      if (
        formData.appointment_type ===
          "WALK_IN" &&
        formData.appointment_date !== today
      ) {
        throw new Error(
          "Walk-in appointments can only be scheduled for today."
        );
      }

      // Prior booking = tomorrow or next day
      if (
        formData.appointment_type ===
        "PRIOR_BOOKING"
      ) {
        const tomorrow = getTomorrowDate();
        const maxDate = getMaxBookingDate();

        if (
          formData.appointment_date <
            tomorrow ||
          formData.appointment_date >
            maxDate
        ) {
          throw new Error(
            "Prior booking is available only for tomorrow and the next 2 days."
          );
        }
      }

      // Validate selected slot
      if (
        !availableSlots.includes(
          formData.appointment_time
        )
      ) {
        throw new Error(
          "Please select a valid available appointment time."
        );
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/receptionist/appointments/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patient: Number(
              formData.patient
            ),
            department: Number(
              formData.department
            ),
            doctor: Number(
              formData.doctor
            ),
            appointment_type:
              formData.appointment_type,
            appointment_date:
              formData.appointment_date,
            appointment_time:
              formData.appointment_time,
            status: "Scheduled",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          data &&
          typeof data === "object"
        ) {
          const backendErrors =
            Object.entries(data)
              .map(
                ([field, messages]) => {
                  const text =
                    Array.isArray(messages)
                      ? messages.join(", ")
                      : messages;

                  return `${field}: ${text}`;
                }
              )
              .join(" | ");

          throw new Error(
            backendErrors ||
              "Failed to schedule appointment."
          );
        }

        throw new Error(
          "Failed to schedule appointment."
        );
      }

      setMessage(
        "Appointment scheduled successfully."
      );

      setFormData({
        patient: "",
        department: "",
        doctor: "",
        appointment_type: "WALK_IN",
        appointment_date: getTodayDate(),
        appointment_time: "",
        status: "Scheduled",
      });

      setAvailableSlots([]);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
      ACTIVE DATA
  ========================================================== */

  const activePatients =
    patients.filter(
      (patient) =>
        patient.status === "Active"
    );

  const activeDoctors =
    doctors.filter(
      (doctor) =>
        doctor.status === true ||
        doctor.status === "Active"
    );

  const filteredDoctors =
    formData.department
      ? activeDoctors.filter(
          (doctor) =>
            String(
              doctor.department
            ) ===
              String(
                formData.department
              ) ||
            String(
              doctor.department_id
            ) ===
              String(
                formData.department
              )
        )
      : activeDoctors;

  /* ==========================================================
      TIME DISPLAY
  ========================================================== */

  const formatSlot = (time) => {
    if (!time) {
      return "";
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

  /* ==========================================================
      UI
  ========================================================== */

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">

      {/* HEADER */}

      <nav
        className="navbar navbar-dark px-3 px-md-4 shadow-sm"
        style={{
          backgroundColor: "#14213d",
        }}
      >
        <div className="container-fluid">

          <span className="navbar-brand fw-bold">
            🏥 Clinical Management System
          </span>

          <span className="text-white fw-semibold">
            Schedule Appointment
          </span>

        </div>
      </nav>

      {/* MAIN CONTENT */}

      <div className="container py-4">

        {/* PAGE HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2 className="fw-bold mb-1">
              Schedule Appointment
            </h2>

            <p className="text-muted mb-0">
              Schedule a new patient appointment.
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
          <div
            className="alert alert-success"
            role="alert"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* FORM CARD */}

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 p-md-5">

            <form onSubmit={handleSubmit}>

              <div className="row g-4">

                {/* PATIENT */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Patient{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="patient"
                    value={
                      formData.patient
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="">
                      Select Patient
                    </option>

                    {activePatients.map(
                      (patient) => (
                        <option
                          key={
                            patient.patient_id
                          }
                          value={
                            patient.patient_id
                          }
                        >
                          {patient.patient_id} -{" "}
                          {
                            patient.first_name
                          }{" "}
                          {
                            patient.last_name
                          }
                        </option>
                      )
                    )}
                  </select>

                  {activePatients.length ===
                    0 && (
                    <small className="text-danger">
                      No active patients available.
                    </small>
                  )}

                </div>

                {/* DEPARTMENT */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Department{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="department"
                    value={
                      formData.department
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={
                            department.department_id
                          }
                          value={
                            department.department_id
                          }
                        >
                          {department.name ||
                            department.department_name}
                        </option>
                      )
                    )}
                  </select>

                  {departments.length ===
                    0 && (
                    <small className="text-danger">
                      No departments available.
                    </small>
                  )}

                </div>

                {/* DOCTOR */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Doctor{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="doctor"
                    value={
                      formData.doctor
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      !formData.department
                    }
                  >
                    <option value="">
                      {formData.department
                        ? "Select Doctor"
                        : "Select Department First"}
                    </option>

                    {filteredDoctors.map(
                      (doctor) => (
                        <option
                          key={
                            doctor.staff_id
                          }
                          value={
                            doctor.staff_id
                          }
                        >
                          Dr.{" "}
                          {
                            doctor.first_name
                          }{" "}
                          {
                            doctor.last_name
                          }
                        </option>
                      )
                    )}
                  </select>

                  {formData.department &&
                    filteredDoctors.length ===
                      0 && (
                    <small className="text-danger">
                      No active doctors available
                      for this department.
                    </small>
                  )}

                </div>

                {/* APPOINTMENT TYPE */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Type{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="appointment_type"
                    value={
                      formData.appointment_type
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="WALK_IN">
                      Walk-in
                    </option>

                    <option value="PRIOR_BOOKING">
                      Prior Booking
                    </option>
                  </select>

                </div>

                {/* APPOINTMENT DATE */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Date{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    name="appointment_date"
                    value={
                      formData.appointment_date
                    }
                    onChange={
                      handleChange
                    }
                    min={
                      formData.appointment_type ===
                      "WALK_IN"
                        ? getTodayDate()
                        : getTomorrowDate()
                    }
                    max={
                      formData.appointment_type ===
                      "WALK_IN"
                        ? getTodayDate()
                        : getMaxBookingDate()
                    }
                    disabled={
                      formData.appointment_type ===
                      "WALK_IN"
                    }
                    required
                  />

                  {formData.appointment_type ===
                    "WALK_IN" && (
                    <small className="text-muted">
                      Walk-in appointments are
                      automatically scheduled for today.
                    </small>
                  )}

                  {formData.appointment_type ===
                    "PRIOR_BOOKING" && (
                    <small className="text-muted">
                      Prior booking is available
                      for tomorrow and the next 2 days.
                    </small>
                  )}

                </div>

                {/* AVAILABLE TIME */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Available Appointment Time{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <select
                    className="form-select"
                    name="appointment_time"
                    value={
                      formData.appointment_time
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      !formData.doctor ||
                      !formData.appointment_date ||
                      slotsLoading ||
                      availableSlots.length === 0
                    }
                  >
                    <option value="">
                      {slotsLoading
                        ? "Loading available slots..."
                        : !formData.doctor
                        ? "Select Doctor First"
                        : !formData.appointment_date
                        ? "Select Date First"
                        : availableSlots.length ===
                          0
                        ? "No Available Slots"
                        : "Select Available Time"}
                    </option>

                    {availableSlots.map(
                      (slot) => (
                        <option
                          key={slot}
                          value={slot}
                        >
                          {formatSlot(slot)}
                        </option>
                      )
                    )}
                  </select>

                  {formData.doctor &&
                    formData.appointment_date &&
                    !slotsLoading &&
                    availableSlots.length >
                      0 && (
                    <small className="text-muted">
                      Only available appointment
                      slots are shown.
                    </small>
                  )}

                  {formData.doctor &&
                    formData.appointment_date &&
                    !slotsLoading &&
                    availableSlots.length ===
                      0 && (
                    <small className="text-danger">
                      No appointment slots are
                      available for the selected
                      doctor and date.
                    </small>
                  )}

                </div>

                {/* STATUS */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value="Scheduled"
                    disabled
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="d-flex justify-content-end gap-2 mt-5">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onBack}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    loading ||
                    slotsLoading
                  }
                >
                  {loading
                    ? "Scheduling..."
                    : "Schedule Appointment"}
                </button>

              </div>

            </form>

          </div>

        </div>

        {/* INFORMATION CARD */}

        <div className="alert alert-info mt-4">

          <strong>Appointment Rules:</strong>

          <ul className="mb-0 mt-2">

            <li>
              Walk-in appointments are available
              only for today.
            </li>

            <li>
              Prior bookings can be scheduled
              for tomorrow or the next 2 days.
            </li>

            <li>
              Only available doctor time slots
              are displayed.
            </li>

            <li>
              Each appointment slot is
              15 minutes.
            </li>

            <li>
              Already booked or break-time slots
              are automatically excluded.
            </li>

          </ul>

        </div>

      </div>
    </div>
  );
}

export default ScheduleAppointment;