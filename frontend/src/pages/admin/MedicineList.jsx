import { useEffect, useState } from "react";
import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from "../../services/medicineService";

function MedicineList({ onBack }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMedicine, setDeletingMedicine] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    medicine_name: "",
    medicine_type: "",
    manufacturer: "",
    batch_number: "",
    manufacture_date: "",
    expiry_date: "",
    price_per_unit: "",
    stock_quantity: "",
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
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setFormErrors({
      ...formErrors,
      [name]: "",
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
      stock_quantity: "",
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
      stock_quantity: medicine.stock_quantity ?? "",
    });

    setFormErrors({});
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (medicine) => {
    setDeletingMedicine(medicine);
    setError("");
    setSuccess("");
    setShowDeleteModal(true);
  };

  // Delete medicine
  const handleDelete = async () => {
    if (!deletingMedicine) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await deleteMedicine(deletingMedicine.medicine_id);

      setMedicines((prev) =>
        prev.filter(
          (medicine) =>
            medicine.medicine_id !== deletingMedicine.medicine_id
        )
      );

      setShowDeleteModal(false);
      setDeletingMedicine(null);

      setSuccess("Medicine deleted successfully.");
    } catch (error) {
      setShowDeleteModal(false);
      setDeletingMedicine(null);
      setError(error.message);
    } finally {
      setDeleting(false);
    }
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

    if (
      formData.stock_quantity === "" ||
      Number(formData.stock_quantity) < 0
    ) {
      errors.stock_quantity =
        "Stock quantity cannot be negative.";
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
          general: data,
        };
      }

      return data;
    } catch {
      return {
        general: error.message,
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

        stock_quantity: Number(formData.stock_quantity),
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
            Manage clinic medicines and stock
          </p>
        </div>

        <button
          className="btn btn-secondary px-4"
          onClick={onBack}
        >
          Back
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

                    <option value="Tablet">
                      Tablet
                    </option>

                    <option value="Capsule">
                      Capsule
                    </option>

                    <option value="Syrup">
                      Syrup
                    </option>

                    <option value="Injection">
                      Injection
                    </option>

                    <option value="Cream">
                      Cream
                    </option>

                    <option value="Drops">
                      Drops
                    </option>

                    <option value="Other">
                      Other
                    </option>

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

                {/* Stock Quantity */}
                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stock_quantity"
                    className={`form-control ${
                      formErrors.stock_quantity
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    step="1"
                  />

                  {formErrors.stock_quantity && (
                    <div className="invalid-feedback">
                      {formErrors.stock_quantity}
                    </div>
                  )}

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
              Add Medicine
            </button>

          </div>

          {/* Search */}
          <div className="mb-4">

            <div className="input-group">

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

          {/* Loading */}
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
                    <th>Stock</th>
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
                        {medicine.stock_quantity}
                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(medicine)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDeleteClick(medicine)
                            }
                          >
                            Delete
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingMedicine && (

        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Delete Medicine
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingMedicine(null);
                  }}
                  disabled={deleting}
                />

              </div>

              <div className="modal-body">

                <p className="mb-2">
                  Are you sure you want to delete this medicine?
                </p>

                <p className="fw-semibold mb-0">
                  {deletingMedicine.medicine_name}
                </p>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingMedicine(null);
                  }}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MedicineList;