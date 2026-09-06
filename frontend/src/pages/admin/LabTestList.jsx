import { useEffect, useState } from "react";

import {
  getLabTests,
  addLabTest,
  updateLabTest
} from "../../services/labTestService";

function LabTestList({ onBack }) {

  const [labTests, setLabTests] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState(null);

  const [formData, setFormData] = useState({
    test_name: "",
    department: "",
    unit: "",
    sample_required: "",
    normal_range: "",
    price: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD LAB TESTS
  // ============================================================

  const loadLabTests = async (searchValue = "") => {

    try {

      setLoading(true);
      setError("");

      const data = await getLabTests(searchValue);

      setLabTests(data);

    } catch (error) {

      console.error(error);

      setError(
        error.message || "Failed to load lab tests."
      );

    } finally {

      setLoading(false);

    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadLabTests();

  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  useEffect(() => {

    const timer = setTimeout(() => {

      loadLabTests(search);

    }, 300);

    return () => clearTimeout(timer);

  }, [search]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

  };

  // ============================================================
  // ADD LAB TEST
  // ============================================================

  const handleAdd = () => {

    setEditingLabTest(null);

    setFormData({
      test_name: "",
      department: "",
      unit: "",
      sample_required: "",
      normal_range: "",
      price: ""
    });

    setError("");
    setSuccess("");

    setShowForm(true);

  };

  // ============================================================
  // EDIT LAB TEST
  // ============================================================

  const handleEdit = (labTest) => {

    setEditingLabTest(labTest);

    setFormData({
      test_name: labTest.test_name || "",
      department: labTest.department || "",
      unit: labTest.unit || "",
      sample_required: labTest.sample_required || "",
      normal_range: labTest.normal_range || "",
      price: labTest.price || ""
    });

    setError("");
    setSuccess("");

    setShowForm(true);

  };

  // ============================================================
  // TOGGLE ACTIVE / INACTIVE
  // ============================================================

  const handleToggleStatus = async (labTest) => {

    try {

      setError("");
      setSuccess("");

      const newStatus = !labTest.status;

      await updateLabTest(
        labTest.id,
        {
          status: newStatus
        }
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

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {

    if (!formData.test_name.trim()) {

      return "Test name is required.";

    }

    if (!formData.department.trim()) {

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

    if (!formData.price) {

      return "Price is required.";

    }

    if (Number(formData.price) <= 0) {

      return "Price must be greater than 0.";

    }

    if (formData.test_name.trim().length < 2) {

      return "Test name must contain at least 2 characters.";

    }

    return "";

  };

  // ============================================================
  // SUBMIT FORM
  // ============================================================

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

      department: formData.department.trim(),

      unit: formData.unit.trim(),

      sample_required:
        formData.sample_required.trim(),

      normal_range:
        formData.normal_range.trim(),

      price: Number(formData.price)

    };

    try {

      if (editingLabTest) {

        await updateLabTest(
          editingLabTest.id,
          data
        );

        setSuccess(
          "Lab test updated successfully."
        );

      } else {

        await addLabTest(data);

        setSuccess(
          "Lab test added successfully."
        );

      }

      setShowForm(false);

      setFormData({
        test_name: "",
        department: "",
        unit: "",
        sample_required: "",
        normal_range: "",
        price: ""
      });

      setEditingLabTest(null);

      await loadLabTests(search);

    } catch (error) {

      console.error(error);

      try {

        const parsedError =
          JSON.parse(error.message);

        setError(

          parsedError.test_name?.[0] ||

          parsedError.department?.[0] ||

          parsedError.unit?.[0] ||

          parsedError.sample_required?.[0] ||

          parsedError.normal_range?.[0] ||

          parsedError.price?.[0] ||

          parsedError.status?.[0] ||

          parsedError.detail ||

          parsedError.error ||

          "Unable to save lab test."

        );

      } catch {

        setError(
          error.message ||
          "Unable to save lab test."
        );

      }

    }

  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const handleCancel = () => {

    setShowForm(false);

    setEditingLabTest(null);

    setError("");

  };

  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Lab Test Management
          </h2>

          <p className="text-muted mb-0">
            Manage laboratory test master data
          </p>

        </div>

        

      </div>

      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {success && (

        <div className="alert alert-success">

          {success}

        </div>

      )}

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}

      {/* ======================================================
          SEARCH + ADD
      ====================================================== */}

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

      {/* ======================================================
          ADD / EDIT FORM
      ====================================================== */}

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

                {/* TEST NAME */}

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

                {/* DEPARTMENT */}

                <div className="col-md-6">

                  <label className="form-label">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                  />

                </div>

                {/* UNIT */}

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

                {/* SAMPLE REQUIRED */}

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

                {/* NORMAL RANGE */}

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

                {/* PRICE */}

                <div className="col-md-4">

                  <label className="form-label">
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />

                </div>

              </div>

              {/* FORM BUTTONS */}

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
                  onClick={handleCancel}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================================
          LAB TEST TABLE
      ====================================================== */}

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

                    <th>Price</th>

                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {labTests.map((labTest) => (

                    <tr key={labTest.id}>

                      <td>
                        {labTest.id}
                      </td>

                      <td className="fw-semibold">
                        {labTest.test_name}
                      </td>

                      <td>
                        {labTest.department}
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
                        ₹{labTest.price}
                      </td>

                      {/* ACTIONS */}

                      <td>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() =>
                            handleEdit(labTest)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${
                            labTest.status
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() =>
                            handleToggleStatus(labTest)
                          }
                        >
                          {labTest.status
                            ? "Inactive"
                            : "Active"}
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