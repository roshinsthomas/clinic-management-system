import { useEffect, useState } from "react";

function CreateBill({ onBack }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("access_token");

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        appointmentsResponse,
        patientsResponse,
        doctorsResponse,
        billsResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE}/api/receptionist/appointments/`,
          {
            headers,
          }
        ),

        fetch(
          `${API_BASE}/api/receptionist/patients/`,
          {
            headers,
          }
        ),

        fetch(
          `${API_BASE}/api/doctors/`,
          {
            headers,
          }
        ),

        fetch(
          `${API_BASE}/api/receptionist/consultation-bills/`,
          {
            headers,
          }
        ),
      ]);

      if (!appointmentsResponse.ok) {
        throw new Error("Failed to load appointments.");
      }

      if (!patientsResponse.ok) {
        throw new Error("Failed to load patients.");
      }

      if (!doctorsResponse.ok) {
        throw new Error("Failed to load doctors.");
      }

      if (!billsResponse.ok) {
        throw new Error("Failed to load consultation bills.");
      }

      const appointmentsData =
        await appointmentsResponse.json();

      const patientsData =
        await patientsResponse.json();

      const doctorsData =
        await doctorsResponse.json();

      const billsData =
        await billsResponse.json();

      setAppointments(
        Array.isArray(appointmentsData)
          ? appointmentsData
          : appointmentsData.results || []
      );

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

      setBills(
        Array.isArray(billsData)
          ? billsData
          : billsData.results || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FIND PATIENT
  // ============================================================

  const getPatient = (patientId) => {
    return patients.find(
      (patient) =>
        patient.patient_id === Number(patientId)
    );
  };

  // ============================================================
  // FIND DOCTOR
  // ============================================================

  const getDoctor = (doctorId) => {
    return doctors.find(
      (doctor) =>
        doctor.staff_id === Number(doctorId)
    );
  };

  // ============================================================
  // SELECTED APPOINTMENT
  // ============================================================

  const selectedAppointment = appointments.find(
    (appointment) =>
      appointment.appointment_id ===
      Number(appointmentId)
  );

  // ============================================================
  // SELECTED PATIENT
  // ============================================================

  const selectedPatient = selectedAppointment
    ? getPatient(selectedAppointment.patient)
    : null;

  // ============================================================
  // SELECTED DOCTOR
  // ============================================================

  const selectedDoctor = selectedAppointment
    ? getDoctor(selectedAppointment.doctor)
    : null;

  // ============================================================
  // CHECK WHETHER PATIENT ALREADY HAS A BILL
  // ============================================================

  const hasPreviousBill = selectedPatient
    ? bills.some(
        (bill) =>
          Number(bill.patient) ===
          Number(selectedPatient.patient_id)
      )
    : false;

  // ============================================================
  // PATIENT TYPE
  // ============================================================

  const patientType = selectedPatient
    ? hasPreviousBill
      ? "Existing Patient"
      : "New Patient"
    : "";

  // ============================================================
  // REGISTRATION FEE
  // ============================================================

  const registrationFee = selectedPatient
    ? hasPreviousBill
      ? 0
      : 500
    : 0;

  // ============================================================
  // CONSULTATION FEE
  // ============================================================

  const consultationFee = selectedDoctor?.consultation_fee
    ? Number(selectedDoctor.consultation_fee)
    : 0;

  // ============================================================
  // TOTAL AMOUNT
  // ============================================================

  const totalAmount =
    registrationFee + consultationFee;

  // ============================================================
  // CREATE BILL
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!appointmentId) {
      setError("Please select an appointment.");
      return;
    }

    if (!selectedAppointment) {
      setError("Selected appointment was not found.");
      return;
    }

    if (!selectedPatient) {
      setError("Patient information could not be found.");
      return;
    }

    if (!selectedDoctor) {
      setError("Doctor information could not be found.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/receptionist/consultation-bills/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            patient: selectedAppointment.patient,
            appointment:
              selectedAppointment.appointment_id,

            // Backend calculates the actual registration fee.
            // This value is intentionally not trusted.
            registration_fee: registrationFee,

            payment_status: paymentStatus,
          }),
        }
      );

      const responseText = await response.text();

      let responseData = {};

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = {
          detail: responseText,
        };
      }

      if (!response.ok) {
        throw new Error(
          responseData.detail ||
            responseData.error ||
            JSON.stringify(responseData)
        );
      }

      setSuccess(
        `Consultation bill #${responseData.bill_id} created successfully.`
      );

      // Add newly created bill to local state.
      setBills((previousBills) => [
        ...previousBills,
        responseData,
      ]);

      setAppointmentId("");
      setPaymentStatus("Pending");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // CLEAR FORM
  // ============================================================

  const handleClear = () => {
    setAppointmentId("");
    setPaymentStatus("Pending");
    setError("");
    setSuccess("");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 bg-light p-4">
        <div className="text-center mt-5">

          <div className="spinner-border text-primary"></div>

          <p className="mt-2">
            Loading appointments...
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">

      {/* Header */}
      <nav className="navbar navbar-dark bg-primary px-3 px-md-4">

        <div className="container-fluid">

          <span className="navbar-brand fw-bold">
            Consultation Billing
          </span>

          <button
            className="btn btn-light"
            onClick={onBack}
          >
            Back
          </button>

        </div>

      </nav>

      <div className="container py-4">

        {/* Page Heading */}
        <div className="mb-4">

          <h2 className="fw-bold">
            Create Consultation Bill
          </h2>

          <p className="text-muted">
            Generate a consultation bill for an appointment.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4">

            <form onSubmit={handleSubmit}>

              {/* Appointment */}
              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Appointment
                </label>

                <select
                  className="form-select"
                  value={appointmentId}
                  onChange={(e) => {
                    setAppointmentId(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                >

                  <option value="">
                    Select Appointment
                  </option>

                  {appointments
                    .filter((appointment) => {

                      const status = String(
                        appointment.status || ""
                      )
                        .trim()
                        .toLowerCase();

                      return status !== "cancelled";
                    })
                    .filter((appointment) => {

                      // Don't show appointments that
                      // already have a consultation bill.
                      return !bills.some(
                        (bill) =>
                          Number(bill.appointment) ===
                          Number(
                            appointment.appointment_id
                          )
                      );
                    })
                    .map((appointment) => (

                      <option
                        key={
                          appointment.appointment_id
                        }
                        value={
                          appointment.appointment_id
                        }
                      >

                        Appointment #
                        {appointment.appointment_id}

                        {" - "}

                        {appointment.appointment_date}

                        {" "}

                        {appointment.appointment_time}

                      </option>

                    ))}

                </select>

              </div>

              {/* Patient */}
              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Patient
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={
                    selectedPatient
                      ? `${selectedPatient.first_name} ${selectedPatient.last_name} (ID: ${selectedPatient.patient_id})`
                      : ""
                  }
                  placeholder="Patient will appear automatically"
                  readOnly
                />

              </div>

              {/* Patient Type */}
              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Patient Type
                </label>

                <input
                  type="text"
                  className={`form-control fw-semibold ${
                    patientType === "New Patient"
                      ? "text-primary"
                      : patientType === "Existing Patient"
                      ? "text-success"
                      : ""
                  }`}
                  value={patientType}
                  placeholder="Patient type"
                  readOnly
                />

                {patientType === "New Patient" && (
                  <small className="text-muted">
                    First consultation for this patient.
                  </small>
                )}

                {patientType === "Existing Patient" && (
                  <small className="text-muted">
                    Previous consultation bill found.
                  </small>
                )}

              </div>

              {/* Doctor */}
              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Doctor
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={
                    selectedDoctor
                      ? `${selectedDoctor.first_name || ""} ${selectedDoctor.last_name || ""}`
                      : ""
                  }
                  placeholder="Doctor will appear automatically"
                  readOnly
                />

              </div>

              {/* Registration Fee */}
              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Registration Fee
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={
                    selectedPatient
                      ? `₹ ${registrationFee.toFixed(2)}`
                      : ""
                  }
                  placeholder="Automatically calculated"
                  readOnly
                />

                {patientType === "New Patient" && (
                  <small className="text-muted">
                    ₹500 registration fee applies to the
                    patient's first consultation.
                  </small>
                )}

                {patientType === "Existing Patient" && (
                  <small className="text-muted">
                    No registration fee for an existing patient.
                  </small>
                )}

              </div>

              {/* Consultation Fee */}
              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Consultation Fee
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={
                    selectedAppointment
                      ? `₹ ${consultationFee.toFixed(2)}`
                      : ""
                  }
                  placeholder="Automatically calculated"
                  readOnly
                />

              </div>

              {/* Total */}
              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Total Amount
                </label>

                <input
                  type="text"
                  className="form-control fw-bold"
                  value={
                    selectedAppointment
                      ? `₹ ${totalAmount.toFixed(2)}`
                      : ""
                  }
                  placeholder="Total amount"
                  readOnly
                />

              </div>

              {/* Payment Status */}
              <div className="mb-4">

                <label className="form-label fw-semibold">
                  Payment Status
                </label>

                <select
                  className="form-select"
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(e.target.value)
                  }
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>

              {/* Buttons */}
              <div className="d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Creating..."
                    : "Create Bill"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
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

export default CreateBill;