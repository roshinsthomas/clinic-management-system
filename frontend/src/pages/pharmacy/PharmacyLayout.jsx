function PharmacyLayout({
  children,
  currentPage,
  onNavigate,
  onBack,
  onLogout,
}) {
  return (
    <div className="d-flex min-vh-100 bg-light">

      {/* ================= SIDEBAR ================= */}
      <div
        className="d-flex flex-column p-3 text-white"
        style={{
          width: "250px",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #6c5ce7, #4b3fd1)",
        }}
      >

        {/* Pharmacy Title */}
        <div className="mb-4">
          <h3 className="fw-bold mb-1">
            💊 Pharmacy
          </h3>

          <small className="text-white-50">
            Clinic Management System
          </small>
        </div>

        <hr />

        {/* Navigation */}
        <div className="d-flex flex-column gap-2">

          {/* Dashboard */}
          <button
            type="button"
            className={`btn text-start text-white w-100 ${
              currentPage === "pharmacist"
                ? "bg-white bg-opacity-25"
                : ""
            }`}
            onClick={() => onNavigate("pharmacist")}
          >
            🏠 Dashboard
          </button>

          {/* Medicines */}
          <button
            type="button"
            className={`btn text-start text-white w-100 ${
              currentPage === "medicine-inventory"
                ? "bg-white bg-opacity-25"
                : ""
            }`}
            onClick={() => onNavigate("medicine-inventory")}
          >
            💊 Medicines
          </button>

          {/* Prescriptions */}
          <button
            type="button"
            className={`btn text-start text-white w-100 ${
              currentPage === "prescriptions"
                ? "bg-white bg-opacity-25"
                : ""
            }`}
            onClick={() => onNavigate("prescriptions")}
          >
            📋 Prescriptions
          </button>

          {/* Bills */}
          <button
            type="button"
            className={`btn text-start text-white w-100 ${
              currentPage === "medicine-bills"
                ? "bg-white bg-opacity-25"
                : ""
            }`}
            onClick={() => onNavigate("medicine-bills")}
          >
            🧾 Medicine Bills
          </button>

          {/* Sales Reports */}
          <button
            type="button"
            className={`btn text-start text-white w-100 ${
              currentPage === "sales-reports"
                ? "bg-white bg-opacity-25"
                : ""
            }`}
            onClick={() => onNavigate("sales-reports")}
          >
            📊 Sales Reports
          </button>

        </div>

        {/* Bottom */}
        <div className="mt-auto">

          <hr />

          <button
            type="button"
            className="btn btn-outline-light w-100 mb-2"
            onClick={onBack}
          >
            ← Back
          </button>

          <button
            type="button"
            className="btn btn-outline-danger w-100"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </div>


      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-grow-1">
        {children}
      </div>

    </div>
  );
}

export default PharmacyLayout;