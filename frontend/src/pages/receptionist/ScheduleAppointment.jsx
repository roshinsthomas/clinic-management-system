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

  // Patient search
  const [patientSearchType, setPatientSearchType] = useState("id");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSearchError, setPatientSearchError] = useState("");
  const [showPatientResults, setShowPatientResults] = useState(false);

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
  const [conflictError, setConflictError] = useState("");
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
  // TIME -> MINUTES
  // =========================================================

  const timeToMinutes = (time) => {
    if (!time) {
      return null;
    }

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return null;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    return hours * 60 + minutes;
  };

  // =========================================================
  // FORMAT TIME FOR DISPLAY
  // =========================================================

  const formatTime12Hour = (time) => {
    const totalMinutes = timeToMinutes(time);

    if (totalMinutes === null) {
      return time;
    }

    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const period = hours24 >= 12 ? "PM" : "AM";

    let hours12 = hours24 % 12;

    if (hours12 === 0) {
      hours12 = 12;
    }

    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // =========================================================
  // NORMALIZE TIME
  // =========================================================

  const normalizeTime = (time) => {
    if (!time) {
      return "";
    }

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return "";
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return "";
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
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

      const [patientsRes, doctorsRes, departmentsRes] =
        await Promise.all([
          fetch(
            "http://127.0.0.1:8000/api/receptionist/patients/",
            {
              headers,
            }
          ),

          fetch("http://127.0.0.1:8000/api/doctors/", {
            headers,
          }),

          fetch("http://127.0.0.1:8000/api/departments/", {
            headers,
          }),
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

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const departmentsData = await departmentsRes.json();

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
      setError(err.message || "Failed to load data.");
    }
  };

  // =========================================================
  // AUTOMATICALLY SELECT PATIENT
  // =========================================================

  useEffect(() => {
    if (initialPatientId && patients.length > 0) {
      const patientExists = patients.some(
        (patient) =>
          String(patient.patient_id) === String(initialPatientId) &&
          patient.status === "Active"
      );

      if (patientExists) {
        setFormData((previous) => ({
          ...previous,
          patient: String(initialPatientId),
        }));

        setPatientSearchType("id");
        setPatientSearch("");
        setPatientSearchError("");
        setShowPatientResults(false);
      }
    }
  }, [initialPatientId, patients]);

  // =========================================================
  // WALK-IN DEFAULT DATE = TODAY
  // =========================================================

  useEffect(() => {
    if (
      formData.appointment_type === "WALK_IN" &&
      !formData.appointment_date
    ) {
      setFormData((previous) => ({
        ...previous,
        appointment_date: getTodayDate(),
      }));
    }
  }, [formData.appointment_type, formData.appointment_date]);

  // =========================================================
  // ACTIVE PATIENTS
  // =========================================================

  const activePatients = patients.filter(
    (patient) => patient.status === "Active"
  );

  // =========================================================
  // SELECTED PATIENT
  // =========================================================

  const selectedPatient = activePatients.find(
    (patient) =>
      String(patient.patient_id) === String(formData.patient)
  );

  // =========================================================
  // PATIENT SEARCH VALIDATION
  // =========================================================

  const validatePatientSearch = (
    value,
    type = patientSearchType
  ) => {
    if (!value) {
      return "";
    }

    if (type === "id") {
      if (!/^\d+$/.test(value)) {
        return "Patient ID must contain digits only.";
      }

      return "";
    }

    if (value.trim() !== value) {
      return "Leading or trailing spaces are not allowed.";
    }

    if (/\s{2,}/.test(value)) {
      return "Only single spaces are allowed between words.";
    }

    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)) {
      return "Patient name must contain only alphabets and single spaces.";
    }

    return "";
  };

  // =========================================================
  // FILTER PATIENTS
  // =========================================================

  const filteredPatients = activePatients.filter((patient) => {
    const search = patientSearch.toLowerCase();

    if (!search) {
      return false;
    }

    if (patientSearchType === "id") {
      return String(patient.patient_id).includes(search);
    }

    const fullName =
      `${patient.first_name || ""} ${patient.last_name || ""}`
        .trim()
        .toLowerCase();

    return fullName.includes(search);
  });

  // =========================================================
  // PATIENT SEARCH TYPE CHANGE
  // =========================================================

  const handlePatientSearchTypeChange = (e) => {
    const value = e.target.value;

    setPatientSearchType(value);
    setPatientSearch("");
    setPatientSearchError("");
    setShowPatientResults(false);
    setError("");
    setConflictError("");
    setMessage("");
  };

  // =========================================================
  // PATIENT SEARCH CHANGE
  // =========================================================

  const handlePatientSearchChange = (e) => {
    let value = e.target.value;

    if (patientSearchType === "id") {
      value = value.replace(/\D/g, "");
    } else {
      value = value.replace(/[^A-Za-z ]/g, "");
    }

    setPatientSearch(value);

    const validationError = validatePatientSearch(
      value,
      patientSearchType
    );

    setPatientSearchError(validationError);
    setError("");
    setConflictError("");
    setMessage("");

    if (value && !validationError) {
      setShowPatientResults(true);
    } else {
      setShowPatientResults(false);
    }
  };

  // =========================================================
  // PATIENT SEARCH FOCUS
  // =========================================================

  const handlePatientSearchFocus = () => {
    if (patientSearch && !patientSearchError) {
      setShowPatientResults(true);
    }
  };

  // =========================================================
  // SELECT PATIENT FROM SEARCH RESULTS
  // =========================================================

  const handlePatientSelect = (patient) => {
    setFormData((previous) => ({
      ...previous,
      patient: String(patient.patient_id),
    }));

    setPatientSearch("");
    setPatientSearchError("");
    setShowPatientResults(false);
    setError("");
    setConflictError("");
    setMessage("");
  };

  // =========================================================
  // CLEAR PATIENT SEARCH
  // =========================================================

  const handleClearPatientSearch = () => {
    setPatientSearch("");
    setPatientSearchError("");
    setShowPatientResults(false);

    setFormData((previous) => ({
      ...previous,
      patient: "",
    }));

    setError("");
    setConflictError("");
    setMessage("");
  };

  // =========================================================
  // FETCH APPOINTMENTS FOR A PARTICULAR DAY
  // =========================================================

  const fetchDayAppointments = async (appointmentDate) => {
    if (!appointmentDate) {
      return [];
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/?appointment_date=${appointmentDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      return Array.isArray(data) ? data : data.results || [];
    } catch (err) {
      return [];
    }
  };

  // =========================================================
  // CHECK CANCELLED APPOINTMENT
  // =========================================================

  const isCancelledAppointment = (appointment) => {
    const status = String(
      appointment.status || ""
    ).toLowerCase();

    return (
      status === "cancelled" ||
      status === "canceled"
    );
  };

  // =========================================================
  // CHECK TIME OVERLAP
  // =========================================================

  const isTimeOverlapping = (time1, time2) => {
    const start1 = timeToMinutes(time1);
    const start2 = timeToMinutes(time2);

    if (
      start1 === null ||
      start2 === null
    ) {
      return false;
    }

    const end1 = start1 + 15;
    const end2 = start2 + 15;

    return (
      start1 < end2 &&
      start2 < end1
    );
  };

  // =========================================================
  // GET APPOINTMENT PATIENT ID
  // =========================================================

  const getAppointmentPatientId = (appointment) => {
    if (
      appointment.patient &&
      typeof appointment.patient === "object"
    ) {
      return (
        appointment.patient.patient_id ??
        appointment.patient.id ??
        ""
      );
    }

    return appointment.patient;
  };

  // =========================================================
  // GET APPOINTMENT DOCTOR ID
  // =========================================================

  const getAppointmentDoctorId = (appointment) => {
    if (
      appointment.doctor &&
      typeof appointment.doctor === "object"
    ) {
      return (
        appointment.doctor.staff_id ??
        appointment.doctor.id ??
        ""
      );
    }

    return appointment.doctor;
  };

  // =========================================================
  // VALIDATE APPOINTMENT CONFLICT
  // =========================================================

  const validateAppointmentConflict = async (
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
        currentFormData.appointment_date
      );

    const activeAppointments =
      appointments.filter(
        (appointment) =>
          !isCancelledAppointment(appointment)
      );

    const selectedPatient =
      String(currentFormData.patient);

    const selectedDoctor =
      String(currentFormData.doctor);

    const selectedTime =
      normalizeTime(
        currentFormData.appointment_time
      );

    for (const appointment of activeAppointments) {
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
          appointment.appointment_time
        );

      // ------------------------------------------------------
      // SAME PATIENT + SAME DOCTOR + SAME DAY
      // ------------------------------------------------------

      if (
        appointmentPatient ===
          selectedPatient &&
        appointmentDoctor ===
          selectedDoctor
      ) {
        return "This patient already has an appointment with this doctor today.";
      }

      // ------------------------------------------------------
      // SAME PATIENT + DIFFERENT DOCTOR +
      // OVERLAPPING TIME
      // ------------------------------------------------------

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
        return "This patient already has an appointment at this time.";
      }

      // ------------------------------------------------------
      // SAME DOCTOR + SAME TIME +
      // DIFFERENT PATIENT
      // ------------------------------------------------------

      if (
        appointmentDoctor ===
          selectedDoctor &&
        appointmentPatient !==
          selectedPatient &&
        appointmentTime ===
          selectedTime
      ) {
        return "This time slot is already booked.";
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
      const url =
        `http://127.0.0.1:8000/api/receptionist/appointments/available-slots/` +
        `?doctor=${encodeURIComponent(
          doctorId
        )}` +
        `&date=${encodeURIComponent(
          appointmentDate
        )}`;

      const response =
        await fetch(url, {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },
        });

      if (!response.ok) {
        let errorText =
          "Failed to fetch available appointment slots.";

        try {
          const errorData =
            await response.json();

          if (errorData.detail) {
            errorText =
              errorData.detail;
          }
        } catch (err) {
          // Keep default message.
        }

        throw new Error(
          errorText
        );
      }

      const data =
        await response.json();

      let slots = [];

      if (Array.isArray(data)) {
        slots = data;
      } else if (
        Array.isArray(data.slots)
      ) {
        slots = data.slots;
      } else if (
        Array.isArray(data.results)
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

      slots = [
        ...new Set(slots),
      ];

      // WALK-IN
      // Only future times today

      if (
        appointmentType ===
          "WALK_IN" &&
        appointmentDate ===
          getTodayDate()
      ) {
        const now =
          new Date();

        const currentMinutes =
          now.getHours() * 60 +
          now.getMinutes();

        slots = slots.filter(
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

      // Sort slots

      slots.sort(
        (a, b) =>
          timeToMinutes(a) -
          timeToMinutes(b)
      );

      setAvailableSlots(
        slots
      );

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

      // Automatically select
      // first available slot

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

      setAvailableSlots(
        []
      );

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
      setSlotsLoading(
        false
      );
    }
  };

  // =========================================================
  // FETCH SLOTS WHEN DOCTOR / DATE / TYPE CHANGES
  // =========================================================

  useEffect(() => {
    if (
      formData.doctor &&
      formData.appointment_date
    ) {
      fetchAvailableSlots(
        formData.doctor,
        formData.appointment_date,
        formData.appointment_type
      );
    } else {
      setAvailableSlots(
        []
      );

      setSlotsMessage(
        ""
      );

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

  const handleChange = async (e) => {
    const {
      name,
      value,
    } = e.target;

    let updatedFormData = {
      ...formData,
      [name]: value,
    };

    // APPOINTMENT TYPE

    if (
      name ===
        "appointment_type" &&
      value === "WALK_IN"
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

    // PATIENT

    if (
      name === "patient"
    ) {
      updatedFormData = {
        ...updatedFormData,

        patient:
          value,
      };
    }

    // DEPARTMENT

    if (
      name ===
        "department"
    ) {
      updatedFormData = {
        ...updatedFormData,

        department:
          value,

        doctor:
          "",

        appointment_time:
          "",
      };
    }

    // DOCTOR

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

    // DATE

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

    // TIME

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
    setConflictError("");

    // --------------------------------------------------------
    // IMMEDIATE CONFLICT VALIDATION
    // --------------------------------------------------------

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
      updatedFormData.appointment_date &&
      updatedFormData.appointment_time
    ) {
      const conflict =
        await validateAppointmentConflict(
          updatedFormData
        );

      if (conflict) {
        setConflictError(
          conflict
        );
      } else {
        setConflictError("");
      }
    }
  };

  // =========================================================
  // ACTIVE DEPARTMENTS
  // =========================================================

  const activeDepartments =
    departments.filter(
      (department) =>
        department.status ===
          true ||
        department.status ===
          "Active"
    );

  // =========================================================
  // ACTIVE DOCTORS
  // =========================================================

  const activeDoctors =
    doctors.filter(
      (doctor) =>
        doctor.status ===
          true ||
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
  // CURRENT FORM VALIDATION ERROR
  // =========================================================

  const getCurrentValidationError = () => {
    // Patient
    if (!formData.patient) {
      return "Please select a patient.";
    }

    // Department
    if (!formData.department) {
      return "Please select a department.";
    }

    // Doctor
    if (!formData.doctor) {
      return "Please select a doctor.";
    }

    // Date
    if (!formData.appointment_date) {
      return "Please select an appointment date.";
    }

    // Time
    if (!formData.appointment_time) {
      return "Please select an appointment time.";
    }

    // Active patient
    const selectedPatientForValidation =
      activePatients.find(
        (patient) =>
          String(
            patient.patient_id
          ) ===
          String(
            formData.patient
          )
      );

    if (!selectedPatientForValidation) {
      return "Selected patient is not active or does not exist.";
    }

    // Active department
    const selectedDepartmentForValidation =
      activeDepartments.find(
        (department) =>
          String(
            department.department_id
          ) ===
          String(
            formData.department
          )
      );

    if (!selectedDepartmentForValidation) {
      return "Selected department is not active or does not exist.";
    }

    // Active doctor
    const selectedDoctorForValidation =
      activeDoctors.find(
        (doctor) =>
          String(
            doctor.staff_id
          ) ===
          String(
            formData.doctor
          )
      );

    if (!selectedDoctorForValidation) {
      return "Selected doctor is not active or does not exist.";
    }

    // Doctor belongs to department
    const doctorDepartment =
      selectedDoctorForValidation.department ??
      selectedDoctorForValidation.department_id;

    if (
      String(
        doctorDepartment
      ) !==
      String(
        formData.department
      )
    ) {
      return "Selected doctor does not belong to the selected department.";
    }

    const today =
      getTodayDate();

    // Walk-in date
    if (
      formData.appointment_type ===
        "WALK_IN" &&
      formData.appointment_date !==
        today
    ) {
      return "Walk-in appointments can only be scheduled for today.";
    }

    // Prior Booking date
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
        return "Prior Booking cannot be made for tomorrow. Please select a date from the day after tomorrow.";
      }

      if (
        formData.appointment_date >
        maxDate
      ) {
        return "Prior Booking can be made only within the next 30 days.";
      }
    }

    // Walk-in future time
    if (
      formData.appointment_type ===
        "WALK_IN"
    ) {
      const now =
        new Date();

      const currentTimeInMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      const selectedTimeInMinutes =
        timeToMinutes(
          formData.appointment_time
        );

      if (
        selectedTimeInMinutes ===
        null
      ) {
        return "Please select a valid appointment time.";
      }

      if (
        selectedTimeInMinutes <=
        currentTimeInMinutes
      ) {
        return "Walk-in appointments must be scheduled for a future time today.";
      }
    }

    // Selected time still available
    const normalizedSelectedTime =
      normalizeTime(
        formData.appointment_time
      );

    const normalizedAvailableSlots =
      availableSlots.map(
        (slot) =>
          normalizeTime(slot)
      );

    if (
      !normalizedAvailableSlots.includes(
        normalizedSelectedTime
      )
    ) {
      return "The selected appointment time is no longer available. Please select another available slot.";
    }

    return "";
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      // PATIENT SEARCH VALIDATION

      if (patientSearch) {
        const searchError =
          validatePatientSearch(
            patientSearch,
            patientSearchType
          );

        if (searchError) {
          throw new Error(
            searchError
          );
        }
      }

      // CURRENT FORM VALIDATION

      const currentValidationError =
        getCurrentValidationError();

      if (currentValidationError) {
        throw new Error(
          currentValidationError
        );
      }

      // FINAL CONFLICT CHECK

      const conflict =
        await validateAppointmentConflict(
          formData
        );

      if (conflict) {
        setConflictError(conflict);

        throw new Error(
          conflict
        );
      }

      setConflictError("");

      // POST APPOINTMENT

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

      // =====================================================
      // SUCCESS
      // Navigate directly to Create Bill page
      // =====================================================

      if (onAppointmentScheduled) {
        onAppointmentScheduled(data);
        return;
      }

      setMessage(
        "Appointment scheduled successfully. The token will be generated after the consultation bill is completed."
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
        status:
          "Scheduled",
      });

      setPatientSearch("");
      setPatientSearchError("");
      setShowPatientResults(
        false
      );

      setAvailableSlots([]);
      setSlotsMessage("");
      setConflictError("");
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
  // BUTTON DISABLED VALIDATION
  // =========================================================

  const currentValidationError =
    getCurrentValidationError();

  const isScheduleButtonDisabled =
    loading ||
    slotsLoading ||
    availableSlots.length === 0 ||
    !!error ||
    !!conflictError ||
    !!currentValidationError;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">



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

        {/* Conflict error */}

        {conflictError && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            {conflictError}
          </div>
        )}

        {/* General error */}

        {error && !conflictError && (
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

            <form onSubmit={handleSubmit}>

              <div className="row g-4">

                {/* =================================================
                    PATIENT
                    ================================================= */}

                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Patient{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  {/* Search controls */}

                  <div className="row g-2">

                    {/* Search type */}

                    <div className="col-12 col-sm-5">

                      <select
                        className="form-select"
                        value={
                          patientSearchType
                        }
                        onChange={
                          handlePatientSearchTypeChange
                        }
                      >

                        <option value="id">
                          ID
                        </option>

                        <option value="name">
                          Name
                        </option>

                      </select>

                    </div>

                    {/* Search input */}

                    <div className="col-12 col-sm-7">

                      <input
                        type="text"
                        className={`form-control ${
                          patientSearchError
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          patientSearch
                        }
                        onChange={
                          handlePatientSearchChange
                        }
                        onFocus={
                          handlePatientSearchFocus
                        }
                        placeholder={
                          patientSearchType ===
                            "id"
                            ? "Enter patient ID"
                            : "Enter patient name"
                        }
                      />

                    </div>

                  </div>

                  {/* Search validation */}

                  {patientSearchError && (
                    <div className="invalid-feedback d-block">
                      {
                        patientSearchError
                      }
                    </div>
                  )}

                  {/* Search result dropdown */}

                  {showPatientResults &&
                    !patientSearchError &&
                    patientSearch && (
                      <div
                        className="position-relative"
                        style={{
                          zIndex: 1050,
                        }}
                      >

                        <div
                          className="position-absolute bg-white border rounded shadow-sm w-100"
                          style={{
                            maxHeight:
                              "220px",
                            overflowY:
                              "auto",
                          }}
                        >

                          {filteredPatients.length >
                          0 ? (
                            filteredPatients.map(
                              (patient) => (
                                <button
                                  key={
                                    patient.patient_id
                                  }
                                  type="button"
                                  className="w-100 text-start border-0 bg-white px-3 py-2"
                                  style={{
                                    borderBottom:
                                      "1px solid #dee2e6",
                                  }}
                                  onMouseDown={(
                                    e
                                  ) =>
                                    e.preventDefault()
                                  }
                                  onClick={() =>
                                    handlePatientSelect(
                                      patient
                                    )
                                  }
                                >

                                  <div className="fw-semibold">
                                    {
                                      patient.first_name
                                    }{" "}
                                    {
                                      patient.last_name
                                    }
                                  </div>

                                  <small className="text-muted">
                                    Patient ID:{" "}
                                    {
                                      patient.patient_id
                                    }
                                  </small>

                                </button>
                              )
                            )
                          ) : (
                            <div className="px-3 py-3 text-danger">
                              No active patient found.
                            </div>
                          )}

                        </div>

                      </div>
                    )}

                  {/* Selected patient */}

                  {selectedPatient && (
                    <div className="alert alert-success mt-2 mb-0 py-2">

                      <div className="fw-semibold">
                        Patient selected
                      </div>

                      <div>
                        {
                          selectedPatient.first_name
                        }{" "}
                        {
                          selectedPatient.last_name
                        }{" "}
                        — ID:{" "}
                        {
                          selectedPatient.patient_id
                        }
                      </div>

                    </div>
                  )}

                  {/* Clear selected patient */}

                  {selectedPatient && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary mt-2"
                      onClick={
                        handleClearPatientSearch
                      }
                    >
                      Change Patient
                    </button>
                  )}

                </div>

                {/* =================================================
                    DEPARTMENT
                    ================================================= */}

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

                    {activeDepartments.map(
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

                {/* =================================================
                    DOCTOR
                    ================================================= */}

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

                {/* =================================================
                    APPOINTMENT TYPE
                    ================================================= */}

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

                {/* =================================================
                    APPOINTMENT DATE
                    ================================================= */}

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

                {/* =================================================
                    APPOINTMENT TIME
                    ================================================= */}

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
                          {formatTime12Hour(
                            slot
                          )}
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

                {/* =================================================
                    STATUS
                    ================================================= */}

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
                    isScheduleButtonDisabled
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