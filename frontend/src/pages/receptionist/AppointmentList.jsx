import { useEffect, useMemo, useState } from "react";

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [dateFilter, setDateFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [doctorFilter, setDoctorFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [appointmentTypeFilter, setAppointmentTypeFilter] =
    useState("");

  const token = localStorage.getItem("access_token");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentResponse, patientResponse, doctorResponse] =
        await Promise.all([
          fetch(
            "http://127.0.0.1:8000/api/receptionist/appointments/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://127.0.0.1:8000/api/receptionist/patients/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            "http://127.0.0.1:8000/api/accounts/doctors/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const appointmentData = await appointmentResponse.json();
      const patientData = await patientResponse.json();
      const doctorData = await doctorResponse.json();

      if (!appointmentResponse.ok) {
        throw new Error(
          appointmentData.detail ||
            "Failed to fetch appointments."
        );
      }

      if (!patientResponse.ok) {
        throw new Error(
          patientData.detail ||
            "Failed to fetch patients."
        );
      }

      if (!doctorResponse.ok) {
        throw new Error(
          doctorData.detail ||
            "Failed to fetch doctors."
        );
      }

      setAppointments(appointmentData);
      setPatients(patientData);
      setDoctors(doctorData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  const getPatient = (patientId) => {
    return patients.find(
      (patient) => patient.patient_id === patientId
    );
  };

  const getDoctor = (doctorId) => {
    return doctors.find(
      (doctor) => doctor.staff_id === doctorId
    );
  };

  const getPatientName = (patientId) => {
    const patient = getPatient(patientId);

    if (!patient) {
      return `Patient ID ${patientId}`;
    }

    return `${patient.first_name} ${patient.last_name}`;
  };

  const getDoctorName = (doctorId) => {
    const doctor = getDoctor(doctorId);

    if (!doctor) {
      return `Doctor ID ${doctorId}`;
    }

    return (
      `${doctor.first_name || ""} ${
        doctor.last_name || ""
      }`.trim() ||
      `Doctor ID ${doctorId}`
    );
  };

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    // Specific date filter
    if (dateFilter) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_date === dateFilter
      );
    }

    // From date filter
    if (fromDate) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_date >= fromDate
      );
    }

    // To date filter
    if (toDate) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_date <= toDate
      );
    }

    // Doctor filter
    if (doctorFilter) {
      result = result.filter(
        (appointment) =>
          appointment.doctor.toString() === doctorFilter
      );
    }

    // Patient filter
    if (patientFilter) {
      result = result.filter(
        (appointment) =>
          appointment.patient.toString() === patientFilter
      );
    }

    // Appointment type filter
    if (appointmentTypeFilter) {
      result = result.filter(
        (appointment) =>
          appointment.appointment_type ===
          appointmentTypeFilter
      );
    }

    // Today first → upcoming → older
    result.sort((a, b) => {
      const dateA = a.appointment_date;
      const dateB = b.appointment_date;

      const categoryA =
        dateA === today
          ? 0
          : dateA > today
          ? 1
          : 2;

      const categoryB =
        dateB === today
          ? 0
          : dateB > today
          ? 1
          : 2;

      if (categoryA !== categoryB) {
        return categoryA - categoryB;
      }

      // Same category → date
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      // Same date → time
      return (
        a.appointment_time || ""
      ).localeCompare(
        b.appointment_time || ""
      );
    });

    return result;
  }, [
    appointments,
    dateFilter,
    fromDate,
    toDate,
    doctorFilter,
    patientFilter,
    appointmentTypeFilter,
    today,
  ]);

  const handleClearFilters = () => {
    setDateFilter("");
    setFromDate("");
    setToDate("");
    setDoctorFilter("");
    setPatientFilter("");
    setAppointmentTypeFilter("");

    setSelectedAppointment(null);
    setError("");
    setSuccess("");
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setError("");
    setSuccess("");
  };

  const handleCancel = async (appointment) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel Appointment ID ${appointment.appointment_id}?`
    );

    if (!confirmCancel) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/receptionist/appointments/${appointment.appointment_id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Cancelled",
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
        `Appointment ID ${appointment.appointment_id} has been cancelled successfully.`
      );

      setSelectedAppointment(null);

      await fetchData();
    } catch (error) {
      setError(error.message);
    }
  };

  const getAppointmentStatusClass = (status) => {
    if (status === "Scheduled") {
      return "bg-success";
    }

    if (status === "Cancelled") {
      return "bg-danger";
    }

    if (status === "Completed") {
      return "bg-primary";
    }

    return "bg-secondary";
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">

        {/* PAGE HEADER */}

        <div className="mb-4">
          <h2 className="fw-bold">
            Appointment List
          </h2>

          <p className="text-muted mb-0">
            View, filter and cancel patient appointments.
          </p>
        </div>

        {/* MESSAGES */}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* FILTER CARD */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">

            <h5 className="fw-bold mb-3">
              Filter Appointments
            </h5>

            <div className="row g-3">

              {/* SPECIFIC DATE */}

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  Specific Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value)
                  }
                />
              </div>

              {/* FROM DATE */}

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  From Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(e.target.value)
                  }
                />
              </div>

              {/* TO DATE */}

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  To Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(e.target.value)
                  }
                />
              </div>

              {/* APPOINTMENT TYPE */}

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  Appointment Type
                </label>

                <select
                  className="form-select"
                  value={appointmentTypeFilter}
                  onChange={(e) =>
                    setAppointmentTypeFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    All Appointment Types
                  </option>

                  <option value="Walk-in">
                    Walk-in
                  </option>

                  <option value="Prior Booking">
                    Prior Booking
                  </option>
                </select>
              </div>

              {/* DOCTOR */}

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  Doctor
                </label>

                <select
                  className="form-select"
                  value={doctorFilter}
                  onChange={(e) =>
                    setDoctorFilter(e.target.value)
                  }
                >
                  <option value="">
                    All Doctors
                  </option>

                  {doctors.map((doctor) => (
                    <option
                      key={doctor.staff_id}
                      value={doctor.staff_id}
                    >
                      {getDoctorName(
                        doctor.staff_id
                      )}
                    </option>
                  ))}
                </select>
              </div>

              {/* PATIENT */}

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">
                  Patient
                </label>

                <select
                  className="form-select"
                  value={patientFilter}
                  onChange={(e) =>
                    setPatientFilter(e.target.value)
                  }
                >
                  <option value="">
                    All Patients
                  </option>

                  {patients.map((patient) => (
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
              </div>

              {/* CLEAR */}

              <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* APPOINTMENT COUNT */}

        {!loading && (
          <div className="mb-3">
            <span className="text-muted">
              Showing{" "}
              <strong>
                {filteredAppointments.length}
              </strong>{" "}
              appointment(s)
            </span>
          </div>
        )}

        {/* APPOINTMENT TABLE */}

        {loading ? (
          <div className="text-center py-5">

            <div className="spinner-border text-primary"></div>

            <p className="mt-2 text-muted">
              Loading appointments...
            </p>

          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="alert alert-info">
            No appointments found for the selected filters.
          </div>
        ) : (
          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>
                      <th>Appointment ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Appointment Type</th>
                      <th>Token No.</th>
                      <th>Status</th>
                      <th>Actions</th>
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

                          <td className="fw-semibold">
                            {
                              appointment.appointment_id
                            }
                          </td>

                          <td>
                            <strong>
                              {getPatientName(
                                appointment.patient
                              )}
                            </strong>

                            <br />

                            <small className="text-muted">
                              Patient ID:{" "}
                              {
                                appointment.patient
                              }
                            </small>
                          </td>

                          <td>
                            {getDoctorName(
                              appointment.doctor
                            )}
                          </td>

                          <td>
                            {
                              appointment.appointment_date
                            }
                          </td>

                          <td>
                            {
                              appointment.appointment_time
                            }
                          </td>

                          <td>
                            {appointment.appointment_type ||
                              "—"}
                          </td>

                          <td className="fw-semibold">
                            {appointment.token_no ||
                              "Not Generated"}
                          </td>

                          <td>

                            <span
                              className={`badge ${getAppointmentStatusClass(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>

                          </td>

                          <td>

                            <div className="d-flex flex-wrap gap-2">

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() =>
                                  handleView(
                                    appointment
                                  )
                                }
                              >
                                View
                              </button>

                              {appointment.status ===
                                "Scheduled" && (

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

        {/* VIEW APPOINTMENT DETAILS */}

        {selectedAppointment && (

          <div className="card border-0 shadow-sm mt-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                  <h4 className="fw-bold mb-1">
                    Appointment Details
                  </h4>

                  <p className="text-muted mb-0">
                    Appointment ID:{" "}
                    {
                      selectedAppointment.appointment_id
                    }
                  </p>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setSelectedAppointment(null)
                  }
                ></button>

              </div>

              <div className="row g-3">

                <div className="col-12 col-md-6">
                  <strong>Appointment ID</strong>
                  <p>
                    {
                      selectedAppointment.appointment_id
                    }
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Patient</strong>

                  <p>
                    {getPatientName(
                      selectedAppointment.patient
                    )}

                    <br />

                    <small className="text-muted">
                      Patient ID:{" "}
                      {
                        selectedAppointment.patient
                      }
                    </small>
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Doctor</strong>

                  <p>
                    {getDoctorName(
                      selectedAppointment.doctor
                    )}
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Department</strong>

                  <p>
                    Department ID:{" "}
                    {
                      selectedAppointment.department
                    }
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Appointment Date</strong>

                  <p>
                    {
                      selectedAppointment.appointment_date
                    }
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Appointment Time</strong>

                  <p>
                    {
                      selectedAppointment.appointment_time
                    }
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Appointment Type</strong>

                  <p>
                    {selectedAppointment.appointment_type ||
                      "Not Available"}
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Token No.</strong>

                  <p className="fw-semibold">
                    {selectedAppointment.token_no ||
                      "Not Generated"}
                  </p>
                </div>

                <div className="col-12 col-md-6">
                  <strong>Status</strong>

                  <p>

                    <span
                      className={`badge ${getAppointmentStatusClass(
                        selectedAppointment.status
                      )}`}
                    >
                      {selectedAppointment.status}
                    </span>

                  </p>
                </div>

              </div>

              {selectedAppointment.status ===
                "Scheduled" && (

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() =>
                    handleCancel(
                      selectedAppointment
                    )
                  }
                >
                  Cancel Appointment
                </button>

              )}

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default AppointmentList;