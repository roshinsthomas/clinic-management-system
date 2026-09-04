import { useState } from "react";

function ReceptionistDashboard({
  onPatientRegistration,
  onPatientList,
  onScheduleAppointment,
  onAppointmentList,
  onCreateBill,
  onBillList,
  onLogout,
}) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const menuClass = (section) =>
    `btn w-100 text-start mb-2 ${
      activeSection === section ? "text-white" : "text-dark"
    }`;

  const menuStyle = (section) =>
    activeSection === section
      ? {
          backgroundColor: "#1565c0",
          borderRadius: "10px",
        }
      : {
          backgroundColor: "transparent",
          borderRadius: "10px",
        };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#f4f7fb" }}
    >
      {/* HEADER */}
      <nav
        className="navbar navbar-dark px-3 px-md-4 shadow-sm"
        style={{
          backgroundColor: "#12355b",
          minHeight: "70px",
        }}
      >
        <div className="container-fluid">
          <span className="navbar-brand fw-bold fs-4">
            🏥 Clinical Management System
          </span>

          <div className="d-flex align-items-center gap-3">
            <span className="text-white fw-semibold">
              Receptionist
            </span>

            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* SIDEBAR */}
        <aside
          className="bg-white border-end shadow-sm"
          style={{
            width: "250px",
            minHeight: "calc(100vh - 70px)",
          }}
        >
          <div className="p-3">
            <div className="fw-bold text-secondary px-3 py-2 mb-3">
              Receptionist
            </div>

            <button
              type="button"
              className={menuClass("dashboard")}
              style={menuStyle("dashboard")}
              onClick={() => setActiveSection("dashboard")}
            >
              🏠
              <span className="ms-2">Dashboard</span>
            </button>

            <button
              type="button"
              className={menuClass("patients")}
              style={menuStyle("patients")}
              onClick={() => setActiveSection("patients")}
            >
              👥
              <span className="ms-2">Patients</span>
            </button>

            <button
              type="button"
              className={menuClass("appointments")}
              style={menuStyle("appointments")}
              onClick={() => setActiveSection("appointments")}
            >
              📅
              <span className="ms-2">Appointments</span>
            </button>

            <button
              type="button"
              className={menuClass("billing")}
              style={menuStyle("billing")}
              onClick={() => setActiveSection("billing")}
            >
              🧾
              <span className="ms-2">Consultation Bills</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-grow-1">
          <div className="container-fluid p-4 p-md-5">

            {/* ================================================= */}
            {/* DASHBOARD */}
            {/* ================================================= */}

            {activeSection === "dashboard" && (
              <>
                <div className="mb-5">
                  <h2 className="fw-bold mb-2">
                    Receptionist Dashboard
                  </h2>

                  <p className="text-muted">
                    Manage patients, appointments and consultation
                    billing efficiently.
                  </p>
                </div>

                <div className="row g-4">

                  {/* PATIENTS */}
                  <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "58px",
                            height: "58px",
                            backgroundColor: "#e3f2fd",
                            fontSize: "27px",
                          }}
                        >
                          👥
                        </div>

                        <h4 className="fw-bold">
                          Patient Management
                        </h4>

                        <p className="text-muted">
                          Register new patients and manage existing
                          patient records.
                        </p>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            setActiveSection("patients")
                          }
                        >
                          Patient Management
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* APPOINTMENTS */}
                  <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "58px",
                            height: "58px",
                            backgroundColor: "#e8f5e9",
                            fontSize: "27px",
                          }}
                        >
                          📅
                        </div>

                        <h4 className="fw-bold">
                          Appointment Management
                        </h4>

                        <p className="text-muted">
                          Schedule appointments and manage existing
                          appointment records.
                        </p>

                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() =>
                            setActiveSection("appointments")
                          }
                        >
                          Appointment Management
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CONSULTATION */}
                  <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "58px",
                            height: "58px",
                            backgroundColor: "#fff3e0",
                            fontSize: "27px",
                          }}
                        >
                          🧾
                        </div>

                        <h4 className="fw-bold">
                          Consultation Billing
                        </h4>

                        <p className="text-muted">
                          Create and manage consultation bills for
                          patient appointments.
                        </p>

                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={() =>
                            setActiveSection("billing")
                          }
                        >
                          Consultation Billing
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ================================================= */}
            {/* PATIENT MANAGEMENT */}
            {/* ================================================= */}

            {activeSection === "patients" && (
              <>
                <div className="mb-4">
                  <h2 className="fw-bold mb-2">
                    Patient Management
                  </h2>

                  <p className="text-muted">
                    Register new patients or manage existing patient
                    records.
                  </p>
                </div>

                <div className="row g-4">

                  {/* REGISTER */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-5">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#e3f2fd",
                            fontSize: "28px",
                          }}
                        >
                          👤
                        </div>

                        <h4 className="fw-bold">
                          Register Patient
                        </h4>

                        <p className="text-muted mb-4">
                          Register a new patient and add their details
                          to the clinical management system.
                        </p>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={onPatientRegistration}
                        >
                          Register Patient
                        </button>

                      </div>
                    </div>
                  </div>

                  {/* VIEW */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-5">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#e8eaf6",
                            fontSize: "28px",
                          }}
                        >
                          👥
                        </div>

                        <h4 className="fw-bold">
                          View Patients
                        </h4>

                        <p className="text-muted mb-4">
                          View, search and manage registered patient
                          records.
                        </p>

                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={onPatientList}
                        >
                          View Patients
                        </button>

                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ================================================= */}
            {/* APPOINTMENT MANAGEMENT */}
            {/* ================================================= */}

            {activeSection === "appointments" && (
              <>
                <div className="mb-4">
                  <h2 className="fw-bold mb-2">
                    Appointment Management
                  </h2>

                  <p className="text-muted">
                    Schedule new appointments and manage existing
                    appointments.
                  </p>
                </div>

                <div className="row g-4">

                  {/* SCHEDULE */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-5">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#e8f5e9",
                            fontSize: "28px",
                          }}
                        >
                          📅
                        </div>

                        <h4 className="fw-bold">
                          Schedule Appointment
                        </h4>

                        <p className="text-muted mb-4">
                          Schedule a new appointment based on doctor
                          availability and available time slots.
                        </p>

                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={onScheduleAppointment}
                        >
                          Schedule Appointment
                        </button>

                      </div>
                    </div>
                  </div>

                  {/* VIEW / EDIT */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-5">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#f3e5f5",
                            fontSize: "28px",
                          }}
                        >
                          📋
                        </div>

                        <h4 className="fw-bold">
                          View & Edit Appointments
                        </h4>

                        <p className="text-muted mb-4">
                          View, search, edit and manage scheduled
                          patient appointments.
                        </p>

                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={onAppointmentList}
                        >
                          View & Edit Appointments
                        </button>

                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* ================================================= */}
            {/* CONSULTATION BILLING */}
            {/* ================================================= */}

            {activeSection === "billing" && (
              <>
                <div className="mb-4">
                  <h2 className="fw-bold mb-2">
                    Consultation Billing
                  </h2>

                  <p className="text-muted">
                    Create and manage consultation bills for patient
                    appointments.
                  </p>
                </div>

                <div className="row g-4">

                  {/* CREATE BILL */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-5">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#fff3e0",
                            fontSize: "28px",
                          }}
                        >
                          💳
                        </div>

                        <h4 className="fw-bold">
                          Create Consultation Bill
                        </h4>

                        <p className="text-muted mb-4">
                          Generate a consultation bill for a patient's
                          appointment.
                        </p>

                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={onCreateBill}
                        >
                          Create Bill
                        </button>

                      </div>
                    </div>
                  </div>

                  {/* VIEW BILLS */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-5">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
                          style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#e0f2f1",
                            fontSize: "28px",
                          }}
                        >
                          🧾
                        </div>

                        <h4 className="fw-bold">
                          View Consultation Bills
                        </h4>

                        <p className="text-muted mb-4">
                          View and manage consultation bills and
                          payment information.
                        </p>

                        <button
                          type="button"
                          className="btn btn-outline-warning"
                          onClick={onBillList}
                        >
                          View Bills
                        </button>

                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;