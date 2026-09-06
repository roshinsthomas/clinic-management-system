import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function ReceiptBill({ receiptData, onBack }) {
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [department, setDepartment] = useState(null);
  const [appointment, setAppointment] = useState(
    receiptData?.appointment || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const bill = receiptData?.bill || null;

  useEffect(() => {
    loadReceiptDetails();
  }, [receiptData]);

  const loadReceiptDetails = async () => {
    if (!bill) {
      setLoading(false);
      setError("Receipt information is not available.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      let appointmentData = receiptData?.appointment || null;

      if (!appointmentData && bill.appointment) {
        const appointmentResponse = await fetch(
          `${API}/api/receptionist/appointments/${bill.appointment}/`,
          { headers }
        );

        if (appointmentResponse.ok) {
          appointmentData = await appointmentResponse.json();
        }
      }

      if (!appointmentData) {
        throw new Error("Appointment information is not available.");
      }

      setAppointment(appointmentData);

      const [patientsResponse, doctorsResponse, departmentsResponse] =
        await Promise.all([
          fetch(`${API}/api/receptionist/patients/`, { headers }),
          fetch(`${API}/api/doctors/`, { headers }),
          fetch(`${API}/api/departments/`, { headers }),
        ]);

      if (!patientsResponse.ok) {
        throw new Error("Failed to fetch patient details.");
      }

      if (!doctorsResponse.ok) {
        throw new Error("Failed to fetch doctor details.");
      }

      if (!departmentsResponse.ok) {
        throw new Error("Failed to fetch department details.");
      }

      const patientsData = await patientsResponse.json();
      const doctorsData = await doctorsResponse.json();
      const departmentsData = await departmentsResponse.json();

      const patients = Array.isArray(patientsData)
        ? patientsData
        : patientsData.results || [];

      const doctors = Array.isArray(doctorsData)
        ? doctorsData
        : doctorsData.results || [];

      const departments = Array.isArray(departmentsData)
        ? departmentsData
        : departmentsData.results || [];

      setPatient(
        patients.find(
          (item) =>
            String(item.patient_id) === String(bill.patient)
        ) || null
      );

      setDoctor(
        doctors.find(
          (item) =>
            String(item.staff_id) === String(appointmentData.doctor)
        ) || null
      );

      setDepartment(
        departments.find(
          (item) =>
            String(item.department_id) ===
            String(appointmentData.department)
        ) || null
      );
    } catch (err) {
      setError(err.message || "Failed to load receipt details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) {
      return "-";
    }

    const [hours, minutes] = timeString.slice(0, 5).split(":").map(Number);

    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${
      hours >= 12 ? "PM" : "AM"
    }`;
  };

  const getAppointmentTypeLabel = (type) => {
    if (type === "WALK_IN") {
      return "Walk-in";
    }

    if (type === "PRIOR_BOOKING") {
      return "Prior Booking";
    }

    return type || "-";
  };

  const getDoctorName = () => {
    if (!doctor) {
      return appointment?.doctor
        ? `Doctor #${appointment.doctor}`
        : "-";
    }

    const firstName = doctor.user__first_name || doctor.first_name || "";
    const lastName = doctor.user__last_name || doctor.last_name || "";

    return `Dr. ${firstName} ${lastName}`.trim();
  };

  const getDepartmentName = () => {
    if (!department) {
      return appointment?.department
        ? `Department #${appointment.department}`
        : "-";
    }

    return (
      department.department_name ||
      department.name ||
      `Department #${department.department_id}`
    );
  };

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 bg-light p-0">
        <nav className="navbar navbar-dark bg-primary px-3 px-md-4">
          <div className="container-fluid">
            <span className="navbar-brand fw-bold">
              Clinic Management System
            </span>
            <span className="text-white fw-semibold">
              Receipt Bill
            </span>
          </div>
        </nav>

        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2 mb-0">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container-fluid min-vh-100 bg-light p-0">
        <div className="container py-4">
          <div className="alert alert-danger">{error}</div>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const registrationFee = Number(bill.registration_fee) || 0;
  const consultationFee = Number(bill.consultation_fee) || 0;
  const totalAmount = Number(bill.total_amount) || 0;
  const patientName = patient
    ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
    : `Patient #${bill.patient}`;

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">
      <nav className="navbar navbar-dark bg-primary px-3 px-md-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            Clinic Management System
          </span>
          <span className="text-white fw-semibold">Receipt Bill</span>
        </div>
      </nav>

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Receipt Bill</h2>
            <p className="text-muted mb-0">
              Payment receipt for the completed consultation.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="alert alert-warning">{error}</div>}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold mb-1">Consultation Receipt</h3>
              <p className="text-muted mb-0">Clinic Management System</p>
            </div>

            <div className="row g-4">
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <small className="text-muted">Bill ID</small>
                  <div className="fw-semibold">#{bill.bill_id}</div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Patient</small>
                  <div className="fw-semibold">{patientName}</div>
                  <small className="text-muted">Patient ID: {bill.patient}</small>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Doctor</small>
                  <div className="fw-semibold">{getDoctorName()}</div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Department</small>
                  <div className="fw-semibold">{getDepartmentName()}</div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <small className="text-muted">Appointment ID</small>
                  <div className="fw-semibold">
                    #{appointment?.appointment_id || bill.appointment}
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Appointment Type</small>
                  <div className="fw-semibold">
                    {getAppointmentTypeLabel(appointment?.appointment_type)}
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Appointment Date</small>
                  <div className="fw-semibold">
                    {formatDate(appointment?.appointment_date)}
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Appointment Time</small>
                  <div className="fw-semibold">
                    {formatTime(appointment?.appointment_time)}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="row justify-content-end">
              <div className="col-12 col-md-6">
                <div className="d-flex justify-content-between py-2">
                  <span>Registration Fee</span>
                  <span>₹{registrationFee.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between py-2">
                  <span>Consultation Fee</span>
                  <span>₹{consultationFee.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between py-3 border-top mt-2">
                  <span className="fw-bold">Total Amount</span>
                  <span className="fw-bold fs-4">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2">
                  <span>Payment Status</span>
                  <span className="badge bg-success">
                    {bill.payment_status}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2">
                  <span>Token Number</span>
                  <span className="fw-bold fs-5">
                    {appointment?.token_no || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="alert alert-success mt-4 mb-0 text-center">
              Payment completed successfully. The appointment token has been generated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptBill;
