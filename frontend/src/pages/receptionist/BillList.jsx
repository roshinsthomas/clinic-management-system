import { useEffect, useState } from "react";

function BillList({ onBack }) {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [billIdFilter, setBillIdFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const [selectedBill, setSelectedBill] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        billsResponse,
        patientsResponse,
        appointmentsResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE}/api/receptionist/consultation-bills/`,
          { headers }
        ),

        fetch(
          `${API_BASE}/api/receptionist/patients/`,
          { headers }
        ),

        fetch(
          `${API_BASE}/api/receptionist/appointments/`,
          { headers }
        ),
      ]);

      if (!billsResponse.ok) {
        throw new Error("Failed to load consultation bills.");
      }

      if (!patientsResponse.ok) {
        throw new Error("Failed to load patients.");
      }

      if (!appointmentsResponse.ok) {
        throw new Error("Failed to load appointments.");
      }

      const billsText = await billsResponse.text();
      const patientsText = await patientsResponse.text();
      const appointmentsText =
        await appointmentsResponse.text();

      let billsData;
      let patientsData;
      let appointmentsData;

      try {
        billsData = JSON.parse(billsText);
      } catch {
        throw new Error(
          "Invalid response received while loading consultation bills."
        );
      }

      try {
        patientsData = JSON.parse(patientsText);
      } catch {
        throw new Error(
          "Invalid response received while loading patients."
        );
      }

      try {
        appointmentsData = JSON.parse(appointmentsText);
      } catch {
        throw new Error(
          "Invalid response received while loading appointments."
        );
      }

      setBills(
        Array.isArray(billsData)
          ? billsData
          : billsData.results || []
      );

      setPatients(
        Array.isArray(patientsData)
          ? patientsData
          : patientsData.results || []
      );

      setAppointments(
        Array.isArray(appointmentsData)
          ? appointmentsData
          : appointmentsData.results || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find patient
  const getPatient = (patientId) => {
    return patients.find(
      (patient) =>
        patient.patient_id === Number(patientId)
    );
  };

  // Find appointment
  const getAppointment = (appointmentId) => {
    return appointments.find(
      (appointment) =>
        appointment.appointment_id ===
        Number(appointmentId)
    );
  };

  // Get patient name
  const getPatientName = (patientId) => {
    const patient = getPatient(patientId);

    if (!patient) {
      return `Patient #${patientId}`;
    }

    return `${patient.first_name} ${patient.last_name}`;
  };

  // Get patient type
  const getPatientType = (bill) => {
    const registrationFee = Number(
      bill.registration_fee || 0
    );

    return registrationFee > 0
      ? "New Patient"
      : "Existing Patient";
  };

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const matchesBillId =
      billIdFilter === "" ||
      String(bill.bill_id).includes(billIdFilter);

    const normalizedPaymentStatus = String(
      bill.payment_status || ""
    )
      .trim()
      .toLowerCase();

    const normalizedFilter =
      paymentStatusFilter.trim().toLowerCase();

    const matchesPaymentStatus =
      paymentStatusFilter === "" ||
      normalizedPaymentStatus === normalizedFilter;

    return (
      matchesBillId &&
      matchesPaymentStatus
    );
  });

  // Clear filters
  const handleClearFilters = () => {
    setBillIdFilter("");
    setPaymentStatusFilter("");
  };

  // Status badge
  const getStatusBadge = (status) => {
    const normalizedStatus = String(status || "")
      .trim()
      .toLowerCase();

    if (normalizedStatus === "completed") {
      return (
        <span className="badge bg-success">
          Completed
        </span>
      );
    }

    if (normalizedStatus === "pending") {
      return (
        <span className="badge bg-warning text-dark">
          Pending
        </span>
      );
    }

    // Treat PAID as Completed for old existing records.
    if (normalizedStatus === "paid") {
      return (
        <span className="badge bg-success">
          Completed
        </span>
      );
    }

    return (
      <span className="badge bg-secondary">
        {status || "Unknown"}
      </span>
    );
  };

  // Patient type badge
  const getPatientTypeBadge = (bill) => {
    const patientType = getPatientType(bill);

    return (
      <span
        className="fw-semibold"
        style={{ color: "#000000" }}
      >
        {patientType}
      </span>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="container-fluid min-vh-100 bg-light p-4">
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"></div>

          <p className="mt-2">
            Loading consultation bills...
          </p>
        </div>
      </div>
    );
  }

  // View selected bill
  if (selectedBill) {
    const appointment = getAppointment(
      selectedBill.appointment
    );

    const patient = getPatient(
      selectedBill.patient
    );

    return (
      <div className="container-fluid min-vh-100 bg-light p-0">

        {/* Header */}
        <nav className="navbar navbar-dark bg-primary px-3 px-md-4">
          <div className="container-fluid">

            <span className="navbar-brand fw-bold">
              Consultation Bill
            </span>

            <button
              className="btn btn-light"
              onClick={() =>
                setSelectedBill(null)
              }
            >
              Back to Bills
            </button>

          </div>
        </nav>

        <div className="container py-4">

          <div className="mb-4">
            <h2 className="fw-bold">
              Bill #{selectedBill.bill_id}
            </h2>

            <p className="text-muted">
              Consultation billing details
            </p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              {/* Patient Details */}
              <h5 className="fw-bold mb-3">
                Patient Details
              </h5>

              <div className="row mb-4">

                <div className="col-md-4 mb-3">
                  <label className="text-muted">
                    Patient ID
                  </label>

                  <div className="fw-semibold">
                    {selectedBill.patient}
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="text-muted">
                    Patient Name
                  </label>

                  <div className="fw-semibold">
                    {patient
                      ? `${patient.first_name} ${patient.last_name}`
                      : `Patient #${selectedBill.patient}`}
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="text-muted">
                    Patient Type
                  </label>

                  <div className="mt-1">
                    {getPatientTypeBadge(selectedBill)}
                  </div>
                </div>

              </div>

              <hr />

              {/* Appointment Details */}
              <h5 className="fw-bold mb-3 mt-4">
                Appointment Details
              </h5>

              <div className="row mb-4">

                <div className="col-md-4 mb-3">
                  <label className="text-muted">
                    Appointment ID
                  </label>

                  <div className="fw-semibold">
                    {selectedBill.appointment}
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="text-muted">
                    Appointment Date
                  </label>

                  <div className="fw-semibold">
                    {appointment
                      ? appointment.appointment_date
                      : "—"}
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="text-muted">
                    Appointment Time
                  </label>

                  <div className="fw-semibold">
                    {appointment
                      ? appointment.appointment_time
                      : "—"}
                  </div>
                </div>

              </div>

              <hr />

              {/* Bill Details */}
              <h5 className="fw-bold mb-3 mt-4">
                Bill Details
              </h5>

              <div className="row">

                <div className="col-md-3 mb-3">
                  <label className="text-muted">
                    Patient Type
                  </label>

                  <div className="mt-1">
                    {getPatientTypeBadge(selectedBill)}
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="text-muted">
                    Registration Fee
                  </label>

                  <div className="fw-semibold">
                    ₹{" "}
                    {Number(
                      selectedBill.registration_fee || 0
                    ).toFixed(2)}
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="text-muted">
                    Consultation Fee
                  </label>

                  <div className="fw-semibold">
                    ₹{" "}
                    {Number(
                      selectedBill.consultation_fee || 0
                    ).toFixed(2)}
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="text-muted">
                    Total Amount
                  </label>

                  <div className="fw-bold fs-5">
                    ₹{" "}
                    {Number(
                      selectedBill.total_amount || 0
                    ).toFixed(2)}
                  </div>
                </div>

              </div>

              <div className="row mt-2">

                <div className="col-md-6 mb-3">
                  <label className="text-muted">
                    Payment Status
                  </label>

                  <div className="mt-1">
                    {getStatusBadge(
                      selectedBill.payment_status
                    )}
                  </div>
                </div>

              </div>

              {/* Token */}
              <div className="alert alert-info mt-3">
                <strong>Appointment Token:</strong>{" "}
                {appointment?.token_no ||
                  "Not Generated"}
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 bg-light p-0">

      {/* Header */}
      <nav className="navbar navbar-dark bg-primary px-3 px-md-4">
        <div className="container-fluid">

          <span className="navbar-brand fw-bold">
            Consultation Bills
          </span>

          <button
            className="btn btn-light"
            onClick={onBack}
          >
            Back
          </button>

        </div>
      </nav>

      <div className="container-fluid py-4 px-3 px-md-4">

        {/* Heading */}
        <div className="mb-4">
          <h2 className="fw-bold">
            Consultation Bills
          </h2>

          <p className="text-muted mb-0">
            View and manage consultation billing records.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">

            <div className="row g-3 align-items-end">

              {/* Bill ID */}
              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Bill ID
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Bill ID"
                  value={billIdFilter}
                  onChange={(e) =>
                    setBillIdFilter(e.target.value)
                  }
                />

              </div>

              {/* Payment Status */}
              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Payment Status
                </label>

                <select
                  className="form-select"
                  value={paymentStatusFilter}
                  onChange={(e) =>
                    setPaymentStatusFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    All Statuses
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>

              {/* Clear */}
              <div className="col-md-4">

                <button
                  className="btn btn-secondary"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>

              </div>

            </div>
          </div>
        </div>

        {/* Bill Table */}
        <div className="card border-0 shadow-sm">

          <div className="card-body p-0">

            <div className="table-responsive">

              <table className="table table-hover mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Bill ID</th>
                    <th>Patient</th>
                    <th>Patient Type</th>
                    <th>Appointment ID</th>
                    <th>Registration Fee</th>
                    <th>Consultation Fee</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Token</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredBills.length === 0 ? (

                    <tr>
                      <td
                        colSpan="10"
                        className="text-center py-4 text-muted"
                      >
                        No consultation bills found.
                      </td>
                    </tr>

                  ) : (

                    filteredBills.map((bill) => {

                      const appointment =
                        getAppointment(
                          bill.appointment
                        );

                      return (
                        <tr key={bill.bill_id}>

                          <td>
                            {bill.bill_id}
                          </td>

                          <td>
                            {getPatientName(
                              bill.patient
                            )}
                          </td>

                          <td>
                            {getPatientTypeBadge(bill)}
                          </td>

                          <td>
                            {bill.appointment}
                          </td>

                          <td>
                            ₹{" "}
                            {Number(
                              bill.registration_fee || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            ₹{" "}
                            {Number(
                              bill.consultation_fee || 0
                            ).toFixed(2)}
                          </td>

                          <td className="fw-bold">
                            ₹{" "}
                            {Number(
                              bill.total_amount || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            {getStatusBadge(
                              bill.payment_status
                            )}
                          </td>

                          <td>
                            {appointment?.token_no ||
                              "Not Generated"}
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                setSelectedBill(bill)
                              }
                            >
                              View
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>
              </table>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BillList;