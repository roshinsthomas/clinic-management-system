import { useState } from "react";

function PatientRegistration() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    blood_group: "",
    status: "Active",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/receptionist/patients/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data));
      }

      setMessage("Patient registered successfully!");

      setFormData({
        first_name: "",
        last_name: "",
        dob: "",
        gender: "",
        address: "",
        phone: "",
        email: "",
        blood_group: "",
        status: "Active",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      dob: "",
      gender: "",
      address: "",
      phone: "",
      email: "",
      blood_group: "",
      status: "Active",
    });

    setMessage("");
    setError("");
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">

        <div className="mb-4">
          <h2 className="fw-bold">Patient Registration</h2>
          <p className="text-muted">
            Register a new patient in the clinic.
          </p>
        </div>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* First Name */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Gender */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Gender
                  </label>

                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Blood Group */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Blood Group
                  </label>

                  <select
                    name="blood_group"
                    className="form-select"
                    value={formData.blood_group}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Status */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Address */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Address
                  </label>

                  <textarea
                    name="address"
                    className="form-control"
                    rows="4"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter patient address"
                    required
                  ></textarea>
                </div>

              </div>

              {/* Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-2 mt-4">

                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Patient"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={clearForm}
                >
                  Clear
                </button>

              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default PatientRegistration;