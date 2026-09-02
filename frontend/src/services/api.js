const API_URL = "http://127.0.0.1:8000";

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

  if (!response.ok) {
    throw new Error(
      data.detail || "Invalid username or password"
    );
  }

  return data;
};

export const getDepartments = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/departments/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch departments");
  }

  return data;
};

export const updateDepartment = async (id, department_name, status) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/departments/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      department_name,
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update department");
  }

  return data;
};

export const deleteDepartment = async (id) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/departments/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to delete department");
  }

  return true;
};

export const addDepartment = async (department_name, status = true) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/departments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      department_name,
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.department_name?.[0] ||
      data.detail ||
      "Failed to add department"
    );
  }

  return data;
};

export const getStaff = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/staff/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch staff");
  }

  return data;
};

export const getDoctors = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/doctors/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch doctors");
  }

  return data;
};

export const updateDoctorStatus = async (id, status) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/doctors/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update doctor status"
    );
  }

  return data;
};

export const updateStaffStatus = async (id, status) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/staff/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update staff status"
    );
  }

  return data;
};