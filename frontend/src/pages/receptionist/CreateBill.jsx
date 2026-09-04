import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function CreateBill({ onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);

  const [formData, setFormData] = useState({
    appointment: "",
    patient: "",
    payment_status: "Pending",
  });

  const [consultationFee, setConsultationFee] =
    useState(0);

  const [totalAmount, setTotalAmount] =
    useState(0);

  const [patientType, setPatientType] =
    useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [existingBill, setExistingBill] =
    useState(null);

  const [createdBill, setCreatedBill] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const token =
    localStorage.getItem("access_token");

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getTodayString = () => {
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

  const isPastDate = (dateString) => {
    if (!dateString) {
      return true;
    }

    return (
      dateString <
      getTodayString()
    );
  };

  // =========================================================
  // BILLABLE APPOINTMENT
  // ONLY TODAY + FUTURE
  // ONLY SCHEDULED
  // =========================================================

  const isBillableAppointment = (
    appointment
  ) => {
    if (!appointment) {
      return false;
    }

    const status = String(
      appointment.status || ""
    )
      .trim()
      .toLowerCase();

    return (
      status === "scheduled" &&
      !isPastDate(
        appointment.appointment_date
      )
    );
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchData();
  }, []);

  // =========================================================
  // TOTAL
  // =========================================================

  useEffect(() => {
    const registration =
      patientType === "New Patient"
        ? 500
        : 0;

    setTotalAmount(
      registration +
        (Number(
          consultationFee
        ) || 0)
    );
  }, [
    patientType,
    consultationFee,
  ]);

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization:
          `Bearer ${token}`,
      };

      const [
        appointmentsResponse,
        patientsResponse,
        doctorsResponse,
        billsResponse,
      ] = await Promise.all([
        fetch(
          `${API}/api/receptionist/appointments/`,
          { headers }
        ),

        fetch(
          `${API}/api/receptionist/patients/`,
          { headers }
        ),

        fetch(
          `${API}/api/doctors/`,
          { headers }
        ),

        fetch(
          `${API}/api/receptionist/consultation-bills/`,
          { headers }
        ),
      ]);

      if (!appointmentsResponse.ok) {
        throw new Error(
          "Failed to fetch appointments."
        );
      }

      if (!patientsResponse.ok) {
        throw new Error(
          "Failed to fetch patients."
        );
      }

      if (!doctorsResponse.ok) {
        throw new Error(
          "Failed to fetch doctors."
        );
      }

      if (!billsResponse.ok) {
        throw new Error(
          "Failed to fetch consultation bills."
        );
      }

      const appointmentsData =
        await appointmentsResponse.json();

      const patientsData =
        await patientsResponse.json();

      const doctorsData =
        await doctorsResponse.json();

      const billsData =
        await billsResponse.json();

      const allAppointments =
        Array.isArray(
          appointmentsData
        )
          ? appointmentsData
          : appointmentsData.results ||
            [];

      const allPatients =
        Array.isArray(
          patientsData
        )
          ? patientsData
          : patientsData.results ||
            [];

      const allDoctors =
        Array.isArray(
          doctorsData
        )
          ? doctorsData
          : doctorsData.results ||
            [];

      const allBills =
        Array.isArray(
          billsData
        )
          ? billsData
          : billsData.results ||
            [];

      // -------------------------------------------------------
      // ONLY TODAY + FUTURE SCHEDULED APPOINTMENTS
      // -------------------------------------------------------

      const eligibleAppointments =
        allAppointments
          .filter(
            isBillableAppointment
          )
          .sort((a, b) => {
            const aValue =
              `${a.appointment_date || ""} ${
                a.appointment_time || ""
              }`;

            const bValue =
              `${b.appointment_date || ""} ${
                b.appointment_time || ""
              }`;

            return aValue.localeCompare(
              bValue
            );
          });

      setAppointments(
        eligibleAppointments
      );

      setPatients(
        allPatients
      );

      setDoctors(
        allDoctors
      );

      setBills(
        allBills
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load billing information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FIND EXISTING BILL
  // =========================================================

  const getBillAppointmentId = (
    bill
  ) => {
    if (!bill) {
      return null;
    }

    if (
      typeof bill.appointment ===
      "object"
    ) {
      return (
        bill.appointment
          ?.appointment_id ??
        bill.appointment?.id
      );
    }

    return bill.appointment;
  };

  const getBillId = (
    bill
  ) => {
    return (
      bill?.bill_id ??
      bill?.id ??
      null
    );
  };

  const findExistingBill = (
    appointmentId
  ) => {
    return bills.find(
      (bill) =>
        String(
          getBillAppointmentId(
            bill
          )
        ) ===
        String(
          appointmentId
        )
    );
  };

  // =========================================================
  // PATIENT / DOCTOR
  // =========================================================

  const getPatient = (
    patientId
  ) => {
    return patients.find(
      (patient) =>
        String(
          patient.patient_id
        ) ===
        String(patientId)
    );
  };

  const getDoctor = (
    doctorId
  ) => {
    return doctors.find(
      (doctor) =>
        String(
          doctor.staff_id
        ) ===
        String(doctorId)
    );
  };

  const getPatientName = (
    patientId
  ) => {
    const patient =
      getPatient(patientId);

    if (!patient) {
      return `Patient #${patientId}`;
    }

    return `${patient.first_name || ""} ${
      patient.last_name || ""
    }`.trim();
  };

  const getDoctorName = (
    doctorId
  ) => {
    const doctor =
      getDoctor(doctorId);

    if (!doctor) {
      return `Doctor #${doctorId}`;
    }

    const firstName =
      doctor.user__first_name ||
      doctor.first_name ||
      "";

    const lastName =
      doctor.user__last_name ||
      doctor.last_name ||
      "";

    return `${firstName} ${lastName}`.trim();
  };

  // =========================================================
  // DATE / TIME
  // =========================================================

  const formatDate = (
    dateString
  ) => {
    if (!dateString) {
      return "-";
    }

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (
    timeString
  ) => {
    if (!timeString) {
      return "-";
    }

    const [
      hours,
      minutes,
    ] = timeString
      .slice(0, 5)
      .split(":")
      .map(Number);

    return `${hours % 12 || 12}:${String(
      minutes
    ).padStart(2, "0")} ${
      hours >= 12 ? "PM" : "AM"
    }`;
  };

  const getAppointmentTypeLabel =
    (type) => {
      if (type === "WALK_IN") {
        return "Walk-in";
      }

      if (
        type === "PRIOR_BOOKING"
      ) {
        return "Prior Booking";
      }

      return type || "-";
    };

  // =========================================================
  // APPOINTMENT CHANGE
  // =========================================================

  const handleAppointmentChange =
    (e) => {
      const appointmentId =
        e.target.value;

      setError("");
      setMessage("");
      setCreatedBill(null);

      if (!appointmentId) {
        setFormData({
          appointment: "",
          patient: "",
          payment_status:
            "Pending",
        });

        setSelectedAppointment(
          null
        );

        setExistingBill(null);
        setConsultationFee(0);
        setTotalAmount(0);
        setPatientType("");

        return;
      }

      const appointment =
        appointments.find(
          (item) =>
            String(
              item.appointment_id
            ) ===
            String(
              appointmentId
            )
        );

      if (!appointment) {
        setError(
          "Appointment not found."
        );
        return;
      }

      if (
        !isBillableAppointment(
          appointment
        )
      ) {
        setError(
          "Only current or future scheduled appointments can be billed."
        );
        return;
      }

      const patientId =
        appointment.patient;

      const doctor =
        getDoctor(
          appointment.doctor
        );

      const fee =
        doctor?.consultation_fee !=
        null
          ? Number(
              doctor.consultation_fee
            )
          : 0;

      setSelectedAppointment(
        appointment
      );

      // -------------------------------------------------------
      // CHECK EXISTING BILL
      // -------------------------------------------------------

      const bill =
        findExistingBill(
          appointmentId
        );

      if (bill) {
        setExistingBill(
          bill
        );

        setFormData({
          appointment:
            String(
              appointmentId
            ),

          patient:
            String(
              patientId
            ),

          payment_status:
            bill.payment_status ||
            "Pending",
        });

        setConsultationFee(
          Number(
            bill.consultation_fee
          ) || fee
        );

        setTotalAmount(
          Number(
            bill.total_amount
          ) ||
            fee
        );

        setPatientType(
          Number(
            bill.registration_fee
          ) > 0
            ? "New Patient"
            : "Existing Patient"
        );

        return;
      }

      // -------------------------------------------------------
      // NEW BILL
      // -------------------------------------------------------

      setExistingBill(
        null
      );

      setFormData({
        appointment:
          String(
            appointmentId
          ),

        patient:
          String(
            patientId
          ),

        payment_status:
          "Pending",
      });

      setConsultationFee(
        fee
      );

      /*
        The backend is authoritative
        for the actual registration fee.
      */

      setPatientType(
        "New Patient"
      );
    };

  // =========================================================
  // PAYMENT STATUS
  // =========================================================

  const handlePaymentStatusChange =
    (e) => {
      setFormData(
        (previous) => ({
          ...previous,
          payment_status:
            e.target.value,
        })
      );

      setError("");
      setMessage("");
    };

  // =========================================================
  // SAVE BILL
  // =========================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.appointment) {
      setError(
        "Please select an appointment."
      );
      return;
    }

    if (!formData.patient) {
      setError(
        "Patient information is missing."
      );
      return;
    }

    if (
      !selectedAppointment ||
      !isBillableAppointment(
        selectedAppointment
      )
    ) {
      setError(
        "Only current or future scheduled appointments can be billed."
      );
      return;
    }

    setSubmitting(true);

    try {
      const headers = {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      };

      let response;

      // =====================================================
      // EXISTING BILL → PATCH
      // =====================================================

      if (existingBill) {
        const billId =
          getBillId(
            existingBill
          );

        if (!billId) {
          throw new Error(
            "Existing bill ID is missing."
          );
        }

        response =
          await fetch(
            `${API}/api/receptionist/consultation-bills/${billId}/`,
            {
              method: "PATCH",

              headers,

              body:
                JSON.stringify({
                  patient:
                    Number(
                      formData.patient
                    ),

                  appointment:
                    Number(
                      formData.appointment
                    ),

                  payment_status:
                    formData.payment_status,
                }),
            }
          );
      }

      // =====================================================
      // NEW BILL → POST
      // =====================================================

      else {
        response =
          await fetch(
            `${API}/api/receptionist/consultation-bills/`,
            {
              method: "POST",

              headers,

              body:
                JSON.stringify({
                  patient:
                    Number(
                      formData.patient
                    ),

                  appointment:
                    Number(
                      formData.appointment
                    ),

                  payment_status:
                    formData.payment_status,
                }),
            }
          );
      }

      const data =
        await response.json();

      if (!response.ok) {
        const backendErrors =
          data &&
          typeof data ===
            "object"
            ? Object.entries(
                data
              )
                .map(
                  ([
                    field,
                    messages,
                  ]) =>
                    `${field}: ${
                      Array.isArray(
                        messages
                      )
                        ? messages.join(
                            ", "
                          )
                        : messages
                    }`
                )
                .join(" | ")
            : "";

        throw new Error(
          backendErrors ||
            "Failed to save consultation bill."
        );
      }

      // =====================================================
      // SAVE BILL DATA
      // =====================================================

      setCreatedBill(
        data
      );

      setPatientType(
        Number(
          data.registration_fee
        ) > 0
          ? "New Patient"
          : "Existing Patient"
      );

      setConsultationFee(
        Number(
          data.consultation_fee
        ) ||
          consultationFee
      );

      setTotalAmount(
        Number(
          data.total_amount
        ) ||
          totalAmount
      );

      // =====================================================
      // VERY IMPORTANT
      //
      // The bill response does NOT contain
      // the updated appointment token.
      //
      // So fetch the appointment again.
      // =====================================================

      const appointmentResponse =
        await fetch(
          `${API}/api/receptionist/appointments/${formData.appointment}/`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (
        appointmentResponse.ok
      ) {
        const updatedAppointment =
          await appointmentResponse.json();

        // Update the appointment displayed
        // in Appointment Summary.
        setSelectedAppointment(
          updatedAppointment
        );

        // Update appointment in dropdown data too.
        setAppointments(
          (previous) =>
            previous.map(
              (appointment) =>
                String(
                  appointment.appointment_id
                ) ===
                String(
                  updatedAppointment.appointment_id
                )
                  ? updatedAppointment
                  : appointment
            )
        );
      }

      // =====================================================
      // UPDATE LOCAL BILL LIST
      // =====================================================

      setBills(
        (previous) => {
          if (existingBill) {
            return previous.map(
              (bill) =>
                String(
                  getBillId(bill)
                ) ===
                String(
                  getBillId(
                    existingBill
                  )
                )
                  ? data
                  : bill
            );
          }

          return [
            ...previous,
            data,
          ];
        }
      );

      // Make the saved bill the current existing bill.
      setExistingBill(
        data
      );

      // =====================================================
      // SUCCESS MESSAGE
      // =====================================================

      if (
        formData.payment_status ===
        "Completed"
      ) {
        setMessage(
          existingBill
            ? "Consultation bill updated successfully. Payment is completed and the appointment token has been generated."
            : "Consultation bill created successfully. Payment is completed and the appointment token has been generated."
        );
      } else {
        setMessage(
          existingBill
            ? "Consultation bill updated successfully."
            : "Consultation bill created successfully."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to save consultation bill."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // PRINT BILL
  // =========================================================

  const printBill = () => {
    if (
      !createdBill ||
      !selectedAppointment
    ) {
      return;
    }

    const registration =
      Number(
        createdBill.registration_fee
      ) || 0;

    const consultation =
      Number(
        createdBill.consultation_fee
      ) || 0;

    const total =
      Number(
        createdBill.total_amount
      ) ||
      registration +
        consultation;

    const patientName =
      getPatientName(
        selectedAppointment.patient
      );

    const doctorName =
      getDoctorName(
        selectedAppointment.doctor
      );

    const win =
      window.open(
        "",
        "_blank",
        "width=700,height=800"
      );

    if (!win) {
      setError(
        "Please allow pop-ups to print the consultation bill."
      );
      return;
    }

    win.document.write(`
      <!doctype html>
      <html>
      <head>
        <title>
          Consultation Bill #${createdBill.bill_id}
        </title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #222;
          }

          .receipt {
            max-width: 620px;
            margin: auto;
            border: 1px solid #ddd;
            padding: 28px;
          }

          h2 {
            text-align: center;
            margin: 0 0 5px;
          }

          .sub {
            text-align: center;
            color: #666;
            margin-bottom: 25px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }

          .total {
            font-size: 20px;
            font-weight: bold;
            border-top: 2px solid #222;
            margin-top: 10px;
            padding-top: 12px;
          }

          .status {
            font-weight: bold;
          }

          .footer {
            text-align: center;
            margin-top: 25px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>

      <body>

        <div class="receipt">

          <h2>
            Consultation Bill
          </h2>

          <div class="sub">
            Clinic Management System
          </div>

          <div class="row">
            <span>Bill ID</span>
            <span>
              #${createdBill.bill_id}
            </span>
          </div>

          <div class="row">
            <span>Patient</span>
            <span>
              ${patientName}
            </span>
          </div>

          <div class="row">
            <span>Patient Type</span>
            <span>
              ${
                registration > 0
                  ? "New Patient"
                  : "Existing Patient"
              }
            </span>
          </div>

          <div class="row">
            <span>Appointment ID</span>
            <span>
              #${selectedAppointment.appointment_id}
            </span>
          </div>

          <div class="row">
            <span>Doctor</span>
            <span>
              ${doctorName}
            </span>
          </div>

          <div class="row">
            <span>Date</span>
            <span>
              ${formatDate(
                selectedAppointment.appointment_date
              )}
            </span>
          </div>

          <div class="row">
            <span>Time</span>
            <span>
              ${formatTime(
                selectedAppointment.appointment_time
              )}
            </span>
          </div>

          <div class="row">
            <span>Registration Fee</span>
            <span>
              ₹${registration.toFixed(2)}
            </span>
          </div>

          <div class="row">
            <span>Consultation Fee</span>
            <span>
              ₹${consultation.toFixed(2)}
            </span>
          </div>

          <div class="row total">
            <span>Total</span>
            <span>
              ₹${total.toFixed(2)}
            </span>
          </div>

          <div class="row">
            <span>Payment Status</span>
            <span class="status">
              ${createdBill.payment_status}
            </span>
          </div>

          <div class="footer">
            Thank you
          </div>

        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>

      </body>
      </html>
    `);

    win.document.close();
  };

  // =========================================================
  // BILLABLE APPOINTMENTS
  // =========================================================

  const billableAppointments =
    appointments.filter(
      isBillableAppointment
    );

  // =========================================================
  // REGISTRATION FEE
  // =========================================================

  const registrationFee =
    existingBill
      ? Number(
          existingBill.registration_fee
        ) || 0
      : patientType ===
        "New Patient"
      ? 500
      : 0;

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
            Create Consultation Bill
          </span>

        </div>

      </nav>

      <div className="container py-4">

        {/* Heading */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              Create Consultation Bill
            </h2>

            <p className="text-muted mb-0">
              Create a consultation bill for a scheduled appointment.
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

        {/* Success */}

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {loading ? (

          <div className="text-center py-5">

            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-muted mt-2">
              Loading appointments...
            </p>

          </div>

        ) : (

          <div className="row g-4">

            {/* =================================================
                BILL INFORMATION
            ================================================= */}

            <div className="col-12 col-lg-7">

              <div className="card border-0 shadow-sm">

                <div className="card-body p-4">

                  <h5 className="fw-bold mb-4">
                    Bill Information
                  </h5>

                  <form onSubmit={handleSubmit}>

                    {/* Appointment */}

                    <div className="mb-4">

                      <label className="form-label fw-semibold">
                        Appointment{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <select
                        className="form-select"
                        value={
                          formData.appointment
                        }
                        onChange={
                          handleAppointmentChange
                        }
                        required
                      >

                        <option value="">
                          Select Appointment
                        </option>

                        {billableAppointments.map(
                          (appointment) => (

                            <option
                              key={
                                appointment.appointment_id
                              }
                              value={
                                appointment.appointment_id
                              }
                            >
                              #
                              {
                                appointment.appointment_id
                              }{" "}
                              -{" "}
                              {getPatientName(
                                appointment.patient
                              )}{" "}
                              -{" "}
                              {formatDate(
                                appointment.appointment_date
                              )}{" "}
                              -{" "}
                              {formatTime(
                                appointment.appointment_time
                              )}
                            </option>

                          )
                        )}

                      </select>

                      {billableAppointments.length ===
                        0 && (
                        <small className="text-muted d-block mt-2">
                          No current or future scheduled appointments are available for billing.
                        </small>
                      )}

                    </div>

                    {/* Existing Bill */}

                    {existingBill && (

                      <div className="alert alert-info">

                        <div className="fw-bold">
                          Existing Bill
                        </div>

                        <div>
                          Bill ID: #
                          {
                            getBillId(
                              existingBill
                            )
                          }
                        </div>

                      </div>

                    )}

                    {/* Patient */}

                    {formData.patient && (

                      <div className="mb-4">

                        <label className="form-label fw-semibold">
                          Patient
                        </label>

                        <input
                          className="form-control"
                          value={
                            getPatientName(
                              formData.patient
                            )
                          }
                          disabled
                        />

                      </div>

                    )}

                    {/* Patient Type */}

                    {patientType && (

                      <div className="mb-4">

                        <label className="form-label fw-semibold">
                          Patient Type
                        </label>

                        <div>

                          <span className="badge bg-dark">
                            {patientType}
                          </span>

                        </div>

                      </div>

                    )}

                    {/* Consultation Fee */}

                    <div className="mb-4">

                      <label className="form-label fw-semibold">
                        Consultation Fee
                      </label>

                      <div className="input-group">

                        <span className="input-group-text">
                          ₹
                        </span>

                        <input
                          type="number"
                          className="form-control"
                          value={
                            consultationFee
                          }
                          disabled
                        />

                      </div>

                    </div>

                    {/* Registration Fee */}

                    <div className="mb-4">

                      <label className="form-label fw-semibold">
                        Registration Fee
                      </label>

                      <div className="input-group">

                        <span className="input-group-text">
                          ₹
                        </span>

                        <input
                          type="number"
                          className="form-control"
                          value={
                            registrationFee
                          }
                          disabled
                        />

                      </div>

                    </div>

                    {/* Payment Status */}

                    <div className="mb-4">

                      <label className="form-label fw-semibold">
                        Payment Status{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <select
                        className="form-select"
                        value={
                          formData.payment_status
                        }
                        onChange={
                          handlePaymentStatusChange
                        }
                        required
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                      </select>

                    </div>

                    {/* Total */}

                    <div className="alert alert-primary">

                      <div className="d-flex justify-content-between align-items-center">

                        <span className="fw-semibold">
                          Total Amount
                        </span>

                        <span className="fs-4 fw-bold">
                          ₹
                          {totalAmount.toFixed(
                            2
                          )}
                        </span>

                      </div>

                    </div>

                    {/* Existing Saved Bill */}

                    {createdBill && (

                      <div className="alert alert-success mt-4">

                        <div className="fw-bold mb-1">
                          Bill Saved Successfully
                        </div>

                        <div>
                          Bill ID: #
                          {
                            createdBill.bill_id
                          }
                        </div>

                        <div>
                          Payment Status:{" "}
                          {
                            createdBill.payment_status
                          }
                        </div>

                        <button
                          type="button"
                          className="btn btn-dark mt-3"
                          onClick={
                            printBill
                          }
                        >
                          🧾 Print Bill
                        </button>

                      </div>

                    )}

                    {/* Buttons */}

                    <div className="d-flex justify-content-end gap-2 mt-4">

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={
                          onBack
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          submitting ||
                          !formData.appointment
                        }
                      >

                        {submitting
                          ? "Saving..."
                          : "Save"}

                      </button>

                    </div>

                  </form>

                </div>

              </div>

            </div>

            {/* =================================================
                APPOINTMENT SUMMARY
            ================================================= */}

            <div className="col-12 col-lg-5">

              <div className="card border-0 shadow-sm">

                <div className="card-body p-4">

                  <h5 className="fw-bold mb-4">
                    Appointment Summary
                  </h5>

                  {!selectedAppointment ? (

                    <div className="text-center py-5">

                      <p className="text-muted mb-0">
                        Select an appointment to
                        view its details.
                      </p>

                    </div>

                  ) : (

                    <div>

                      {/* Appointment ID */}

                      <div className="mb-3">

                        <small className="text-muted">
                          Appointment ID
                        </small>

                        <div className="fw-semibold">
                          #
                          {
                            selectedAppointment.appointment_id
                          }
                        </div>

                      </div>

                      {/* Patient */}

                      <div className="mb-3">

                        <small className="text-muted">
                          Patient
                        </small>

                        <div className="fw-semibold">
                          {getPatientName(
                            selectedAppointment.patient
                          )}
                        </div>

                        <small className="text-muted">
                          Patient ID:{" "}
                          {
                            selectedAppointment.patient
                          }
                        </small>

                      </div>

                      {/* Doctor */}

                      <div className="mb-3">

                        <small className="text-muted">
                          Doctor
                        </small>

                        <div className="fw-semibold">
                          {getDoctorName(
                            selectedAppointment.doctor
                          )}
                        </div>

                      </div>

                      {/* Date */}

                      <div className="mb-3">

                        <small className="text-muted">
                          Appointment Date
                        </small>

                        <div className="fw-semibold">
                          {formatDate(
                            selectedAppointment.appointment_date
                          )}
                        </div>

                      </div>

                      {/* Time */}

                      <div className="mb-3">

                        <small className="text-muted">
                          Appointment Time
                        </small>

                        <div className="fw-semibold">
                          {formatTime(
                            selectedAppointment.appointment_time
                          )}
                        </div>

                      </div>

                      {/* Type */}

                      <div className="mb-3">

                        <small className="text-muted">
                          Appointment Type
                        </small>

                        <div>

                          <span className="badge bg-info text-dark">
                            {getAppointmentTypeLabel(
                              selectedAppointment.appointment_type
                            )}
                          </span>

                        </div>

                      </div>

                      {/* Token */}

                      <div className="mb-3">

                        <small className="text-muted">
                          Token Number
                        </small>

                        <div className="fw-semibold">

                          {selectedAppointment.token_no ||
                            "Not Generated"}

                        </div>

                      </div>

                      {/* Appointment Status */}

                      <div>

                        <small className="text-muted">
                          Appointment Status
                        </small>

                        <div>

                          <span className="badge bg-primary">
                            {
                              selectedAppointment.status
                            }
                          </span>

                        </div>

                      </div>

                    </div>

                  )}

                </div>

              </div>

             

              

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default CreateBill;