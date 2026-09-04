import React, { useEffect, useState } from "react";
import { getLabTests } from "../../services/laboratoryService";

function LabTests({ onPageChange }) {
  const [labTests, setLabTests] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLabTests();
      setLabTests(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = labTests.filter((test) => {
    const matchesSearch = test.test_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDepartment =
      department === "" ||
      test.department === department;

    return matchesSearch && matchesDepartment;
  });

  const departments = [
    ...new Set(labTests.map((test) => test.department)),
  ];

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Laboratory Tests
          </h2>

          <p className="text-muted mb-0">
            View available laboratory tests
          </p>
        </div>

        {/* Back to Dashboard */}
        <button
          className="btn btn-outline-primary"
          onClick={() => onPageChange("laboratory")}
        >
          ← Back to Dashboard
        </button>

      </div>

      {/* Search and Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <div className="row g-3">

            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search laboratory tests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
              >
                <option value="">
                  All Departments
                </option>

                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center p-5">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-2 text-muted">
            Loading laboratory tests...
          </p>

        </div>
      ) : (

        /* Lab Tests Table */
        <div className="card border-0 shadow-sm">

          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Available Tests
            </h5>

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Test Name</th>
                    <th>Department</th>
                    <th>Unit</th>
                    <th>Sample Required</th>
                    <th>Normal Range</th>
                    <th>Price</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTests.length > 0 ? (
                    filteredTests.map((test, index) => (

                      <tr key={test.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td className="fw-semibold">
                          {test.test_name}
                        </td>

                        <td>
                          {test.department}
                        </td>

                        <td>
                          {test.unit}
                        </td>

                        <td>
                          {test.sample_required}
                        </td>

                        <td>
                          {test.normal_range}
                        </td>

                        <td>
                          ₹{test.price}
                        </td>

                      </tr>

                    ))
                  ) : (

                    <tr>
                      <td
                        colSpan="7"
                        className="text-center text-muted p-4"
                      >
                        No laboratory tests found.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default LabTests;