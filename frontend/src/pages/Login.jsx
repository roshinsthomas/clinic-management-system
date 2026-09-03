import { useState } from "react";
import { loginUser } from "../services/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setServerError("");

    // Validate before sending request
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const cleanUsername = username.trim();

      const data = await loginUser(
        cleanUsername,
        password
      );

      console.log("Login successful:", data);

      // --------------------------------------------------------
      // Save login information
      // --------------------------------------------------------

      localStorage.setItem(
        "access_token",
        data.access
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh
      );

      localStorage.setItem(
        "role",
        data.role
      );

      localStorage.setItem(
        "staff_id",
        data.staff_id
      );

      localStorage.setItem(
        "username",
        data.username
      );

      localStorage.setItem(
        "status",
        data.status
      );

      // --------------------------------------------------------
      // Login successful
      // --------------------------------------------------------

      onLogin(data.role);

    } catch (error) {
      console.error("Login error:", error);

      setServerError(
        error.message || "Invalid username or password."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // USERNAME CHANGE
  // ============================================================

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);

    // Remove username error while typing
    if (errors.username) {
      setErrors((previous) => ({
        ...previous,
        username: ""
      }));
    }

    // Remove server error while typing
    if (serverError) {
      setServerError("");
    }
  };

  // ============================================================
  // PASSWORD CHANGE
  // ============================================================

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    // Remove password error while typing
    if (errors.password) {
      setErrors((previous) => ({
        ...previous,
        password: ""
      }));
    }

    // Remove server error while typing
    if (serverError) {
      setServerError("");
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

      <div
        className="card border-0 shadow-lg"
        style={{
          width: "500px",
          borderRadius: "18px",
        }}
      >

        <div className="card-body p-5">

          {/* ==================================================
              TITLE
          ================================================== */}

          <div className="text-center mb-4">

            <h2 className="fw-bold text-primary text-nowrap mb-2">
              Clinic Management System
            </h2>

            <p className="text-muted mb-0">
              Sign in to continue
            </p>

          </div>


          {/* ==================================================
              SERVER ERROR
          ================================================== */}

          {serverError && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              {serverError}
            </div>
          )}


          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          <form onSubmit={handleLogin} noValidate>

            {/* ==================================================
                USERNAME
            ================================================== */}

            <div className="mb-3">

              <label className="form-label fw-semibold">
                Username
              </label>

              <input
                type="text"
                className={`form-control ${
                  errors.username ? "is-invalid" : ""
                }`}
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                disabled={loading}
              />

              {errors.username && (
                <div className="invalid-feedback">
                  {errors.username}
                </div>
              )}

            </div>


            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div className="mb-4">

              <label className="form-label fw-semibold">
                Password
              </label>

              <div className="input-group">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              {errors.password && (
                <div className="text-danger small mt-1">
                  {errors.password}
                </div>
              )}

            </div>


            {/* ==================================================
                LOGIN BUTTON
            ================================================== */}

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;