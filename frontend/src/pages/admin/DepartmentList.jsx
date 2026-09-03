import { useEffect, useState } from "react";
import {
  getDepartments,
  updateDepartment,
  deleteDepartment,
  addDepartment,
} from "../../services/api";

function DepartmentList({ onBack }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Edit states
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Add states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [adding, setAdding] = useState(false);

  // Status update state
  const [changingStatus, setChangingStatus] = useState(null);

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

  // UPDATE DEPARTMENT
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

  // ACTIVATE / DEACTIVATE
  const handleStatusChange = async (department) => {
    const newStatus = !department.status;

    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${department.department_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingStatus(department.department_id);
      setError("");

      await updateDepartment(
        department.department_id,
        department.department_name,
        newStatus
      );

      await loadDepartments();
    } catch (error) {
      setError(error.message);
    } finally {
      setChangingStatus(null);
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

  // SEARCH DEPARTMENTS
  const filteredDepartments = departments.filter((department) =>
    department.department_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim())
  );

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

        <button
          className="btn btn-secondary px-4"
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
              className="btn btn-primary me-2 px-4"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Department"}
            </button>

            <button
              className="btn btn-secondary px-4"
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
              className="btn btn-primary me-2 px-4"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              className="btn btn-secondary px-4"
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

        <div className="card-body p-4">

          {/* Table Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="fw-bold mb-0">
              Departments
            </h4>

            <button
              className="btn btn-primary px-4"
              onClick={handleShowAddForm}
            >
              + Add Department
            </button>

          </div>

          {/* Search */}
          <div className="mb-4">

            <div className="input-group">

              <span className="input-group-text bg-white">
                🔍
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search departments by name..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}

            </div>

          </div>

          {loading ? (
            <p className="text-muted">
              Loading departments...
            </p>
          ) : filteredDepartments.length === 0 ? (

            <div className="text-center py-4">

              <p className="text-muted mb-0">
                {searchTerm
                  ? "No departments found matching your search."
                  : "No departments found."}
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th style={{ width: "8%" }}>
                      ID
                    </th>

                    <th style={{ width: "30%" }}>
                      Department Name
                    </th>

                    <th style={{ width: "17%" }}>
                      Status
                    </th>

                    <th
                      style={{ width: "22%" }}
                      className="text-center"
                    >
                      Status Actions
                    </th>

                    <th
                      style={{ width: "23%" }}
                      className="text-center"
                    >
                      Manage
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredDepartments.map((department) => (

                    <tr key={department.department_id}>

                      {/* ID */}
                      <td className="fw-semibold">
                        {department.department_id}
                      </td>

                      {/* Department Name */}
                      <td className="fw-semibold">
                        {department.department_name}
                      </td>

                      {/* Status */}
                      <td>

                        {department.status ? (

                          <span className="badge bg-success px-3 py-2">
                             Active
                          </span>

                        ) : (

                          <span className="badge bg-secondary px-3 py-2">
                             Inactive
                          </span>

                        )}

                      </td>

                      {/* STATUS ACTIONS */}
                      <td className="text-center">

                        <button
                          className={
                            department.status
                              ? "btn btn-outline-warning px-3"
                              : "btn btn-outline-success px-3"
                          }
                          onClick={() =>
                            handleStatusChange(department)
                          }
                          disabled={
                            changingStatus ===
                            department.department_id
                          }
                        >

                          {changingStatus ===
                          department.department_id
                            ? "Updating..."
                            : department.status
                            ? " Deactivate"
                            : " Activate"}

                        </button>

                      </td>

                      {/* MANAGE */}
                      <td className="text-center">

                        <div className="d-flex justify-content-center gap-2">

                          {/* EDIT */}
                          <button
                            className="btn btn-outline-primary px-3"
                            onClick={() =>
                              handleEdit(department)
                            }
                            disabled={
                              changingStatus ===
                              department.department_id
                            }
                          >
                            ✎ Edit
                          </button>

                          {/* DELETE */}
                          <button
                            className="btn btn-outline-danger px-3"
                            onClick={() =>
                              handleDelete(department)
                            }
                            disabled={
                              changingStatus ===
                              department.department_id
                            }
                          >
                            🗑 Delete
                          </button>

                        </div>

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