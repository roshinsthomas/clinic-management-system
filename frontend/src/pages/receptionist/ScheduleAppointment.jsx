import { useEffect, useState } from "react";

function ScheduleAppointment({ onBack }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [patientDayAppointments, setPatientDayAppointments] = useState(
    []
  );

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
  const [conflictChecking, setConflictChecking] = useState(false);

  const token = localStorage.getItem("access_token");

  /* ==========================================================
      DATE HELPERS
  ========================================================== */

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getTodayDate = () => {
    return formatDate(new Date());
  };

  const getTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    return formatDate(date);
  };

  const getMaxBookingDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);

    return formatDate(date);
  };

  /* ==========================================================
      DATE VALIDATION
  ========================================================== */

  const validateAppointmentDate = (
    dateValue,
    appointmentType
  ) => {
    if (!dateValue) {
      return "Please select an appointment date.";
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(dateValue)) {
      return "Please enter a valid appointment date.";
    }

    const [year, month, day] = dateValue
      .split("-")
      .map(Number);

    const enteredDate = new Date(
      year,
      month - 1,
      day
    );

    if (
      enteredDate.getFullYear() !== year ||
      enteredDate.getMonth() !== month - 1 ||
      enteredDate.getDate() !== day
    ) {
      return "Please enter a valid appointment date.";
    }

    const today = getTodayDate();

    /* WALK-IN */

    if (appointmentType === "WALK_IN") {
      if (dateValue !== today) {
        return "Walk-in appointments are available only for today.";
      }
    }

    /* PRIOR BOOKING */

    if (appointmentType === "PRIOR_BOOKING") {
      const tomorrow = getTomorrowDate();
      const maxDate = getMaxBookingDate();

      if (dateValue < tomorrow) {
        return "Prior Booking must be made for a future date.";
      }

      if (dateValue > maxDate) {
        return "Prior Booking can be made only within the next 2 days.";
      }
    }

    return "";
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

        fetch(
          "http://127.0.0.1:8000/api/doctors/",
          {
            method: "GET",
            headers,
          }
        ),

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
      NORMALIZE APPOINTMENT DATA
  ========================================================== */

  const isCancelledAppointment = (appointment) => {
    return (
      String(appointment.status || "")
        .toLowerCase() === "cancelled"
    );
  };

  const normalizeTime = (time) => {
    if (!time) {
      return "";
    }

    return String(time).slice(0, 5);
  };

  /* ==========================================================
      FETCH PATIENT APPOINTMENTS FOR SELECTED DATE
  ========================================================== */

  const fetchPatientDayAppointments = async (
    patientId,
    appointmentDate
  ) => {
    if (!patientId || !appointmentDate) {
      setPatientDayAppointments([]);
      return [];
    }

    try {
      setConflictChecking(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/?patient=${patientId}&appointment_date=${appointmentDate}`,
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
            "Unable to verify the patient's existing appointments."
        );
      }

      const appointments = Array.isArray(data)
        ? data
        : data.results || [];

      const activeAppointments = appointments.filter(
        (appointment) =>
          !isCancelledAppointment(appointment)
      );

      setPatientDayAppointments(
        activeAppointments
      );

      return activeAppointments;
    } catch (err) {
      setPatientDayAppointments([]);

      throw new Error(
        err.message ||
          "Unable to verify existing appointments."
      );
    } finally {
      setConflictChecking(false);
    }
  };

  /* ==========================================================
      APPOINTMENT CONFLICT VALIDATION
  ========================================================== */

  const validatePatientAppointmentConflict = ({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    appointments = patientDayAppointments,
  }) => {
    if (
      !patientId ||
      !doctorId ||
      !appointmentDate
    ) {
      return "";
    }

    const activeAppointments =
      appointments.filter(
        (appointment) =>
          !isCancelledAppointment(appointment)
      );

    /* ----------------------------------------------------------
        SAME PATIENT + SAME DOCTOR + SAME DATE
        BLOCK REGARDLESS OF TIME
    ---------------------------------------------------------- */

    const sameDoctorSameDate =
      activeAppointments.find(
        (appointment) =>
          String(appointment.doctor) ===
            String(doctorId) &&
          String(appointment.appointment_date) ===
            String(appointmentDate)
      );

    if (sameDoctorSameDate) {
      return "This patient already has an appointment with this doctor today.";
    }

    /* ----------------------------------------------------------
        SAME PATIENT + DIFFERENT DOCTOR + OVERLAPPING TIME
    ---------------------------------------------------------- */

    if (appointmentTime) {
      const selectedTime =
        normalizeTime(appointmentTime);

      const overlappingAppointment =
        activeAppointments.find(
          (appointment) => {
            const existingTime =
              normalizeTime(
                appointment.appointment_time
              );

            const sameDate =
              String(
                appointment.appointment_date
              ) === String(appointmentDate);

            const differentDoctor =
              String(appointment.doctor) !==
              String(doctorId);

            return (
              sameDate &&
              differentDoctor &&
              existingTime === selectedTime
            );
          }
        );

      if (overlappingAppointment) {
        return "This patient already has an appointment at this time.";
      }
    }

    return "";
  };

  /* ==========================================================
      VALIDATE CURRENT SELECTION
  ========================================================== */

  const validateCurrentSelection = (
    appointments = patientDayAppointments
  ) => {
    const conflict =
      validatePatientAppointmentConflict({
        patientId: formData.patient,
        doctorId: formData.doctor,
        appointmentDate:
          formData.appointment_date,
        appointmentTime:
          formData.appointment_time,
        appointments,
      });

    if (conflict) {
      setError(conflict);
      return false;
    }

    return true;
  };

  /* ==========================================================
      REAL-TIME WALK-IN SLOT FILTER
  ========================================================== */

  const filterWalkInSlotsByCurrentTime = (
    slots
  ) => {
    if (
      formData.appointment_type !==
        "WALK_IN" ||
      formData.appointment_date !==
        getTodayDate()
    ) {
      return slots;
    }

    const now = new Date();

    return slots.filter((slot) => {
      const [hours, minutes] = slot
        .split(":")
        .map(Number);

      const slotTime = new Date();

      slotTime.setHours(
        hours,
        minutes,
        0,
        0
      );

      return slotTime > now;
    });
  };

  /* ==========================================================
      FETCH AVAILABLE TIME SLOTS
  ========================================================== */

  useEffect(() => {
    if (
      formData.doctor &&
      formData.appointment_date
    ) {
      const dateError =
        validateAppointmentDate(
          formData.appointment_date,
          formData.appointment_type
        );

      if (dateError) {
        setAvailableSlots([]);

        setFormData((prev) => ({
          ...prev,
          appointment_time: "",
        }));

        setSlotsLoading(false);
        setError(dateError);

        return;
      }

      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);

      setFormData((prev) => ({
        ...prev,
        appointment_time: "",
      }));
    }
  }, [
    formData.doctor,
    formData.appointment_date,
    formData.appointment_type,
  ]);

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
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

      slots =
        filterWalkInSlotsByCurrentTime(
          slots
        );

      setAvailableSlots(slots);

      if (slots.length > 0) {
        setFormData((prev) => ({
          ...prev,
          appointment_time: slots[0],
        }));
      } else if (
        formData.appointment_type ===
        "WALK_IN"
      ) {
        setFormData((prev) => ({
          ...prev,
          appointment_time: "",
        }));

        setError(
          "Walk-in appointments are no longer available for today. Please select Prior Booking."
        );
      }
    } catch (err) {
      setAvailableSlots([]);

      setFormData((prev) => ({
        ...prev,
        appointment_time: "",
      }));

      setError(
        err.message ||
          "Failed to load available slots."
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  /* ==========================================================
      REAL-TIME REFRESH FOR WALK-IN
  ========================================================== */

  useEffect(() => {
    if (
      formData.appointment_type !==
        "WALK_IN" ||
      !formData.doctor ||
      formData.appointment_date !==
        getTodayDate()
    ) {
      return;
    }

    const interval = setInterval(() => {
      fetchAvailableSlots();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [
    formData.doctor,
    formData.appointment_date,
    formData.appointment_type,
  ]);

  /* ==========================================================
      HANDLE FORM CHANGE
  ========================================================== */

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setMessage("");

    /* ----------------------------------------------------------
        PATIENT
    ---------------------------------------------------------- */

    if (name === "patient") {
      setFormData((prev) => ({
        ...prev,
        patient: value,
      }));

      setPatientDayAppointments([]);
      setError("");

      if (
        value &&
        formData.appointment_date
      ) {
        try {
          const appointments =
            await fetchPatientDayAppointments(
              value,
              formData.appointment_date
            );

          if (
            formData.doctor &&
            formData.appointment_date
          ) {
            const conflict =
              validatePatientAppointmentConflict({
                patientId: value,
                doctorId: formData.doctor,
                appointmentDate:
                  formData.appointment_date,
                appointmentTime:
                  formData.appointment_time,
                appointments,
              });

            if (conflict) {
              setError(conflict);
            }
          }
        } catch (err) {
          setError(err.message);
        }
      }

      return;
    }

    /* ----------------------------------------------------------
        APPOINTMENT TYPE
    ---------------------------------------------------------- */

    if (name === "appointment_type") {
      if (value === "WALK_IN") {
        setFormData((prev) => ({
          ...prev,
          appointment_type: value,
          appointment_date:
            getTodayDate(),
          appointment_time: "",
        }));

        setAvailableSlots([]);
        setPatientDayAppointments([]);
        setError("");

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
        setPatientDayAppointments([]);
        setError("");

        return;
      }
    }

    /* ----------------------------------------------------------
        DEPARTMENT
    ---------------------------------------------------------- */

    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        doctor: "",
        appointment_time: "",
      }));

      setAvailableSlots([]);
      setError("");

      return;
    }

    /* ----------------------------------------------------------
        DOCTOR
    ---------------------------------------------------------- */

    if (name === "doctor") {
      setFormData((prev) => ({
        ...prev,
        doctor: value,
        appointment_time: "",
      }));

      setAvailableSlots([]);
      setError("");

      if (
        value &&
        formData.patient &&
        formData.appointment_date
      ) {
        try {
          const appointments =
            await fetchPatientDayAppointments(
              formData.patient,
              formData.appointment_date
            );

          const conflict =
            validatePatientAppointmentConflict({
              patientId:
                formData.patient,
              doctorId: value,
              appointmentDate:
                formData.appointment_date,
              appointmentTime: "",
              appointments,
            });

          if (conflict) {
            setError(conflict);
          }
        } catch (err) {
          setError(err.message);
        }
      }

      return;
    }

    /* ----------------------------------------------------------
        APPOINTMENT DATE
    ---------------------------------------------------------- */

    if (name === "appointment_date") {
      const dateError =
        validateAppointmentDate(
          value,
          formData.appointment_type
        );

      setFormData((prev) => ({
        ...prev,
        appointment_date: value,
        appointment_time: "",
      }));

      setAvailableSlots([]);
      setPatientDayAppointments([]);

      if (dateError) {
        setError(dateError);
        return;
      }

      setError("");

      /*
        Immediately check whether this patient
        already has an appointment on this date.
      */

      if (formData.patient) {
        try {
          const appointments =
            await fetchPatientDayAppointments(
              formData.patient,
              value
            );

          if (formData.doctor) {
            const conflict =
              validatePatientAppointmentConflict({
                patientId:
                  formData.patient,
                doctorId:
                  formData.doctor,
                appointmentDate: value,
                appointmentTime: "",
                appointments,
              });

            if (conflict) {
              setError(conflict);
            }
          }
        } catch (err) {
          setError(err.message);
        }
      }

      return;
    }

    /* ----------------------------------------------------------
        APPOINTMENT TIME
    ---------------------------------------------------------- */

    if (name === "appointment_time") {
      setFormData((prev) => ({
        ...prev,
        appointment_time: value,
      }));

      setError("");

      /*
        Check same patient + different doctor
        + overlapping time.
      */

      if (
        formData.patient &&
        formData.doctor &&
        formData.appointment_date &&
        value
      ) {
        const conflict =
          validatePatientAppointmentConflict({
            patientId:
              formData.patient,
            doctorId:
              formData.doctor,
            appointmentDate:
              formData.appointment_date,
            appointmentTime: value,
          });

        if (conflict) {
          setError(conflict);
        }
      }

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

      /* DATE VALIDATION */

      const dateError =
        validateAppointmentDate(
          formData.appointment_date,
          formData.appointment_type
        );

      if (dateError) {
        throw new Error(dateError);
      }

      /* --------------------------------------------------------
          FINAL PATIENT CONFLICT CHECK
      -------------------------------------------------------- */

      const latestAppointments =
        await fetchPatientDayAppointments(
          formData.patient,
          formData.appointment_date
        );

      const conflict =
        validatePatientAppointmentConflict({
          patientId: formData.patient,
          doctorId: formData.doctor,
          appointmentDate:
            formData.appointment_date,
          appointmentTime:
            formData.appointment_time,
          appointments: latestAppointments,
        });

      if (conflict) {
        throw new Error(conflict);
      }

      /* --------------------------------------------------------
          FINAL WALK-IN REAL-TIME CHECK
      -------------------------------------------------------- */

      if (
        formData.appointment_type ===
        "WALK_IN"
      ) {
        const now = new Date();

        const [hours, minutes] =
          formData.appointment_time
            .split(":")
            .map(Number);

        const selectedSlotTime =
          new Date();

        selectedSlotTime.setHours(
          hours,
          minutes,
          0,
          0
        );

        if (selectedSlotTime <= now) {
          await fetchAvailableSlots();

          throw new Error(
            "The selected appointment time has already passed. Please select another available time."
          );
        }
      }

      /* --------------------------------------------------------
          SLOT VALIDATION
      -------------------------------------------------------- */

      if (
        !availableSlots.includes(
          formData.appointment_time
        )
      ) {
        throw new Error(
          "Please select a valid available appointment time."
        );
      }

      /* --------------------------------------------------------
          SUBMIT
      -------------------------------------------------------- */

      const response = await fetch(
        "http://127.0.0.1:8000/api/receptionist/appointments/",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
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
        appointment_type:
          "WALK_IN",
        appointment_date:
          getTodayDate(),
        appointment_time: "",
        status: "Scheduled",
      });

      setPatientDayAppointments([]);
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
            <strong>Appointment Validation</strong>
            <div className="mt-1">
              {error}
            </div>
          </div>
        )}

        {/* CONFLICT CHECKING */}

        {conflictChecking && (
          <div
            className="alert alert-info"
            role="alert"
          >
            Verifying existing appointments for
            the selected patient and date...
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
                    className={`form-control ${
                      error &&
                      formData.appointment_date
                        ? "is-invalid"
                        : ""
                    }`}
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
                      availableSlots.length ===
                        0
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
                      First available slot is
                      selected automatically. You can
                      choose another available time.
                    </small>
                  )}

                  {formData.doctor &&
                    formData.appointment_date &&
                    !slotsLoading &&
                    availableSlots.length ===
                      0 &&
                    !error && (
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
                    slotsLoading ||
                    conflictChecking ||
                    !!error
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

          <strong>Appointment Validation Rules:</strong>

          <ul className="mb-0 mt-2">

            <li>
              A patient cannot have more than one
              active appointment with the same physician
              on the same date.
            </li>

            <li>
              A patient may consult a different physician
              on the same date only when appointment times
              do not overlap.
            </li>

            <li>
              A physician cannot have multiple patients
              assigned to the same appointment slot.
            </li>

            <li>
              Cancelled appointments do not reserve
              appointment slots.
            </li>

            <li>
              Walk-in appointments are available only
              for today and expired slots are removed
              automatically.
            </li>

            <li>
              Prior bookings can be scheduled for
              tomorrow and the following two days.
            </li>

            <li>
              All appointment validations are verified
              again by the server before the appointment
              is created.
            </li>

          </ul>

        </div>

      </div>
    </div>
  );
}

export default ScheduleAppointment;