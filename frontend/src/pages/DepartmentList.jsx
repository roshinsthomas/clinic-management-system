import { useEffect, useState } from "react";
import {
  getDepartments,
  updateDepartment,
  deleteDepartment,
  addDepartment,
} from "../services/api";

function DepartmentList({ onBack }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Add states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [adding, setAdding] = useState(false);

  // Load departments
  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // EDIT
  const handleEdit = (department) => {
    setEditingDepartment(department);
    setEditName(department.department_name);
    setShowAddForm(false);
    setError("");
  };

  // CANCEL EDIT
  const handleCancel = () => {
    setEditingDepartment(null);
    setEditName("");
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editName.trim()) {
      setError("Department name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateDepartment(
        editingDepartment.department_id,
        editName.trim(),
        editingDepartment.status
      );

      setEditingDepartment(null);
      setEditName("");

      await loadDepartments();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.department_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteDepartment(department.department_id);

      await loadDepartments();
    } catch (error) {
      setError(error.message);
    }
  };

  // SHOW ADD FORM
  const handleShowAddForm = () => {
    setShowAddForm(true);
    setEditingDepartment(null);
    setEditName("");
    setError("");
  };

  // ADD DEPARTMENT
  const handleAdd = async () => {
    if (!newDepartmentName.trim()) {
      setError("Department name cannot be empty.");
      return;
    }

    try {
      setAdding(true);
      setError("");

      await addDepartment(newDepartmentName.trim());

      setNewDepartmentName("");
      setShowAddForm(false);

      await loadDepartments();
    } catch (error) {
      setError(error.message);
    } finally {
      setAdding(false);
    }
  };

  // CANCEL ADD
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewDepartmentName("");
    setError("");
  };

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Department Management
          </h2>

          <p className="text-muted mb-0">
            Manage clinic departments
          </p>
        </div>

        {/* Back Button */}
        <button
          className="btn btn-secondary"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Add Department Form */}
      {showAddForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Add Department
            </h5>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Department Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter department name"
                value={newDepartmentName}
                onChange={(e) =>
                  setNewDepartmentName(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary me-2"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Department"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleCancelAdd}
              disabled={adding}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* Edit Department Form */}
      {editingDepartment && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Edit Department
            </h5>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Department Name
              </label>

              <input
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) =>
                  setEditName(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary me-2"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* Department Table */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Departments
            </h5>

            <button
              className="btn btn-primary"
              onClick={handleShowAddForm}
            >
              + Add Department
            </button>
          </div>

          {loading ? (
            <p className="text-muted">
              Loading departments...
            </p>
          ) : departments.length === 0 ? (
            <p className="text-muted">
              No departments found.
            </p>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Department Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map((department) => (
                    <tr key={department.department_id}>

                      <td>
                        {department.department_id}
                      </td>

                      <td className="fw-semibold">
                        {department.department_name}
                      </td>

                      <td>
                        {department.status ? (
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

                        {/* Edit */}
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() =>
                            handleEdit(department)
                          }
                        >
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDelete(department)
                          }
                        >
                          Delete
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

export default DepartmentList;