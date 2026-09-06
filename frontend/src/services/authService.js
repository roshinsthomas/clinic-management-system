// Base address of the Django backend.
const API_URL = "http://127.0.0.1:8000";

/**
 * Send the username and password to Django's JWT login endpoint.
 * Returns the access token, refresh token, role and staff information.
 */
export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/api/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  // Convert backend validation errors into a readable frontend error.
  if (!response.ok) {
    throw new Error(
      data.username?.[0] ||
        data.password?.[0] ||
        data.detail ||
        data.non_field_errors?.[0] ||
        "Invalid username or password."
    );
  }

  return data;
};