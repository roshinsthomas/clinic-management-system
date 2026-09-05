import { useEffect, useState } from "react";

function ScheduleAppointment({
  onBack,
  initialPatientId,
  onAppointmentScheduled,
}) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState("");

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

  const token = localStorage.getItem("access_token");

  // =========================================================
  // GET TODAY'S DATE
  // =========================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // DAY AFTER TOMORROW
  // =========================================================

  const getDayAfterTomorrowDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + 2);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // MAXIMUM PRIOR BOOKING DATE
  // =========================================================

  const getMaxBookingDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + 30);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // LOAD PATIENTS, DOCTORS AND DEPARTMENTS
  // =========================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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
            headers,
          }
        ),

        fetch(
          "http://127.0.0.1:8000/api/doctors/",
          {
            headers,
          }
        ),

        fetch(
          "http://127.0.0.1:8000/api/departments/",
          {
            headers,
          }
        ),
      ]);

      if (!patientsRes.ok) {
        throw new Error("Failed to fetch patients.");
      }

      if (!doctorsRes.ok) {
        throw new Error("Failed to fetch doctors.");
      }

      if (!departmentsRes.ok) {
        throw new Error("Failed to fetch departments.");
      }

      const patientsData =
        await patientsRes.json();

      const doctorsData =
        await doctorsRes.json();

      const departmentsData =
        await departmentsRes.json();

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
          "Failed to load data."
      );
    }
  };

  // =========================================================
  // AUTOMATICALLY SELECT PATIENT
  // =========================================================

  useEffect(() => {
    if (
      initialPatientId &&
      patients.length > 0
    ) {
      const patientExists =
        patients.some(
          (patient) =>
            String(
              patient.patient_id
            ) ===
            String(initialPatientId)
        );

      if (patientExists) {
        setFormData((previous) => ({
          ...previous,
          patient:
            String(initialPatientId),
        }));
      }
    }
  }, [
    initialPatientId,
    patients,
  ]);

  // =========================================================
  // WALK-IN DEFAULT DATE = TODAY
  // =========================================================

  useEffect(() => {
    if (
      formData.appointment_type ===
        "WALK_IN" &&
      !formData.appointment_date
    ) {
      setFormData((previous) => ({
        ...previous,
        appointment_date:
          getTodayDate(),
      }));
    }
  }, [
    formData.appointment_type,
    formData.appointment_date,
  ]);

  // =========================================================
  // FETCH APPOINTMENTS FOR A PARTICULAR DAY
  // =========================================================

  const fetchDayAppointments = async (
    appointmentDate
  ) => {
    if (!appointmentDate) {
      return [];
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/?appointment_date=${appointmentDate}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data =
        await response.json();

      return Array.isArray(data)
        ? data
        : data.results || [];
    } catch (err) {
      return [];
    }
  };

  // =========================================================
  // CHECK CANCELLED APPOINTMENT
  // =========================================================

  const isCancelledAppointment = (
    appointment
  ) => {
    const status =
      String(
        appointment.status || ""
      ).toLowerCase();

    return (
      status === "cancelled" ||
      status === "canceled"
    );
  };

  // =========================================================
  // TIME -> MINUTES
  // =========================================================

  const timeToMinutes = (time) => {
    if (!time) {
      return null;
    }

    const parts =
      String(time).split(":");

    if (parts.length < 2) {
      return null;
    }

    const hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return null;
    }

    return (
      hours * 60 + minutes
    );
  };

  // =========================================================
  // MINUTES -> 12 HOUR DISPLAY
  // =========================================================

  const formatTime12Hour = (
    time
  ) => {
    const totalMinutes =
      timeToMinutes(time);

    if (
      totalMinutes === null
    ) {
      return time;
    }

    const hours24 =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    const period =
      hours24 >= 12
        ? "PM"
        : "AM";

    let hours12 =
      hours24 % 12;

    if (hours12 === 0) {
      hours12 = 12;
    }

    return `${hours12}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )} ${period}`;
  };

  // =========================================================
  // NORMALIZE TIME
  // =========================================================

  const normalizeTime = (
    time
  ) => {
    if (!time) {
      return "";
    }

    const parts =
      String(time).split(":");

    if (parts.length < 2) {
      return "";
    }

    const hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return "";
    }

    return `${String(
      hours
    ).padStart(
      2,
      "0"
    )}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}`;
  };

  // =========================================================
  // CHECK 15-MINUTE OVERLAP
  // =========================================================

  const isTimeOverlapping = (
    time1,
    time2
  ) => {
    const start1 =
      timeToMinutes(time1);

    const start2 =
      timeToMinutes(time2);

    if (
      start1 === null ||
      start2 === null
    ) {
      return false;
    }

    const end1 =
      start1 + 15;

    const end2 =
      start2 + 15;

    return (
      start1 < end2 &&
      start2 < end1
    );
  };

  // =========================================================
  // GET APPOINTMENT PATIENT ID
  // =========================================================

  const getAppointmentPatientId = (
    appointment
  ) => {
    if (
      appointment.patient &&
      typeof appointment.patient ===
        "object"
    ) {
      return (
        appointment.patient
          .patient_id ??
        appointment.patient.id ??
        ""
      );
    }

    return appointment.patient;
  };

  // =========================================================
  // GET APPOINTMENT DOCTOR ID
  // =========================================================

  const getAppointmentDoctorId = (
    appointment
  ) => {
    if (
      appointment.doctor &&
      typeof appointment.doctor ===
        "object"
    ) {
      return (
        appointment.doctor
          .staff_id ??
        appointment.doctor.id ??
        ""
      );
    }

    return appointment.doctor;
  };

  // =========================================================
  // VALIDATE APPOINTMENT CONFLICT
  // =========================================================

  const validateAppointmentConflict =
    async (
      currentFormData = formData
    ) => {
      if (
        !currentFormData.patient ||
        !currentFormData.doctor ||
        !currentFormData.appointment_date ||
        !currentFormData.appointment_time
      ) {
        return "";
      }

      const appointments =
        await fetchDayAppointments(
          currentFormData
            .appointment_date
        );

      const activeAppointments =
        appointments.filter(
          (appointment) =>
            !isCancelledAppointment(
              appointment
            )
        );

      const selectedPatient =
        String(
          currentFormData.patient
        );

      const selectedDoctor =
        String(
          currentFormData.doctor
        );

      const selectedTime =
        normalizeTime(
          currentFormData
            .appointment_time
        );

      for (
        const appointment of
        activeAppointments
      ) {
        const appointmentPatient =
          String(
            getAppointmentPatientId(
              appointment
            )
          );

        const appointmentDoctor =
          String(
            getAppointmentDoctorId(
              appointment
            )
          );

        const appointmentTime =
          normalizeTime(
            appointment
              .appointment_time
          );

        // =====================================================
        // RULE 1
        // Same patient + same doctor + same day
        // =====================================================

        if (
          appointmentPatient ===
            selectedPatient &&
          appointmentDoctor ===
            selectedDoctor
        ) {
          return (
            "This patient already has an appointment with this doctor today."
          );
        }

        // =====================================================
        // RULE 2
        // Same patient + different doctor +
        // overlapping time
        // =====================================================

        if (
          appointmentPatient ===
            selectedPatient &&
          appointmentDoctor !==
            selectedDoctor &&
          isTimeOverlapping(
            appointmentTime,
            selectedTime
          )
        ) {
          return (
            "This patient already has an appointment at this time."
          );
        }

        // =====================================================
        // RULE 3
        // Same doctor + same time +
        // different patient
        // =====================================================

        if (
          appointmentDoctor ===
            selectedDoctor &&
          appointmentPatient !==
            selectedPatient &&
          appointmentTime ===
            selectedTime
        ) {
          return (
            "This time slot is already booked."
          );
        }
      }

      return "";
    };

  // =========================================================
  // FETCH AVAILABLE SLOTS
  // =========================================================

  const fetchAvailableSlots = async (
    doctorId,
    appointmentDate,
    appointmentType
  ) => {
    if (
      !doctorId ||
      !appointmentDate
    ) {
      setAvailableSlots([]);
      setSlotsMessage("");
      return;
    }

    setSlotsLoading(true);
    setSlotsMessage("");
    setAvailableSlots([]);

    try {
      // -------------------------------------------------------
      // ASK BACKEND FOR AVAILABLE SLOTS
      // -------------------------------------------------------

      const url =
        `http://127.0.0.1:8000/api/receptionist/appointments/available-slots/?doctor=${encodeURIComponent(
          doctorId
        )}&date=${encodeURIComponent(
          appointmentDate
        )}`;

      const response =
        await fetch(
          url,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              Accept:
                "application/json",
            },
          }
        );

      if (!response.ok) {
        let errorText =
          "Failed to fetch available appointment slots.";

        try {
          const errorData =
            await response.json();

          if (
            errorData.detail
          ) {
            errorText =
              errorData.detail;
          }
        } catch (err) {
          // Keep default message
        }

        throw new Error(
          errorText
        );
      }

      const data =
        await response.json();

      console.log(
        "Available slots response:",
        data
      );

      // -------------------------------------------------------
      // BACKEND RETURNS:
      // ["09:00", "09:15", ...]
      //
      // Also support objects just in case.
      // -------------------------------------------------------

      let slots = [];

      if (
        Array.isArray(data)
      ) {
        slots = data;
      } else if (
        Array.isArray(
          data.slots
        )
      ) {
        slots = data.slots;
      } else if (
        Array.isArray(
          data.results
        )
      ) {
        slots = data.results;
      }

      slots = slots
        .map((slot) => {
          if (
            typeof slot ===
            "string"
          ) {
            return normalizeTime(
              slot
            );
          }

          if (
            slot &&
            typeof slot ===
              "object"
          ) {
            return normalizeTime(
              slot.time ||
                slot.appointment_time ||
                slot.start_time
            );
          }

          return "";
        })
        .filter(Boolean);

      // Remove duplicate slots
      slots = [
        ...new Set(slots),
      ];

      // -------------------------------------------------------
      // WALK-IN
      // Only future times today
      // -------------------------------------------------------

      if (
        appointmentType ===
          "WALK_IN" &&
        appointmentDate ===
          getTodayDate()
      ) {
        const now =
          new Date();

        const currentMinutes =
          now.getHours() *
            60 +
          now.getMinutes();

        slots =
          slots.filter(
            (slot) => {
              const slotMinutes =
                timeToMinutes(
                  slot
                );

              return (
                slotMinutes !==
                  null &&
                slotMinutes >
                  currentMinutes
              );
            }
          );
      }

      // -------------------------------------------------------
      // SORT SLOTS
      // -------------------------------------------------------

      slots.sort(
        (a, b) =>
          timeToMinutes(a) -
          timeToMinutes(b)
      );

      // -------------------------------------------------------
      // SET AVAILABLE SLOTS
      // -------------------------------------------------------

      setAvailableSlots(
        slots
      );

      // -------------------------------------------------------
      // NO SLOTS
      // -------------------------------------------------------

      if (
        slots.length === 0
      ) {
        setSlotsMessage(
          appointmentType ===
            "WALK_IN"
            ? "No walk-in slots are available today."
            : "No available appointment slots for this doctor on the selected date."
        );

        setFormData(
          (previous) => ({
            ...previous,
            appointment_time:
              "",
          })
        );

        return;
      }

      // -------------------------------------------------------
      // AUTOMATICALLY SELECT FIRST AVAILABLE SLOT
      // -------------------------------------------------------

      setFormData(
        (previous) => ({
          ...previous,
          appointment_time:
            slots[0],
        })
      );
    } catch (err) {
      console.error(
        "Available slots error:",
        err
      );

      setAvailableSlots([]);

      setSlotsMessage(
        err.message ||
          "Unable to load available slots."
      );

      setFormData(
        (previous) => ({
          ...previous,
          appointment_time:
            "",
        })
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  // =========================================================
  // FETCH SLOTS WHEN DOCTOR / DATE / TYPE CHANGES
  // =========================================================

  useEffect(() => {
    const doctorId =
      formData.doctor;

    const appointmentDate =
      formData.appointment_date;

    const appointmentType =
      formData.appointment_type;

    if (
      doctorId &&
      appointmentDate
    ) {
      fetchAvailableSlots(
        doctorId,
        appointmentDate,
        appointmentType
      );
    } else {
      setAvailableSlots([]);
      setSlotsMessage("");

      setFormData(
        (previous) => ({
          ...previous,
          appointment_time:
            "",
        })
      );
    }
  }, [
    formData.doctor,
    formData.appointment_date,
    formData.appointment_type,
  ]);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = async (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    let updatedFormData = {
      ...formData,
      [name]: value,
    };

    // =======================================================
    // APPOINTMENT TYPE
    // =======================================================

    if (
      name ===
        "appointment_type" &&
      value ===
        "WALK_IN"
    ) {
      updatedFormData = {
        ...updatedFormData,
        appointment_type:
          value,
        appointment_date:
          getTodayDate(),
        appointment_time:
          "",
      };
    }

    if (
      name ===
        "appointment_type" &&
      value ===
        "PRIOR_BOOKING"
    ) {
      updatedFormData = {
        ...updatedFormData,
        appointment_type:
          value,
        appointment_date:
          "",
        appointment_time:
          "",
      };
    }

    // =======================================================
    // DEPARTMENT
    // =======================================================

    if (
      name ===
        "department"
    ) {
      updatedFormData = {
        ...updatedFormData,
        department:
          value,
        doctor: "",
        appointment_time:
          "",
      };
    }

    // =======================================================
    // DOCTOR
    // =======================================================

    if (
      name === "doctor"
    ) {
      updatedFormData = {
        ...updatedFormData,
        doctor:
          value,
        appointment_time:
          "",
      };
    }

    // =======================================================
    // DATE
    // =======================================================

    if (
      name ===
        "appointment_date"
    ) {
      updatedFormData = {
        ...updatedFormData,
        appointment_date:
          value,
        appointment_time:
          "",
      };
    }

    // =======================================================
    // TIME
    // =======================================================

    if (
      name ===
        "appointment_time"
    ) {
      updatedFormData = {
        ...updatedFormData,
        appointment_time:
          value,
      };
    }

    setFormData(
      updatedFormData
    );

    setMessage("");
    setError("");

    // =======================================================
    // IMMEDIATE CONFLICT VALIDATION
    // =======================================================

    if (
      (
        name ===
          "patient" ||
        name ===
          "doctor" ||
        name ===
          "appointment_date" ||
        name ===
          "appointment_time"
      ) &&
      updatedFormData.patient &&
      updatedFormData.doctor &&
      updatedFormData
        .appointment_date &&
      updatedFormData
        .appointment_time
    ) {
      const conflict =
        await validateAppointmentConflict(
          updatedFormData
        );

      if (conflict) {
        setError(
          conflict
        );
      }
    }
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (
    e
  ) => {
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

      if (
        !formData.appointment_date
      ) {
        throw new Error(
          "Please select an appointment date."
        );
      }

      if (
        !formData.appointment_time
      ) {
        throw new Error(
          "Please select an appointment time."
        );
      }

      const today =
        getTodayDate();

      // =====================================================
      // WALK-IN VALIDATION
      // =====================================================

      if (
        formData.appointment_type ===
          "WALK_IN" &&
        formData.appointment_date !==
          today
      ) {
        throw new Error(
          "Walk-in appointments can only be scheduled for today."
        );
      }

      // =====================================================
      // PRIOR BOOKING VALIDATION
      // =====================================================

      if (
        formData.appointment_type ===
        "PRIOR_BOOKING"
      ) {
        const dayAfterTomorrow =
          getDayAfterTomorrowDate();

        const maxDate =
          getMaxBookingDate();

        if (
          formData.appointment_date <
          dayAfterTomorrow
        ) {
          throw new Error(
            "Prior Booking cannot be made for tomorrow. Please select a date from the day after tomorrow."
          );
        }

        if (
          formData.appointment_date >
          maxDate
        ) {
          throw new Error(
            "Prior Booking can be made only within the next 30 days."
          );
        }
      }

      // =====================================================
      // WALK-IN TIME VALIDATION
      // =====================================================

      if (
        formData.appointment_type ===
        "WALK_IN"
      ) {
        const now =
          new Date();

        const currentTimeInMinutes =
          now.getHours() *
            60 +
          now.getMinutes();

        const selectedTimeInMinutes =
          timeToMinutes(
            formData.appointment_time
          );

        if (
          selectedTimeInMinutes ===
          null
        ) {
          throw new Error(
            "Please select a valid appointment time."
          );
        }

        if (
          selectedTimeInMinutes <=
          currentTimeInMinutes
        ) {
          throw new Error(
            "Walk-in appointments must be scheduled for a future time today."
          );
        }
      }

      // =====================================================
      // FINAL CONFLICT CHECK
      // =====================================================

      const conflict =
        await validateAppointmentConflict(
          formData
        );

      if (conflict) {
        throw new Error(
          conflict
        );
      }

      // =====================================================
      // POST APPOINTMENT
      // =====================================================

      const response =
        await fetch(
          "http://127.0.0.1:8000/api/receptionist/appointments/",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              patient:
                Number(
                  formData.patient
                ),

              department:
                Number(
                  formData.department
                ),

              doctor:
                Number(
                  formData.doctor
                ),

              appointment_type:
                formData.appointment_type,

              appointment_date:
                formData.appointment_date,

              appointment_time:
                formData.appointment_time,

              status:
                "Scheduled",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          typeof data ===
            "object" &&
          data !== null
        ) {
          const backendErrors =
            Object.entries(
              data
            )
              .map(
                ([
                  field,
                  messages,
                ]) => {
                  const text =
                    Array.isArray(
                      messages
                    )
                      ? messages.join(
                          ", "
                        )
                      : messages;

                  return `${field}: ${text}`;
                }
              )
              .join(
                " | "
              );

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
  "Appointment scheduled successfully. The token will be generated after the consultation bill is completed."
);

// =====================================================
// OPEN CONSULTATION BILL AUTOMATICALLY
// AFTER SUCCESSFUL APPOINTMENT CREATION
// =====================================================

if (onAppointmentScheduled) {
  onAppointmentScheduled(data);
  return;
}

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
setSlotsMessage("");
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ACTIVE PATIENTS
  // =========================================================

  const activePatients =
    patients.filter(
      (patient) =>
        patient.status ===
        "Active"
    );

  // =========================================================
  // ACTIVE DOCTORS
  // =========================================================

  const activeDoctors =
    doctors.filter(
      (doctor) =>
        doctor.status === true ||
        doctor.status ===
          "Active"
    );

  // =========================================================
  // FILTER DOCTORS BY DEPARTMENT
  // =========================================================

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

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">

      {/* Header */}

      <nav className="navbar navbar-dark bg-primary px-3 px-md-4">

        <div className="container-fluid">

          <span className="navbar-brand fw-bold">
            Clinic Management System
          </span>

          <span className="text-white fw-semibold">
            Schedule Appointment
          </span>

        </div>

      </nav>

      <div className="container py-4">

        {/* Page heading */}

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

        {/* Success message */}

        {message && (
          <div
            className="alert alert-success"
            role="alert"
          >
            {message}
          </div>
        )}

        {/* Error message */}

        {error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Appointment Form */}

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4">

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="row g-4">

                {/* Patient */}

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

                          {
                            patient.patient_id
                          }{" "}
                          -{" "}
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

                </div>

                {/* Department */}

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

                          {
                            department.name ||
                            department.department_name
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* Doctor */}

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
                  >

                    <option value="">
                      Select Doctor
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

                          {
                            doctor.user__first_name ||
                            doctor.first_name ||
                            ""
                          }{" "}

                          {
                            doctor.user__last_name ||
                            doctor.last_name ||
                            ""
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

                {/* Appointment Type */}

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

                {/* Appointment Date */}

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
                        : getDayAfterTomorrowDate()
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
                      automatically scheduled for
                      today.

                    </small>

                  )}

                  {formData.appointment_type ===
                    "PRIOR_BOOKING" && (

                    <small className="text-muted">

                      Prior booking is available
                      from the day after tomorrow
                      up to 30 days ahead.

                    </small>

                  )}

                </div>

                {/* Appointment Time */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">

                    Appointment Time{" "}

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
                    disabled={
                      !formData.doctor ||
                      !formData.appointment_date ||
                      slotsLoading ||
                      availableSlots.length ===
                        0
                    }
                    required
                  >

                    <option value="">

                      {slotsLoading
                        ? "Loading available slots..."
                        : "Select available time"}

                    </option>

                    {availableSlots.map(
                      (slot) => (

                        <option
                          key={slot}
                          value={slot}
                        >
                          {
                            formatTime12Hour(
                              slot
                            )
                          }
                        </option>

                      )
                    )}

                  </select>

                  {slotsLoading && (
                    <small className="text-muted">
                      Checking available slots...
                    </small>
                  )}

                  {!slotsLoading &&
                    slotsMessage && (

                    <small className="text-danger">
                      {slotsMessage}
                    </small>

                  )}

                  {!slotsLoading &&
                    !slotsMessage &&
                    formData.doctor &&
                    formData.appointment_date &&
                    availableSlots.length >
                      0 && (

                    <small className="text-muted">
                      Only available slots are shown.
                    </small>

                  )}

                </div>

                {/* Status */}

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

              {/* Buttons */}

              <div className="d-flex justify-content-end gap-2 mt-4">

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
                    availableSlots.length ===
                      0
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

        {/* Information */}

        <div className="alert alert-info mt-4">

          <strong>Note:</strong>{" "}

          The appointment token number is
          generated only after the
          consultation bill is created and
          the payment status is marked as{" "}

          <strong>Completed</strong>.

        </div>

      </div>

    </div>
  );
}

export default ScheduleAppointment;