import { useState } from "react";
import { loginUser } from "../services/api";

  function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(username, password);

      console.log("Login successful:", data);
      console.log("ACCESS TOKEN:", data.access);
      console.log("REFRESH TOKEN:", data.refresh);


      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("role", data.role);
      localStorage.setItem("staff_id", data.staff_id);
      localStorage.setItem("username", data.username);

      onLogin(data.role);
     
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary text-nowrap mb-2">
              Clinic Management System
            </h2>

            <p className="text-muted mb-0">
              Sign in to continue
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Username
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}

export default Login;