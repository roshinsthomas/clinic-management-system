import { useEffect, useState } from "react";

function ScheduleAppointment() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    patient: "",
    department: "",
    doctor: "",
    appointment_type: "Prior Booking",
    appointment_date: "",
    appointment_time: "",
    status: "Scheduled",
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("access_token");

  // GET TODAY'S DATE
  const getToday = () => {
    const today = new Date();

    return today.toISOString().split("T")[0];
  };

  // GET DATE TWO DAYS FROM TODAY
  const getMaxDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + 2);

    return date.toISOString().split("T")[0];
  };

  const today = getToday();
  const maxDate = getMaxDate();

  // FETCH PATIENTS, DOCTORS AND DEPARTMENTS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [patientsResponse, doctorsResponse, departmentsResponse] =
          await Promise.all([
            fetch(
              "http://127.0.0.1:8000/api/receptionist/patients/",
              {
                headers,
              }
            ),

            fetch(
              "http://127.0.0.1:8000/api/accounts/doctors/",
              {
                headers,
              }
            ),

            fetch(
              "http://127.0.0.1:8000/api/accounts/departments/",
              {
                headers,
              }
            ),
          ]);

        const patientsData = await patientsResponse.json();
        const doctorsData = await doctorsResponse.json();
        const departmentsData = await departmentsResponse.json();

        if (!patientsResponse.ok) {
          throw new Error(
            patientsData.detail ||
              "Failed to fetch patients."
          );
        }

        if (!doctorsResponse.ok) {
          throw new Error(
            doctorsData.detail ||
              "Failed to fetch doctors."
          );
        }

        if (!departmentsResponse.ok) {
          throw new Error(
            departmentsData.detail ||
              "Failed to fetch departments."
          );
        }

        setPatients(patientsData);
        setDoctors(doctorsData);
        setDepartments(departmentsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // HANDLE APPOINTMENT TYPE CHANGE
  const handleAppointmentTypeChange = (e) => {
    const type = e.target.value;

    setFormData((previousData) => ({
      ...previousData,
      appointment_type: type,

      // Walk-in appointments are always for today
      appointment_date:
        type === "Walk-in"
          ? today
          : "",
    }));

    setError("");
    setSuccess("");
  };

  // SUBMIT APPOINTMENT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // BASIC VALIDATION
      if (!formData.patient) {
        throw new Error("Please select a patient.");
      }

      if (!formData.department) {
        throw new Error("Please select a department.");
      }

      if (!formData.doctor) {
        throw new Error("Please select a doctor.");
      }

      if (!formData.appointment_date) {
        throw new Error(
          "Please select an appointment date."
        );
      }

      if (!formData.appointment_time) {
        throw new Error(
          "Please select an appointment time."
        );
      }

      // WALK-IN VALIDATION
      if (
        formData.appointment_type === "Walk-in" &&
        formData.appointment_date !== today
      ) {
        throw new Error(
          "Walk-in appointments are only available for today."
        );
      }

      // PRIOR BOOKING VALIDATION
      if (
        formData.appointment_type === "Prior Booking" &&
        (formData.appointment_date < today ||
          formData.appointment_date > maxDate)
      ) {
        throw new Error(
          "Prior booking is available only for today and the next two days."
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
            patient: Number(formData.patient),
            department: Number(formData.department),
            doctor: Number(formData.doctor),
            appointment_date:
              formData.appointment_date,
            appointment_time:
              formData.appointment_time,
            status: "Scheduled",

            // This will be supported by the backend
            // after the model is updated.
            appointment_type:
              formData.appointment_type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            JSON.stringify(data)
        );
      }

      setSuccess(
        "Appointment scheduled successfully!"
      );

      // RESET FORM
      setFormData({
        patient: "",
        department: "",
        doctor: "",
        appointment_type: "Prior Booking",
        appointment_date: "",
        appointment_time: "",
        status: "Scheduled",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // CLEAR FORM
  const handleClear = () => {
    setFormData({
      patient: "",
      department: "",
      doctor: "",
      appointment_type: "Prior Booking",
      appointment_date: "",
      appointment_time: "",
      status: "Scheduled",
    });

    setError("");
    setSuccess("");
  };

  // FILTER ONLY ACTIVE PATIENTS
  const activePatients = patients.filter(
    (patient) =>
      patient.status === "Active"
  );

  // FILTER ACTIVE DOCTORS
  const activeDoctors = doctors.filter(
    (doctor) =>
      doctor.status === true ||
      doctor.status === "Active"
  );

  if (pageLoading) {
    return (
      <div className="container-fluid bg-light min-vh-100 py-5">
        <div className="text-center">

          <div className="spinner-border text-primary"></div>

          <p className="mt-2 text-muted">
            Loading appointment details...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">

      <div className="container">

        {/* PAGE HEADER */}
        <div className="mb-4">

          <h2 className="fw-bold">
            Schedule Appointment
          </h2>

          <p className="text-muted mb-0">
            Schedule a walk-in or prior booking appointment.
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

        {/* FORM */}
        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 p-md-5">

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* PATIENT */}
                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Patient
                  </label>

                  <select
                    name="patient"
                    className="form-select"
                    value={formData.patient}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select patient
                    </option>

                    {activePatients.map((patient) => (

                      <option
                        key={patient.patient_id}
                        value={patient.patient_id}
                      >
                        {patient.patient_id} -{" "}
                        {patient.first_name}{" "}
                        {patient.last_name}
                      </option>

                    ))}

                  </select>

                  {activePatients.length === 0 && (
                    <small className="text-danger">
                      No active patients available.
                    </small>
                  )}

                </div>

                {/* APPOINTMENT TYPE */}
                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Type
                  </label>

                  <select
                    name="appointment_type"
                    className="form-select"
                    value={formData.appointment_type}
                    onChange={handleAppointmentTypeChange}
                    required
                  >

                    <option value="Prior Booking">
                      Prior Booking
                    </option>

                    <option value="Walk-in">
                      Walk-in
                    </option>

                  </select>

                </div>

                {/* DEPARTMENT */}
                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Department
                  </label>

                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select department
                    </option>

                    {departments.map((department) => (

                      <option
                        key={department.department_id}
                        value={department.department_id}
                      >
                        {department.name}
                      </option>

                    ))}

                  </select>

                </div>

                {/* DOCTOR */}
                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Doctor
                  </label>

                  <select
                    name="doctor"
                    className="form-select"
                    value={formData.doctor}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select doctor
                    </option>

                    {activeDoctors.map((doctor) => (

                      <option
                        key={doctor.staff_id}
                        value={doctor.staff_id}
                      >
                        Dr. {doctor.first_name}{" "}
                        {doctor.last_name}
                      </option>

                    ))}

                  </select>

                  {activeDoctors.length === 0 && (
                    <small className="text-danger">
                      No active doctors available.
                    </small>
                  )}

                </div>

                {/* APPOINTMENT DATE */}
                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Date
                  </label>

                  <input
                    type="date"
                    name="appointment_date"
                    className="form-control"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    min={today}
                    max={
                      formData.appointment_type ===
                      "Walk-in"
                        ? today
                        : maxDate
                    }
                    disabled={
                      formData.appointment_type ===
                      "Walk-in"
                    }
                    required
                  />

                  <small className="text-muted">

                    {formData.appointment_type ===
                    "Walk-in"
                      ? "Walk-in appointments are for today only."
                      : "Prior booking is available for today and the next two days."}

                  </small>

                </div>

                {/* TIME */}
                <div className="col-12 col-md-6">

                  <label className="form-label fw-semibold">
                    Appointment Time
                  </label>

                  <input
                    type="time"
                    name="appointment_time"
                    className="form-control"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* IMPORTANT NOTE */}
              <div className="alert alert-info mt-4">

                <strong>Note:</strong>

                <span className="ms-1">
                  Token number will not be generated while
                  scheduling the appointment. It will be
                  generated only after the consultation bill
                  payment is completed.
                </span>

              </div>

              {/* BUTTONS */}
              <div className="d-flex flex-column flex-sm-row gap-2 mt-4">

                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading
                    ? "Scheduling..."
                    : "Schedule Appointment"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handleClear}
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

export default ScheduleAppointment;