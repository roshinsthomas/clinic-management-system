import { useEffect, useState } from "react";

import {
  getPendingPrescriptions,
  dispenseMedicine,
  searchPatient,
  getPatientAppointments,
  getAppointmentPrescriptions,
} from "../../services/pharmacyApi";

function Prescriptions({ onBack }) {

  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dispensingId, setDispensingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Patient search
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);

  const [appointments, setAppointments] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);


  // ==========================================
  // LOAD PENDING PRESCRIPTIONS
  // ==========================================

  const loadPendingPrescriptions = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getPendingPrescriptions();

      setPrescriptions(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // Load prescriptions when page opens
  useEffect(() => {

    loadPendingPrescriptions();

  }, []);


  // ==========================================
  // DISPENSE MEDICINE
  // ==========================================

  const handleDispense = async (prescription) => {

    const confirmDispense = window.confirm(
      `Dispense ${prescription.quantity} unit(s) of this medicine?`
    );

    if (!confirmDispense) {
      return;
    }

    try {

      setDispensingId(prescription.prescription_id);

      setError("");
      setSuccess("");

      const data = await dispenseMedicine(
        prescription.prescription_id
      );

      setSuccess(
        `${data.message} Bill: ${data.bill_number}. Total: ₹${data.total_amount}`
      );

      // Reload pending prescriptions
      await loadPendingPrescriptions();

    } catch (err) {

      setError(err.message);

    } finally {

      setDispensingId(null);

    }
  };


  // ==========================================
  // SEARCH PATIENT
  // ==========================================

  const handleSearch = async (e) => {

    e.preventDefault();

    if (!search.trim()) {

      setError(
        "Please enter a patient name or phone number."
      );

      return;
    }

    try {

      setError("");
      setSuccess("");

      const data = await searchPatient(
        search.trim()
      );

      setPatients(data);

      if (data.length === 0) {

        setError("No patient found.");

      }

    } catch (err) {

      setError(err.message);

    }
  };


  // ==========================================
  // SELECT PATIENT
  // ==========================================

  const handlePatientSelect = async (patient) => {

    try {

      setError("");
      setSuccess("");

      setSelectedPatient(patient);

      setAppointments([]);
      setPatientPrescriptions([]);

      setSelectedAppointment(null);

      const data = await getPatientAppointments(
        patient.patient_id
      );

      setAppointments(data);

      if (data.length === 0) {

        setError(
          "No appointments found for this patient."
        );

      }

    } catch (err) {

      setError(err.message);

    }
  };


  // ==========================================
  // SELECT APPOINTMENT
  // ==========================================

  const handleAppointmentSelect = async (appointment) => {

    try {

      setError("");
      setSuccess("");

      setSelectedAppointment(appointment);

      const data =
        await getAppointmentPrescriptions(
          appointment.appointment_id
        );

      setPatientPrescriptions(data);

      if (data.length === 0) {

        setError(
          "No pending prescriptions found for this appointment."
        );

      }

    } catch (err) {

      setError(err.message);

    }
  };


  return (

    <div className="container-fluid min-vh-100 bg-light p-4">


      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Prescriptions
          </h2>

          <p className="text-muted mb-0">
            Pending medicine prescriptions
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


      {/* ==========================================
          SUCCESS
      ========================================== */}

      {success && (

        <div className="alert alert-success">

          {success}

        </div>

      )}


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* ==========================================
          PENDING PRESCRIPTIONS
      ========================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">


          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Pending Prescriptions
              </h5>

              <p className="text-muted mb-0">
                Prescriptions created by doctors
              </p>

            </div>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={loadPendingPrescriptions}
              disabled={loading}
            >
              Refresh
            </button>

          </div>


          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-2">
                Loading prescriptions...
              </p>

            </div>

          ) : prescriptions.length === 0 ? (

            <div className="text-center py-5">

              <h6 className="fw-bold">
                No Pending Prescriptions
              </h6>

              <p className="text-muted mb-0">
                There are currently no prescriptions waiting
                for dispensing.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>ID</th>
                    <th>Doctor</th>

                    <th>Medicine</th>

                    <th>Dosage</th>

                    <th>Quantity</th>

                    <th>Frequency</th>

                    <th>Duration</th>

                    <th>Status</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {prescriptions.map(
                    (prescription) => (

                      <tr
                        key={
                          prescription.prescription_id
                        }
                      >

                        <td>
                          {
                            prescription.prescription_id
                          }
                        </td>
                        <td className="fw-semibold">
                            {prescription.doctor_name || "-"}
                          </td>


                        <td className="fw-semibold">

                          {prescription.medicine_name ||
                            prescription.medicine}

                        </td>


                        <td>
                          {prescription.dosage}
                        </td>


                        <td>
                          {prescription.quantity}
                        </td>


                        <td>
                          {prescription.frequency}
                        </td>


                        <td>
                          {prescription.duration}
                        </td>


                        <td>

                          <span className="badge bg-warning text-dark">

                            {
                              prescription.dispensed_status
                            }

                          </span>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleDispense(
                                prescription
                              )
                            }
                            disabled={
                              dispensingId ===
                              prescription.prescription_id
                            }
                          >

                            {dispensingId ===
                            prescription.prescription_id
                              ? "Dispensing..."
                              : "Dispense"}

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* ==========================================
          OPTIONAL PATIENT SEARCH
      ========================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Search Patient
          </h5>

          <form onSubmit={handleSearch}>

            <div className="row g-2">

              <div className="col-md-9">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter patient name or phone number"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <div className="col-md-3">

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  Search Patient
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>


      {/* ==========================================
          PATIENT RESULTS
      ========================================== */}

      {patients.length > 0 && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Patients Found
            </h5>

            <div className="table-responsive">

              <table className="table table-hover">

                <thead className="table-light">

                  <tr>

                    <th>Patient ID</th>

                    <th>Name</th>

                    <th>Phone</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {patients.map((patient) => (

                    <tr
                      key={patient.patient_id}
                    >

                      <td>
                        {patient.patient_id}
                      </td>

                      <td className="fw-semibold">
                        {patient.first_name}{" "}
                        {patient.last_name}
                      </td>

                      <td>
                        {patient.phone}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            handlePatientSelect(
                              patient
                            )
                          }
                        >
                          Select Patient
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}


      {/* ==========================================
          SELECTED PATIENT APPOINTMENTS
      ========================================== */}

      {selectedPatient && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Appointments
            </h5>

            {appointments.length === 0 ? (

              <p className="text-muted">
                No appointments found.
              </p>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover">

                  <thead className="table-light">

                    <tr>

                      <th>Appointment ID</th>

                      <th>Date</th>

                      <th>Time</th>

                      <th>Doctor</th>

                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {appointments.map(
                      (appointment) => (

                        <tr
                          key={
                            appointment.appointment_id
                          }
                        >

                          <td>
                            {
                              appointment.appointment_id
                            }
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
                            {
                              appointment.doctor_name ||
                              "-"
                            }
                          </td>

                          <td>

                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                handleAppointmentSelect(
                                  appointment
                                )
                              }
                            >
                              View Prescription
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ==========================================
          SELECTED APPOINTMENT PRESCRIPTIONS
      ========================================== */}

      {selectedAppointment && (

        <div className="card border-0 shadow-sm">

          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Appointment Prescriptions
            </h5>

            {patientPrescriptions.length === 0 ? (

              <p className="text-muted">
                No pending prescriptions found.
              </p>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover">

                  <thead className="table-light">

                    <tr>

                      <th>Prescription ID</th>
                      <th>Doctor</th>
                      <th>Medicine</th>

                      <th>Dosage</th>

                      <th>Quantity</th>

                      <th>Frequency</th>

                      <th>Duration</th>

                      <th>Status</th>

                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {patientPrescriptions.map(
                      (prescription) => (

                        <tr
                          key={
                            prescription.prescription_id
                          }
                        >

                          <td>
                            {
                              prescription.prescription_id
                            }
                          </td>
                          <td className="fw-semibold">
                            {prescription.doctor_name || "-"}
                          </td>

                          <td className="fw-semibold">

                            {prescription.medicine_name ||
                              prescription.medicine}

                          </td>

                          <td>
                            {prescription.dosage}
                          </td>

                          <td>
                            {prescription.quantity}
                          </td>

                          <td>
                            {prescription.frequency}
                          </td>

                          <td>
                            {prescription.duration}
                          </td>

                          <td>

                            <span className="badge bg-warning text-dark">

                              {
                                prescription.dispensed_status
                              }

                            </span>

                          </td>

                          <td>

                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                handleDispense(
                                  prescription
                                )
                              }
                            >
                              Dispense
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Prescriptions;