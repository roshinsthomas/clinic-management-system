import { useEffect, useState } from "react";
import {
  getMedicines,
  addMedicine,
  updateMedicine,
  updateMedicineStatus
} from "../../services/medicineService";

function MedicineList({ onBack }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    medicine_name: "",
    medicine_type: "",
    manufacturer: "",
    batch_number: "",
    manufacture_date: "",
    expiry_date: "",
    price_per_unit: "",
    status: true
  });

  // Load medicines
  const loadMedicines = async (search = searchTerm) => {
    try {
      setLoading(true);
      setError("");

      const data = await getMedicines(search);
      setMedicines(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines("");
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });

    setFormErrors({
      ...formErrors,
      [name]: ""
    });

    setError("");
  };

  // Open add form
  const handleAdd = () => {
    setEditingMedicine(null);
    setFormData({
      medicine_name: "",
      medicine_type: "",
      manufacturer: "",
      batch_number: "",
      manufacture_date: "",
      expiry_date: "",
      price_per_unit: "",
      status: true
    });
    setFormErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);

    setFormData({
      medicine_name: medicine.medicine_name || "",
      medicine_type: medicine.medicine_type || "",
      manufacturer: medicine.manufacturer || "",
      batch_number: medicine.batch_number || "",
      manufacture_date: medicine.manufacture_date || "",
      expiry_date: medicine.expiry_date || "",
      price_per_unit: medicine.price_per_unit || "",
      status: medicine.status
    });

    setFormErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.medicine_name.trim()) {
      errors.medicine_name = "Medicine name is required.";
    }

    if (!formData.medicine_type) {
      errors.medicine_type = "Medicine type is required.";
    }

    if (!formData.manufacturer.trim()) {
      errors.manufacturer = "Manufacturer is required.";
    }

    if (!formData.batch_number.trim()) {
      errors.batch_number = "Batch number is required.";
    }

    if (!formData.manufacture_date) {
      errors.manufacture_date = "Manufacture date is required.";
    }

    if (!formData.expiry_date) {
      errors.expiry_date = "Expiry date is required.";
    }

    if (
      formData.manufacture_date &&
      formData.expiry_date &&
      formData.expiry_date <= formData.manufacture_date
    ) {
      errors.expiry_date =
        "Expiry date must be after manufacture date.";
    }

    if (
      formData.price_per_unit === "" ||
      Number(formData.price_per_unit) <= 0
    ) {
      errors.price_per_unit =
        "Price per unit must be greater than 0.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // Convert backend errors
  const getBackendErrors = (error) => {
    try {
      const data = JSON.parse(error.message);

      if (typeof data === "string") {
        return {
          general: data
        };
      }

      return data;
    } catch {
      return {
        general: error.message
      };
    }
  };

  // Add or update medicine
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const medicineData = {
        medicine_name: formData.medicine_name.trim(),
        medicine_type: formData.medicine_type,
        manufacturer: formData.manufacturer.trim(),
        batch_number: formData.batch_number.trim(),
        manufacture_date: formData.manufacture_date,
        expiry_date: formData.expiry_date,
        price_per_unit: formData.price_per_unit,
        status: formData.status
      };

      if (editingMedicine) {
        await updateMedicine(
          editingMedicine.medicine_id,
          medicineData
        );

        setSuccess("Medicine updated successfully.");
      } else {
        await addMedicine(medicineData);

        setSuccess("Medicine added successfully.");
      }

      setShowForm(false);
      setEditingMedicine(null);
      setFormErrors({});

      await loadMedicines();
    } catch (error) {
      const backendErrors = getBackendErrors(error);

      if (backendErrors.general) {
        setError(backendErrors.general);
      } else {
        setFormErrors(backendErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Activate or deactivate medicine
  const handleStatusChange = async (medicine) => {
    const action = medicine.status ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${medicine.medicine_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await updateMedicineStatus(
        medicine.medicine_id,
        !medicine.status
      );

      setSuccess(
        `Medicine ${action}d successfully.`
      );

      await loadMedicines();
    } catch (error) {
      const backendErrors = getBackendErrors(error);

      if (backendErrors.general) {
        setError(backendErrors.general);
      } else {
        setError("Unable to update medicine status.");
      }
    }
  };

  // Search
  const handleSearch = async () => {
    await loadMedicines(searchTerm);
  };

  // Clear search
  const handleClear = async () => {
    setSearchTerm("");
    await loadMedicines("");
  };

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Medicine Management
          </h2>

          <p className="text-muted mb-0">
            Manage clinic medicines
          </p>
        </div>

        <button
          className="btn btn-secondary px-4"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">
                {editingMedicine
                  ? "Edit Medicine"
                  : "Add Medicine"}
              </h4>

              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormErrors({});
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                {/* Medicine Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Medicine Name
                  </label>

                  <input
                    type="text"
                    name="medicine_name"
                    className={`form-control ${
                      formErrors.medicine_name
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.medicine_name}
                    onChange={handleChange}
                  />

                  {formErrors.medicine_name && (
                    <div className="invalid-feedback">
                      {formErrors.medicine_name}
                    </div>
                  )}
                </div>

                {/* Medicine Type */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Medicine Type
                  </label>

                  <select
                    name="medicine_type"
                    className={`form-select ${
                      formErrors.medicine_type
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.medicine_type}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select medicine type
                    </option>
                    <option value="TABLET">Tablet</option>
                    <option value="CAPSULE">Capsule</option>
                    <option value="SYRUP">Syrup</option>
                    <option value="INJECTION">Injection</option>
                    <option value="CREAM">Cream</option>
                    <option value="OINTMENT">Ointment</option>
                    <option value="DROPS">Drops</option>
                    <option value="OTHER">Other</option>
                  </select>

                  {formErrors.medicine_type && (
                    <div className="invalid-feedback">
                      {formErrors.medicine_type}
                    </div>
                  )}
                </div>

                {/* Manufacturer */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Manufacturer
                  </label>

                  <input
                    type="text"
                    name="manufacturer"
                    className={`form-control ${
                      formErrors.manufacturer
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.manufacturer}
                    onChange={handleChange}
                  />

                  {formErrors.manufacturer && (
                    <div className="invalid-feedback">
                      {formErrors.manufacturer}
                    </div>
                  )}
                </div>

                {/* Batch Number */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Batch Number
                  </label>

                  <input
                    type="text"
                    name="batch_number"
                    className={`form-control ${
                      formErrors.batch_number
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.batch_number}
                    onChange={handleChange}
                  />

                  {formErrors.batch_number && (
                    <div className="invalid-feedback">
                      {formErrors.batch_number}
                    </div>
                  )}
                </div>

                {/* Manufacture Date */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Manufacture Date
                  </label>

                  <input
                    type="date"
                    name="manufacture_date"
                    className={`form-control ${
                      formErrors.manufacture_date
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.manufacture_date}
                    onChange={handleChange}
                  />

                  {formErrors.manufacture_date && (
                    <div className="invalid-feedback">
                      {formErrors.manufacture_date}
                    </div>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    name="expiry_date"
                    className={`form-control ${
                      formErrors.expiry_date
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.expiry_date}
                    onChange={handleChange}
                  />

                  {formErrors.expiry_date && (
                    <div className="invalid-feedback">
                      {formErrors.expiry_date}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Price Per Unit
                  </label>

                  <input
                    type="number"
                    name="price_per_unit"
                    className={`form-control ${
                      formErrors.price_per_unit
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.price_per_unit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />

                  {formErrors.price_per_unit && (
                    <div className="invalid-feedback">
                      {formErrors.price_per_unit}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check mt-4">
                    <input
                      type="checkbox"
                      name="status"
                      className="form-check-input"
                      checked={formData.status}
                      onChange={handleChange}
                      id="medicineStatus"
                    />

                    <label
                      className="form-check-label fw-semibold"
                      htmlFor="medicineStatus"
                    >
                      Active Medicine
                    </label>
                  </div>
                </div>

              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingMedicine
                    ? "Update Medicine"
                    : "Add Medicine"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Medicine Table */}
      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">

          {/* Table Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="fw-bold mb-0">
              Medicines
            </h4>

            <button
              className="btn btn-primary"
              onClick={handleAdd}
            >
              + Add Medicine
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
                placeholder="Search by name, type, manufacturer or batch..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <button
                className="btn btn-primary"
                onClick={handleSearch}
              >
                Search
              </button>

              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}

            </div>

          </div>

          {loading ? (
            <p className="text-muted">
              Loading medicines...
            </p>
          ) : medicines.length === 0 ? (

            <div className="text-center py-4">
              <p className="text-muted mb-0">
                {searchTerm
                  ? "No medicines found matching your search."
                  : "No medicines found."}
              </p>
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>ID</th>
                    <th>Medicine Name</th>
                    <th>Type</th>
                    <th>Manufacturer</th>
                    <th>Batch Number</th>
                    <th>Manufacture Date</th>
                    <th>Expiry Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {medicines.map((medicine) => (

                    <tr key={medicine.medicine_id}>

                      <td className="fw-semibold">
                        {medicine.medicine_id}
                      </td>

                      <td className="fw-semibold">
                        {medicine.medicine_name}
                      </td>

                      <td>
                        {medicine.medicine_type}
                      </td>

                      <td>
                        {medicine.manufacturer}
                      </td>

                      <td>
                        {medicine.batch_number}
                      </td>

                      <td>
                        {medicine.manufacture_date}
                      </td>

                      <td>
                        {medicine.expiry_date}
                      </td>

                      <td>
                        ₹{medicine.price_per_unit}
                      </td>

                      <td>
                        {medicine.status ? (
                          <span className="badge bg-success px-3 py-2">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary px-3 py-2">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(medicine)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className={`btn btn-sm ${
                              medicine.status
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                            }`}
                            onClick={() =>
                              handleStatusChange(medicine)
                            }
                          >
                            {medicine.status
                              ? "Deactivate"
                              : "Activate"}
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

export default MedicineList;