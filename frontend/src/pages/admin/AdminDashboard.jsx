import { useEffect, useState } from "react";
import {
  getDepartments,
  getStaff,
  getDoctors,
} from "../../services/adminService";
import { getMedicines } from "../../services/medicineService";
import { getLabTests } from "../../services/labTestService";

function AdminDashboard({
  onDepartmentClick,
  onStaffClick,
  onDoctorClick,
  onMedicineClick,
  onLabTestClick,
  onLogout,
}) {
  const [counts, setCounts] = useState({
    departments: 0,
    staff: 0,
    doctors: 0,
    medicines: 0,
    labTests: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          departments,
          staff,
          doctors,
          medicines,
          labTests,
        ] = await Promise.all([
          getDepartments(),
          getStaff(),
          getDoctors(),
          getMedicines(),
          getLabTests(),
        ]);

        setCounts({
          departments: Array.isArray(departments)
            ? departments.length
            : 0,

          staff: Array.isArray(staff)
            ? staff.length
            : 0,

          doctors: Array.isArray(doctors)
            ? doctors.length
            : 0,

          medicines: Array.isArray(medicines)
            ? medicines.length
            : 0,

          labTests: Array.isArray(labTests)
            ? labTests.length
            : 0,
        });
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const cards = [
    {
      title: "Departments",
      count: counts.departments,
      description:
        "Manage departments and maintain their active status.",
      onClick: onDepartmentClick,
    },
    {
      title: "Staff",
      count: counts.staff,
      description:
        "Manage administrative and support staff records.",
      onClick: onStaffClick,
    },
    {
      title: "Doctors",
      count: counts.doctors,
      description:
        "Manage doctor profiles, departments and professional details.",
      onClick: onDoctorClick,
    },
    {
      title: "Medicines",
      count: counts.medicines,
      description:
        "Manage medicine master data and availability.",
      onClick: onMedicineClick,
    },
    {
      title: "Lab Tests",
      count: counts.labTests,
      description:
        "Manage laboratory test master data and test details.",
      onClick: onLabTestClick,
    },
  ];

  return (
    
      
      <div className="container-fluid min-vh-100 bg-light p-4">
        {/* Header */}
        {/* Dashboard page title */}
        <div className="container mt-3">

          <div className="mb-4">
            <h2 className="fw-bold">Admin Dashboard</h2>

            <p className="text-muted mb-0">
              Manage clinic master data and staff records.
            </p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container py-5">

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          {/* Cards */}
          <div className="row g-4">

            {cards.map((card) => (
              <div
                key={card.title}
                className="col-12 col-md-6 col-lg-4"
              >
                <div
                  onClick={card.onClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      card.onClick();
                    }
                  }}
                  style={{
                    height: "100%",
                    minHeight: "260px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e1e5ea",
                    borderTop: "4px solid #0d6efd",
                    borderRadius: "10px",
                    padding: "30px",
                    cursor: "pointer",
                    boxShadow:
                      "0 3px 10px rgba(0, 0, 0, 0.05)",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-3px)";

                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0, 0, 0, 0.09)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(0)";

                    e.currentTarget.style.boxShadow =
                      "0 3px 10px rgba(0, 0, 0, 0.05)";
                  }}
                >

                  {/* Card Title */}
                  <h5
                    className="fw-semibold mb-3"
                    style={{
                      color: "#212529",
                      fontSize: "20px",
                    }}
                  >
                    {card.title}
                  </h5>

                  {/* Card Description */}
                  <p
                    style={{
                      color: "#5f6b7a",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      minHeight: "50px",
                      marginBottom: "28px",
                    }}
                  >
                    {card.description}
                  </p>

                  {/* Divider */}
                  <hr
                    style={{
                      border: "0",
                      borderTop: "1px solid #e9ecef",
                      margin: "0 0 24px 0",
                    }}
                  />

                  {/* Count */}
                  <div className="d-flex align-items-baseline">
                    <span
                      style={{
                        color: "#0d6efd",
                        fontSize: "36px",
                        fontWeight: "600",
                        lineHeight: "1",
                      }}
                    >
                      {loading ? "..." : card.count}
                    </span>

                    <span
                      style={{
                        color: "#5f6b7a",
                        fontSize: "15px",
                        marginLeft: "9px",
                      }}
                    >
                      records
                    </span>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
      );
}

      export default AdminDashboard;