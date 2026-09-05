import { useEffect, useState } from "react";
import {
  getDepartments
} from "../../services/api";
import {
  getLabTests,
  addLabTest,
  updateLabTest,
  updateLabTestStatus
} from "../../services/labTestService";

function LabTestList({ onBack }) {
  const [labTests, setLabTests] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState(null);

  const [formData, setFormData] = useState({
    test_name: "",
    department: "",
    unit: "",
    sample_required: "",
    normal_range: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load lab tests
  const loadLabTests = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const data = await getLabTests(searchValue);
      setLabTests(data);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load lab tests.");
    } finally {
      setLoading(false);
    }
  };

  // Load departments
  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load departments.");
    }
  };

  useEffect(() => {
    loadLabTests();
    loadDepartments();
  }, []);

  // Search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLabTests(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open add form
  const handleAdd = () => {
    setEditingLabTest(null);

    setFormData({
      test_name: "",
      department: "",
      unit: "",
      sample_required: "",
      normal_range: ""
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (labTest) => {
    setEditingLabTest(labTest);

    setFormData({
      test_name: labTest.test_name || "",
      department: labTest.department || "",
      unit: labTest.unit || "",
      sample_required: labTest.sample_required || "",
      normal_range: labTest.normal_range || ""
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Validation
  const validateForm = () => {
    if (!formData.test_name.trim()) {
      return "Test name is required.";
    }

    if (!formData.department) {
      return "Department is required.";
    }

    if (!formData.unit.trim()) {
      return "Unit is required.";
    }

    if (!formData.sample_required.trim()) {
      return "Sample required is required.";
    }

    if (!formData.normal_range.trim()) {
      return "Normal range is required.";
    }

    if (formData.test_name.trim().length < 2) {
      return "Test name must contain at least 2 characters.";
    }

    return "";
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const data = {
      test_name: formData.test_name.trim(),
      department: Number(formData.department),
      unit: formData.unit.trim(),
      sample_required: formData.sample_required.trim(),
      normal_range: formData.normal_range.trim()
    };

    try {
      if (editingLabTest) {
        await updateLabTest(
          editingLabTest.test_id,
          data
        );

        setSuccess("Lab test updated successfully.");
      } else {
        await addLabTest(data);

        setSuccess("Lab test added successfully.");
      }

      setShowForm(false);

      setFormData({
        test_name: "",
        department: "",
        unit: "",
        sample_required: "",
        normal_range: ""
      });

      setEditingLabTest(null);

      await loadLabTests(search);

    } catch (error) {
      console.error(error);

      try {
        const parsedError = JSON.parse(error.message);
        setError(
          parsedError.test_name?.[0] ||
          parsedError.department?.[0] ||
          parsedError.unit?.[0] ||
          parsedError.sample_required?.[0] ||
          parsedError.normal_range?.[0] ||
          parsedError.detail ||
          parsedError.error ||
          "Unable to save lab test."
        );
      } catch {
        setError(
          error.message || "Unable to save lab test."
        );
      }
    }
  };

  // Activate / deactivate
  const handleStatusChange = async (labTest) => {
    const newStatus = !labTest.status;

    try {
      setError("");
      setSuccess("");

      await updateLabTestStatus(
        labTest.test_id,
        newStatus
      );

      setSuccess(
        newStatus
          ? "Lab test activated successfully."
          : "Lab test deactivated successfully."
      );

      await loadLabTests(search);

    } catch (error) {
      console.error(error);
      setError(
        error.message ||
        "Unable to update lab test status."
      );
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Lab Test Management
          </h2>

          <p className="text-muted mb-0">
            Manage laboratory test master data
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          Back
        </button>

      </div>

      {/* Messages */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Add button and search */}
      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-center">

            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search lab tests..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="col-md-4 text-md-end">

              <button
                className="btn btn-primary"
                onClick={handleAdd}
              >
                + Add Lab Test
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-4">
              {editingLabTest
                ? "Edit Lab Test"
                : "Add Lab Test"}
            </h5>

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* Test Name */}
                <div className="col-md-6">

                  <label className="form-label">
                    Test Name
                  </label>

                  <input
                    type="text"
                    name="test_name"
                    className="form-control"
                    value={formData.test_name}
                    onChange={handleChange}
                    placeholder="Enter test name"
                  />

                </div>

                {/* Department */}
                <div className="col-md-6">

                  <label className="form-label">
                    Department
                  </label>

                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Department
                    </option>

                    {departments
                      .filter(
                        (department) =>
                          department.status
                      )
                      .map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.department_name}
                        </option>
                      ))}

                  </select>

                </div>

                {/* Unit */}
                <div className="col-md-4">

                  <label className="form-label">
                    Unit
                  </label>

                  <input
                    type="text"
                    name="unit"
                    className="form-control"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="Example: mg/dL"
                  />

                </div>

                {/* Sample Required */}
                <div className="col-md-4">

                  <label className="form-label">
                    Sample Required
                  </label>

                  <input
                    type="text"
                    name="sample_required"
                    className="form-control"
                    value={formData.sample_required}
                    onChange={handleChange}
                    placeholder="Example: Blood"
                  />

                </div>

                {/* Normal Range */}
                <div className="col-md-4">

                  <label className="form-label">
                    Normal Range
                  </label>

                  <input
                    type="text"
                    name="normal_range"
                    className="form-control"
                    value={formData.normal_range}
                    onChange={handleChange}
                    placeholder="Example: 70-100"
                  />

                </div>

              </div>

              <div className="mt-4">

                <button
                  type="submit"
                  className="btn btn-success me-2"
                >
                  {editingLabTest
                    ? "Update Lab Test"
                    : "Add Lab Test"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLabTest(null);
                    setError("");
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Lab Tests Table */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Lab Tests
          </h5>

          {loading ? (
            <p className="text-muted">
              Loading lab tests...
            </p>
          ) : labTests.length === 0 ? (
            <p className="text-muted">
              No lab tests found.
            </p>
          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>

                    <th>ID</th>
                    <th>Test Name</th>
                    <th>Department</th>
                    <th>Unit</th>
                    <th>Sample Required</th>
                    <th>Normal Range</th>
                    <th>Status</th>
                    <th>Actions</th>

                  </tr>
                </thead>

                <tbody>

                  {labTests.map((labTest) => (

                    <tr key={labTest.test_id}>

                      <td>
                        {labTest.test_id}
                      </td>

                      <td className="fw-semibold">
                        {labTest.test_name}
                      </td>

                      <td>
                        {labTest.department_name}
                      </td>

                      <td>
                        {labTest.unit}
                      </td>

                      <td>
                        {labTest.sample_required}
                      </td>

                      <td>
                        {labTest.normal_range}
                      </td>

                      <td>
                        {labTest.status ? (
                          <span className="badge bg-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>

                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() =>
                            handleEdit(labTest)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className={
                            labTest.status
                              ? "btn btn-sm btn-outline-danger"
                              : "btn btn-sm btn-outline-success"
                          }
                          onClick={() =>
                            handleStatusChange(
                              labTest
                            )
                          }
                        >
                          {labTest.status
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default LabTestList;

