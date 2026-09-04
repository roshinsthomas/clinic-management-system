import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  UserPlus,
  CalendarPlus,
  CalendarCheck,
  FilePlus,
  Files,
  UserCheck,
  LogOut,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

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

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH DASHBOARD DATA
  ========================================================= */

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        appointmentsResponse,
        patientsResponse,
      ] = await Promise.all([
        fetch(
          `${API}/api/receptionist/appointments/`,
          {
            headers,
          }
        ),

        fetch(
          `${API}/api/receptionist/patients/`,
          {
            headers,
          }
        ),
      ]);

      if (
        !appointmentsResponse.ok ||
        !patientsResponse.ok
      ) {
        throw new Error(
          "Unable to load dashboard data."
        );
      }

      const appointmentsData =
        await appointmentsResponse.json();

      const patientsData =
        await patientsResponse.json();

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
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DATE
  ========================================================= */

  const today = new Date();

  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const formattedDate =
    today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  /* =========================================================
     HELPERS
  ========================================================= */

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toLowerCase();

  const getPatientId = (appointment) => {
    if (!appointment?.patient) {
      return null;
    }

    if (
      typeof appointment.patient === "object"
    ) {
      return (
        appointment.patient.patient_id ||
        appointment.patient.id ||
        null
      );
    }

    return appointment.patient;
  };

  const getDoctorId = (appointment) => {
    if (!appointment?.doctor) {
      return null;
    }

    if (
      typeof appointment.doctor === "object"
    ) {
      return (
        appointment.doctor.staff_id ||
        appointment.doctor.id ||
        null
      );
    }

    return appointment.doctor;
  };

  const getPatientName = (appointment) => {
    const patientId =
      getPatientId(appointment);

    const patient = patients.find(
      (item) =>
        String(item.patient_id) ===
        String(patientId)
    );

    if (patient) {
      return `${patient.first_name || ""} ${
        patient.last_name || ""
      }`.trim();
    }

    if (
      typeof appointment.patient === "object"
    ) {
      const firstName =
        appointment.patient.first_name || "";

      const lastName =
        appointment.patient.last_name || "";

      const name =
        `${firstName} ${lastName}`.trim();

      if (name) {
        return name;
      }
    }

    return patientId
      ? `Patient #${patientId}`
      : "Unknown Patient";
  };

  const getDoctorName = (appointment) => {
    const doctorId =
      getDoctorId(appointment);

    if (
      typeof appointment.doctor === "object"
    ) {
      const doctor = appointment.doctor;

      const firstName =
        doctor.user__first_name ||
        doctor.first_name ||
        "";

      const lastName =
        doctor.user__last_name ||
        doctor.last_name ||
        "";

      const name =
        `${firstName} ${lastName}`.trim();

      if (name) {
        return `Dr. ${name}`;
      }
    }

    return doctorId
      ? `Dr. #${doctorId}`
      : "Doctor";
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const cleanTime = String(time).slice(0, 5);

    const [hourString, minuteString] =
      cleanTime.split(":");

    const hour = Number(hourString);
    const minute = Number(minuteString);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return cleanTime;
    }

    return `${hour % 12 || 12}:${String(
      minute
    ).padStart(2, "0")} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalAppointments =
    appointments.length;

  const totalPatients =
    patients.length;

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        normalizeStatus(
          appointment.status
        ) === "completed"
    ).length;

  /* =========================================================
     TODAY'S APPOINTMENT QUEUE
     ONLY SCHEDULED + COMPLETED
  ========================================================= */

  const todaysQueue = appointments
    .filter((appointment) => {
      const status = normalizeStatus(
        appointment.status
      );

      return (
        appointment.appointment_date ===
          todayString &&
        (
          status === "scheduled" ||
          status === "completed"
        )
      );
    })
    .sort((a, b) =>
      String(
        a.appointment_time || ""
      ).localeCompare(
        String(
          b.appointment_time || ""
        )
      )
    );

  /* =========================================================
     MENU
  ========================================================= */

  const isActive = (section) =>
    activeSection === section;

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .receptionist-dashboard {
          min-height: 100vh;
          background-color: #F4F6F4;
          color: #1B2A27;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* =====================================================
           SIDEBAR
        ===================================================== */

        .dashboard-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 230px;
          background-color: #123B34;
          padding: 24px 14px;
          z-index: 1000;
        }

        .sidebar-brand {
          padding: 4px 10px 30px;
        }

        .sidebar-brand h1 {
          margin: 0;
          color: #FFFFFF;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.4;
          font-weight: 600;
        }

        .sidebar-label {
          padding: 0 10px 11px;
          color: #AFC5BE;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-menu {
          width: 100%;
          min-height: 42px;
          border: none;
          border-radius: 7px;
          background-color: transparent;
          color: #CFE1DB;
          padding: 9px 10px;
          margin-bottom: 4px;

          display: flex;
          align-items: center;
          gap: 12px;

          text-align: left;
          font-size: 11px;
          cursor: pointer;

          transition:
            background-color 0.2s ease,
            color 0.2s ease;
        }

        .dashboard-menu:hover {
          background-color: rgba(
            255,
            255,
            255,
            0.07
          );
          color: #FFFFFF;
        }

        .dashboard-menu.active {
          background-color: #1E7F6E;
          color: #FFFFFF;
        }

        .menu-icon-wrapper {
          width: 20px;
          min-width: 20px;
          height: 20px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .menu-label {
          min-width: 0;
          line-height: 1.3;
        }

        /* =====================================================
           MAIN
        ===================================================== */

        .dashboard-main {
          margin-left: 230px;
          min-height: 100vh;
        }

        /* =====================================================
           TOP BAR
        ===================================================== */

        .dashboard-topbar {
          min-height: 70px;
          background-color: #FFFFFF;
          border-bottom: 1px solid #E4E8E6;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;
        }

        .topbar-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          font-weight: 600;
          color: #1B2A27;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .date-info {
          text-align: right;
        }

        .date-info .date {
          margin: 0;
          color: #1B2A27;
          font-size: 10px;
          font-weight: 600;
        }

        .date-info .role {
          margin-top: 3px;
          color: #6B7773;
          font-size: 9px;
        }

        .logout-button {
          height: 34px;
          padding: 0 13px;

          display: flex;
          align-items: center;
          gap: 7px;

          background-color: #FFFFFF;
          border: 1px solid #D7DEDB;
          border-radius: 5px;

          color: #5B6B67;
          font-size: 10px;
          cursor: pointer;

          transition: 0.2s ease;
        }

        .logout-button:hover {
          color: #1E7F6E;
          border-color: #1E7F6E;
        }

        .logout-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .dashboard-content {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 30px 32px;
        }

        .dashboard-heading {
          margin-bottom: 23px;
        }

        .dashboard-heading h2 {
          margin: 0 0 6px;

          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          line-height: 1.25;
          font-weight: 600;

          color: #1B2A27;
        }

        .dashboard-heading p {
          margin: 0;
          color: #5B6B67;
          font-size: 10px;
          line-height: 1.5;
        }

        /* =====================================================
           STATISTICS
        ===================================================== */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card {
          min-height: 104px;

          background-color: #FFFFFF;
          border: 1px solid #E4E8E6;
          border-radius: 8px;

          padding: 18px 19px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-card-label {
          margin: 0 0 8px;
          color: #6B7773;
          font-size: 10px;
          font-weight: 500;
        }

        .stat-card-value {
          margin: 0;
          color: #1B2A27;
          font-size: 26px;
          line-height: 1;
          font-weight: 700;
        }

        .stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-wrapper.teal {
          background-color: #E2F1ED;
          color: #1E7F6E;
        }

        .stat-icon-wrapper.green {
          background-color: #EAF1E3;
          color: #5F8347;
        }

        .stat-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        /* =====================================================
           FEATURE CARDS
        ===================================================== */

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .feature-card {
          min-height: 172px;

          background-color: #FFFFFF;
          border: 1px solid #E4E8E6;
          border-radius: 8px;

          padding: 21px;

          display: flex;
          flex-direction: column;
        }

        .feature-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 14px;
        }

        .feature-icon-wrapper.teal {
          background-color: #E2F1ED;
          color: #1E7F6E;
        }

        .feature-icon-wrapper.green {
          background-color: #EAF1E3;
          color: #5F8347;
        }

        .feature-icon-wrapper.amber {
          background-color: #F7EEDC;
          color: #B5792A;
        }

        .feature-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .feature-card h4 {
          margin: 0 0 7px;
          color: #1B2A27;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 700;
        }

        .feature-card p {
          margin: 0 0 16px;
          color: #6B7773;
          font-size: 10px;
          line-height: 1.55;
        }

        .feature-button {
          margin-top: auto;

          align-self: flex-start;

          display: inline-flex;
          align-items: center;
          gap: 4px;

          border: none;
          background-color: transparent;

          padding: 0;

          font-size: 10px;
          font-weight: 600;

          cursor: pointer;
        }

        .feature-button.teal {
          color: #1E7F6E;
        }

        .feature-button.green {
          color: #5F8347;
        }

        .feature-button.amber {
          color: #B5792A;
        }

        .feature-button:hover {
          text-decoration: underline;
        }

        .feature-arrow {
          width: 13px;
          height: 13px;
          flex-shrink: 0;
        }

        /* =====================================================
           TODAY'S APPOINTMENT QUEUE
        ===================================================== */

        .queue-card {
          background-color: #FFFFFF;
          border: 1px solid #E4E8E6;
          border-radius: 8px;
          overflow: hidden;
        }

        .queue-header {
          min-height: 57px;

          padding: 0 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom: 1px solid #E8ECEA;
        }

        .queue-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 600;
          color: #1B2A27;
        }

        .queue-date {
          color: #7A8581;
          font-size: 9px;
        }

        .queue-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .queue-table {
          width: 100%;
          min-width: 620px;
          border-collapse: collapse;
        }

        .queue-table th {
          padding: 10px 20px;

          text-align: left;

          border-bottom: 1px solid #E8ECEA;

          color: #7A8581;
          font-size: 9px;
          font-weight: 600;
        }

        .queue-table td {
          padding: 12px 20px;

          border-bottom: 1px solid #F0F2F1;

          color: #46534F;
          font-size: 10px;
        }

        .queue-table tbody tr:last-child td {
          border-bottom: none;
        }

        .queue-table tbody tr:hover {
          background-color: #FAFCFB;
        }

        .queue-time {
          color: #1B2A27 !important;
          font-weight: 600;
        }

        .queue-patient {
          color: #1B2A27 !important;
          font-weight: 600;
        }

        .status-pill {
          min-width: 67px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;

          padding: 4px 9px;

          border-radius: 20px;

          font-size: 8px;
          font-weight: 600;
        }

        .status-pill.scheduled {
          background-color: #E2F1ED;
          color: #1E7F6E;
        }

        .status-pill.completed {
          background-color: #EAF1E3;
          color: #5F8347;
        }

        .status-icon {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
        }

        .empty-queue {
          padding: 30px 20px;
          text-align: center;
          color: #7A8581;
          font-size: 10px;
        }

        /* =====================================================
           OTHER SECTIONS
        ===================================================== */

        .section-heading {
          margin-bottom: 25px;
        }

        .section-heading h2 {
          margin: 0 0 6px;

          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          line-height: 1.3;
          font-weight: 600;

          color: #1B2A27;
        }

        .section-heading p {
          margin: 0;
          color: #5B6B67;
          font-size: 10px;
          line-height: 1.5;
        }

        .section-card {
          height: 100%;

          background-color: #FFFFFF;
          border: 1px solid #E4E8E6;
          border-radius: 8px;
        }

        .section-card-body {
          height: 100%;
          padding: 30px;
          display: flex;
          flex-direction: column;
        }

        .section-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 17px;
        }

        .section-icon-wrapper.teal {
          background-color: #E2F1ED;
          color: #1E7F6E;
        }

        .section-icon-wrapper.green {
          background-color: #EAF1E3;
          color: #5F8347;
        }

        .section-icon-wrapper.amber {
          background-color: #F7EEDC;
          color: #B5792A;
        }

        .section-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .section-card h4 {
          margin: 0 0 9px;

          color: #1B2A27;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 700;
        }

        .section-card p {
          margin: 0 0 22px;

          color: #6B7773;
          font-size: 10px;
          line-height: 1.6;
        }

        .action-button {
          margin-top: auto;

          min-height: 34px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          align-self: flex-start;

          padding: 7px 14px;

          border-radius: 5px;

          font-size: 10px;
          font-weight: 600;

          cursor: pointer;
          transition: 0.2s ease;
        }

        .action-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        .button-teal {
          background-color: #1E7F6E;
          border: 1px solid #1E7F6E;
          color: #FFFFFF;
        }

        .button-teal:hover {
          background-color: #176B5D;
        }

        .button-green {
          background-color: #5F8347;
          border: 1px solid #5F8347;
          color: #FFFFFF;
        }

        .button-green:hover {
          background-color: #506F3C;
        }

        .button-amber {
          background-color: #B5792A;
          border: 1px solid #B5792A;
          color: #FFFFFF;
        }

        .button-amber:hover {
          background-color: #9D6823;
        }

        .button-outline-teal {
          background-color: #FFFFFF;
          border: 1px solid #1E7F6E;
          color: #1E7F6E;
        }

        .button-outline-teal:hover {
          background-color: #E2F1ED;
        }

        .button-outline-green {
          background-color: #FFFFFF;
          border: 1px solid #5F8347;
          color: #5F8347;
        }

        .button-outline-green:hover {
          background-color: #EAF1E3;
        }

        .button-outline-amber {
          background-color: #FFFFFF;
          border: 1px solid #B5792A;
          color: #B5792A;
        }

        .button-outline-amber:hover {
          background-color: #F7EEDC;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {

          .dashboard-sidebar {
            width: 200px;
          }

          .dashboard-main {
            margin-left: 200px;
          }

          .dashboard-content {
            padding: 25px;
          }

          .dashboard-topbar {
            padding: 0 25px;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

        }

        /* =====================================================
           MOBILE / ICON-ONLY SIDEBAR
        ===================================================== */

        @media (max-width: 767px) {

          .dashboard-sidebar {
            position: fixed;

            top: 0;
            left: 0;
            bottom: 0;

            width: 68px;

            padding: 18px 8px;

            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .sidebar-brand {
            width: 100%;
            padding: 3px 0 25px;

            display: flex;
            justify-content: center;
          }

          .sidebar-brand h1 {
            font-size: 0;
            line-height: 1;
          }

          .sidebar-brand h1::first-letter {
            font-size: 25px;
          }

          .sidebar-label {
            display: none;
          }

          .dashboard-menu {
            width: 48px;
            height: 46px;
            min-height: 46px;

            padding: 0;

            justify-content: center;
            gap: 0;
          }

          .menu-icon-wrapper {
            width: 20px;
            min-width: 20px;
            height: 20px;
          }

          .menu-label {
            display: none;
          }

          .dashboard-main {
            margin-left: 68px;
          }

          .dashboard-topbar {
            min-height: 64px;
            padding: 0 17px;
          }

          .topbar-title {
            font-size: 15px;
          }

          .topbar-right {
            gap: 9px;
          }

          .date-info {
            display: none;
          }

          .logout-button {
            width: 34px;
            height: 34px;
            padding: 0;
            justify-content: center;
          }

          .logout-label {
            display: none;
          }

          .dashboard-content {
            padding: 22px 17px;
          }

          .dashboard-heading {
            margin-bottom: 20px;
          }

          .dashboard-heading h2 {
            font-size: 21px;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 9px;
          }

          .stat-card {
            min-height: 88px;
            padding: 13px;
          }

          .stat-card-label {
            font-size: 8px;
            line-height: 1.3;
          }

          .stat-card-value {
            font-size: 20px;
          }

          .stat-icon-wrapper {
            width: 32px;
            height: 32px;
          }

          .stat-icon {
            width: 15px;
            height: 15px;
          }

        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 500px) {

          .dashboard-sidebar {
            width: 60px;
          }

          .dashboard-main {
            margin-left: 60px;
          }

          .dashboard-content {
            padding: 19px 13px;
          }

          .dashboard-topbar {
            padding: 0 13px;
          }

          .topbar-title {
            font-size: 14px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            min-height: 82px;
          }

          .feature-card {
            min-height: 160px;
            padding: 19px;
          }

          .section-card-body {
            padding: 23px;
          }

          .queue-header {
            padding: 0 15px;
          }

          .queue-table th,
          .queue-table td {
            padding-left: 15px;
            padding-right: 15px;
          }

        }

      `}</style>

      <div className="receptionist-dashboard">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="dashboard-sidebar">

          <div className="sidebar-brand">
            <h1>
              🏥 Clinical Management System
            </h1>
          </div>

          <div className="sidebar-label">
            Receptionist
          </div>

          {/* DASHBOARD */}

          <button
            type="button"
            className={`dashboard-menu ${
              isActive("dashboard")
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("dashboard")
            }
          >
            <span className="menu-icon-wrapper">
              <LayoutDashboard
                className="menu-icon"
              />
            </span>

            <span className="menu-label">
              Dashboard
            </span>
          </button>

          {/* PATIENTS */}

          <button
            type="button"
            className={`dashboard-menu ${
              isActive("patients")
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("patients")
            }
          >
            <span className="menu-icon-wrapper">
              <Users
                className="menu-icon"
              />
            </span>

            <span className="menu-label">
              Patients
            </span>
          </button>

          {/* APPOINTMENTS */}

          <button
            type="button"
            className={`dashboard-menu ${
              isActive("appointments")
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("appointments")
            }
          >
            <span className="menu-icon-wrapper">
              <Calendar
                className="menu-icon"
              />
            </span>

            <span className="menu-label">
              Appointments
            </span>
          </button>

          {/* CONSULTATION BILLS */}

          <button
            type="button"
            className={`dashboard-menu ${
              isActive("billing")
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("billing")
            }
          >
            <span className="menu-icon-wrapper">
              <FileText
                className="menu-icon"
              />
            </span>

            <span className="menu-label">
              Consultation Bills
            </span>
          </button>

        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <main className="dashboard-main">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <nav className="dashboard-topbar">

            <h2 className="topbar-title">
              Receptionist dashboard
            </h2>

            <div className="topbar-right">

              <div className="date-info">

                <p className="date">
                  {formattedDate}
                </p>

                <div className="role">
                  Receptionist
                </div>

              </div>

              <button
                type="button"
                className="logout-button"
                onClick={onLogout}
              >
                <LogOut
                  className="logout-icon"
                />

                <span className="logout-label">
                  Logout
                </span>
              </button>

            </div>

          </nav>

          <div className="dashboard-content">

            {/* =================================================
                DASHBOARD
            ================================================= */}

            {activeSection === "dashboard" && (
              <>

                <div className="dashboard-heading">

                  <h2>
                    Receptionist Dashboard
                  </h2>

                  <p>
                    Manage patients, appointments and consultation
                    billing efficiently.
                  </p>

                </div>

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="stats-grid">

                  {/* TOTAL APPOINTMENTS */}

                  <div className="stat-card">

                    <div>

                      <p className="stat-card-label">
                        Total Appointments
                      </p>

                      <h3 className="stat-card-value">
                        {loading
                          ? "—"
                          : totalAppointments}
                      </h3>

                    </div>

                    <div className="stat-icon-wrapper green">

                      <Calendar
                        className="stat-icon"
                      />

                    </div>

                  </div>

                  {/* TOTAL PATIENTS */}

                  <div className="stat-card">

                    <div>

                      <p className="stat-card-label">
                        Total Patients
                      </p>

                      <h3 className="stat-card-value">
                        {loading
                          ? "—"
                          : totalPatients}
                      </h3>

                    </div>

                    <div className="stat-icon-wrapper teal">

                      <Users
                        className="stat-icon"
                      />

                    </div>

                  </div>

                  {/* COMPLETED */}

                  <div className="stat-card">

                    <div>

                      <p className="stat-card-label">
                        Completed
                      </p>

                      <h3 className="stat-card-value">
                        {loading
                          ? "—"
                          : completedAppointments}
                      </h3>

                    </div>

                    <div className="stat-icon-wrapper green">

                      <UserCheck
                        className="stat-icon"
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    FEATURE CARDS
                ================================================= */}

                <div className="feature-grid">

                  {/* PATIENT MANAGEMENT */}

                  <div className="feature-card">

                    <div className="feature-icon-wrapper teal">

                      <Users
                        className="feature-icon"
                      />

                    </div>

                    <h4>
                      Patient Management
                    </h4>

                    <p>
                      Register new patients and manage existing
                      patient records.
                    </p>

                    <button
                      type="button"
                      className="feature-button teal"
                      onClick={() =>
                        setActiveSection(
                          "patients"
                        )
                      }
                    >
                      Patient Management

                      <span>›</span>
                    </button>

                  </div>

                  {/* APPOINTMENT MANAGEMENT */}

                  <div className="feature-card">

                    <div className="feature-icon-wrapper green">

                      <Calendar
                        className="feature-icon"
                      />

                    </div>

                    <h4>
                      Appointment Management
                    </h4>

                    <p>
                      Schedule appointments and manage existing
                      appointment records.
                    </p>

                    <button
                      type="button"
                      className="feature-button green"
                      onClick={() =>
                        setActiveSection(
                          "appointments"
                        )
                      }
                    >
                      Appointment Management

                      <span>›</span>
                    </button>

                  </div>

                  {/* CONSULTATION BILLING */}

                  <div className="feature-card">

                    <div className="feature-icon-wrapper amber">

                      <FileText
                        className="feature-icon"
                      />

                    </div>

                    <h4>
                      Consultation Billing
                    </h4>

                    <p>
                      Create and manage consultation bills for
                      patient appointments.
                    </p>

                    <button
                      type="button"
                      className="feature-button amber"
                      onClick={() =>
                        setActiveSection(
                          "billing"
                        )
                      }
                    >
                      Consultation Billing

                      <span>›</span>
                    </button>

                  </div>

                </div>

                {/* =================================================
                    TODAY'S APPOINTMENT QUEUE
                ================================================= */}

                <div className="queue-card">

                  <div className="queue-header">

                    <h3 className="queue-title">
                      Today's appointment queue
                    </h3>

                    <span className="queue-date">
                      {today.toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>

                  </div>

                  {todaysQueue.length === 0 ? (

                    <div className="empty-queue">
                      No scheduled or completed appointments
                      for today.
                    </div>

                  ) : (

                    <div className="queue-table-wrapper">

                      <table className="queue-table">

                        <thead>

                          <tr>

                            <th>
                              Time
                            </th>

                            <th>
                              Patient
                            </th>

                            <th>
                              Doctor
                            </th>

                            <th>
                              Status
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {todaysQueue.map(
                            (appointment) => {

                              const status =
                                normalizeStatus(
                                  appointment.status
                                );

                              const isCompleted =
                                status ===
                                "completed";

                              return (
                                <tr
                                  key={
                                    appointment.appointment_id
                                  }
                                >

                                  <td className="queue-time">
                                    {formatTime(
                                      appointment.appointment_time
                                    )}
                                  </td>

                                  <td className="queue-patient">
                                    {getPatientName(
                                      appointment
                                    )}
                                  </td>

                                  <td>
                                    {getDoctorName(
                                      appointment
                                    )}
                                  </td>

                                  <td>

                                    <span
                                      className={`status-pill ${
                                        isCompleted
                                          ? "completed"
                                          : "scheduled"
                                      }`}
                                    >

                                      {isCompleted ? (
                                        <UserCheck
                                          className="status-icon"
                                        />
                                      ) : (
                                        <Calendar
                                          className="status-icon"
                                        />
                                      )}

                                      {isCompleted
                                        ? "Completed"
                                        : "Scheduled"}

                                    </span>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>

              </>
            )}

            {/* =================================================
                PATIENT MANAGEMENT
            ================================================= */}

            {activeSection === "patients" && (
              <>

                <div className="section-heading">

                  <h2>
                    Patient Management
                  </h2>

                  <p>
                    Register new patients or manage existing patient
                    records.
                  </p>

                </div>

                <div className="row g-4">

                  {/* REGISTER */}

                  <div className="col-12 col-md-6">

                    <div className="section-card">

                      <div className="section-card-body">

                        <div className="section-icon-wrapper teal">

                          <UserPlus
                            className="section-icon"
                          />

                        </div>

                        <h4>
                          Register Patient
                        </h4>

                        <p>
                          Register a new patient and add their details
                          to the clinical management system.
                        </p>

                        <button
                          type="button"
                          className="action-button button-teal"
                          onClick={
                            onPatientRegistration
                          }
                        >
                          <UserPlus
                            className="action-icon"
                          />

                          Register Patient
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* VIEW */}

                  <div className="col-12 col-md-6">

                    <div className="section-card">

                      <div className="section-card-body">

                        <div className="section-icon-wrapper teal">

                          <Users
                            className="section-icon"
                          />

                        </div>

                        <h4>
                          View Patients
                        </h4>

                        <p>
                          View, search and manage registered patient
                          records.
                        </p>

                        <button
                          type="button"
                          className="action-button button-outline-teal"
                          onClick={
                            onPatientList
                          }
                        >
                          <Users
                            className="action-icon"
                          />

                          View Patients
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </>
            )}

            {/* =================================================
                APPOINTMENT MANAGEMENT
            ================================================= */}

            {activeSection === "appointments" && (
              <>

                <div className="section-heading">

                  <h2>
                    Appointment Management
                  </h2>

                  <p>
                    Schedule new appointments and manage existing
                    appointments.
                  </p>

                </div>

                <div className="row g-4">

                  {/* SCHEDULE */}

                  <div className="col-12 col-md-6">

                    <div className="section-card">

                      <div className="section-card-body">

                        <div className="section-icon-wrapper green">

                          <CalendarPlus
                            className="section-icon"
                          />

                        </div>

                        <h4>
                          Schedule Appointment
                        </h4>

                        <p>
                          Schedule a new appointment based on doctor
                          availability and available time slots.
                        </p>

                        <button
                          type="button"
                          className="action-button button-green"
                          onClick={
                            onScheduleAppointment
                          }
                        >
                          <CalendarPlus
                            className="action-icon"
                          />

                          Schedule Appointment
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* VIEW / EDIT */}

                  <div className="col-12 col-md-6">

                    <div className="section-card">

                      <div className="section-card-body">

                        <div className="section-icon-wrapper green">

                          <CalendarCheck
                            className="section-icon"
                          />

                        </div>

                        <h4>
                          View & Edit Appointments
                        </h4>

                        <p>
                          View, search, edit and manage scheduled
                          patient appointments.
                        </p>

                        <button
                          type="button"
                          className="action-button button-outline-green"
                          onClick={
                            onAppointmentList
                          }
                        >
                          <CalendarCheck
                            className="action-icon"
                          />

                          View & Edit Appointments
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </>
            )}

            {/* =================================================
                CONSULTATION BILLING
            ================================================= */}

            {activeSection === "billing" && (
              <>

                <div className="section-heading">

                  <h2>
                    Consultation Billing
                  </h2>

                  <p>
                    Create and manage consultation bills for patient
                    appointments.
                  </p>

                </div>

                <div className="row g-4">

                  {/* CREATE BILL */}

                  <div className="col-12 col-md-6">

                    <div className="section-card">

                      <div className="section-card-body">

                        <div className="section-icon-wrapper amber">

                          <FilePlus
                            className="section-icon"
                          />

                        </div>

                        <h4>
                          Create Consultation Bill
                        </h4>

                        <p>
                          Generate a consultation bill for a patient's
                          appointment.
                        </p>

                        <button
                          type="button"
                          className="action-button button-amber"
                          onClick={onCreateBill}
                        >
                          <FilePlus
                            className="action-icon"
                          />

                          Create Bill
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* VIEW BILLS */}

                  <div className="col-12 col-md-6">

                    <div className="section-card">

                      <div className="section-card-body">

                        <div className="section-icon-wrapper amber">

                          <Files
                            className="section-icon"
                          />

                        </div>

                        <h4>
                          View Consultation Bills
                        </h4>

                        <p>
                          View and manage consultation bills and
                          payment information.
                        </p>

                        <button
                          type="button"
                          className="action-button button-outline-amber"
                          onClick={onBillList}
                        >
                          <Files
                            className="action-icon"
                          />

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
    </>
  );
}

export default ReceptionistDashboard;