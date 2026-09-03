import { useEffect, useState } from "react";
import {
  getMedicines,
  updateMedicineStock,
} from "../../services/pharmacyApi";

function MedicineInventory({ onBack }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");

  // Load medicines
  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMedicines();

      setMedicines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  // Open stock update modal
  const openStockModal = (medicine) => {
    setSelectedMedicine(medicine);
    setStockQuantity(medicine.stock_quantity);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
    setStockQuantity("");
  };

  // Update stock
  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (stockQuantity === "" || Number(stockQuantity) < 0) {
      setError("Stock quantity cannot be negative.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await updateMedicineStock(
        selectedMedicine.id,
        Number(stockQuantity)
      );

      setSuccess("Stock updated successfully.");

      closeModal();

      // Reload medicine list
      await loadMedicines();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Medicine Inventory
          </h2>

          <p className="text-muted mb-0">
            View medicines and manage stock
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>

      {/* Success message */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Medicine Table */}
      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Available Medicines
            </h5>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadMedicines}
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="text-muted mt-2">
                Loading medicines...
              </p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">
                No medicines found.
              </p>
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Manufacturer</th>
                    <th>Batch No.</th>
                    <th>Manufacture Date</th>
                    <th>Expiry Date</th>
                    <th>Price / Unit</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {medicines.map((medicine) => (

                    <tr key={medicine.id}>

                      <td className="fw-semibold">
                        {medicine.name}
                      </td>

                      <td>
                        {medicine.type}
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

                        <span
                          className={
                            medicine.stock_quantity === 0
                              ? "badge bg-danger"
                              : medicine.stock_quantity <= 10
                              ? "badge bg-warning text-dark"
                              : "badge bg-success"
                          }
                        >
                          {medicine.stock_quantity}
                        </span>

                      </td>

                      <td>

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            openStockModal(medicine)
                          }
                        >
                          Update Stock
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

      {/* Stock Update Modal */}

      {showModal && selectedMedicine && (

        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Update Stock
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>

              </div>

              <form onSubmit={handleStockUpdate}>

                <div className="modal-body">

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Medicine
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={selectedMedicine.name}
                      disabled
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Current Stock
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={selectedMedicine.stock_quantity}
                      disabled
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      New Stock Quantity
                    </label>

                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={stockQuantity}
                      onChange={(e) =>
                        setStockQuantity(e.target.value)
                      }
                      required
                    />

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update Stock
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MedicineInventory;