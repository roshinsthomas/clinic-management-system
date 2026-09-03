const API_URL = "http://127.0.0.1:8000";

// LOGIN

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
      data.username?.[0] ||
      data.password?.[0] ||
      data.detail ||
      data.non_field_errors?.[0] ||
      "Invalid username or password."
    );
  }

  return data;
};

// GET DEPARTMENTS

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
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch departments"
    );
  }

  return data;
};

// UPDATE DEPARTMENT

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
    throw new Error(
      data.department_name?.[0] ||
      data.detail ||
      data.error ||
      "Failed to update department"
    );
  }

  return data;
};

// DELETE DEPARTMENT

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

    throw new Error(
      data.detail ||
      data.error ||
      "Failed to delete department"
    );
  }

  return true;
};

// ADD DEPARTMENT

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
      data.error ||
      "Failed to add department"
    );
  }

  return data;
};

// GET STAFF

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
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch staff"
    );
  }

  return data;
};

// ADD STAFF

export const addStaff = async (staffData) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/staff/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.detail ||
      data.non_field_errors?.[0] ||
      "Failed to add staff"
    );

    error.responseData = data;
    throw error;
  }

  return data;
};

// UPDATE STAFF

export const updateStaff = async (id, staffData) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/staff/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.detail ||
      data.non_field_errors?.[0] ||
      "Failed to update staff"
    );

    error.responseData = data;
    throw error;
  }

  return data;
};

// ACTIVATE / DEACTIVATE STAFF

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
      data.detail ||
      data.error ||
      data.non_field_errors?.[0] ||
      "Failed to update staff status"
    );
  }

  return data;
};

// GET DOCTORS / SEARCH DOCTORS

export const getDoctors = async (search = "") => {
  const token = localStorage.getItem("access_token");

  const url = search
    ? `${API_URL}/api/doctors/?search=${encodeURIComponent(search)}`
    : `${API_URL}/api/doctors/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch doctors"
    );
  }

  return data;
};

// ADD DOCTOR

export const addDoctor = async (doctorData) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/doctors/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doctorData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.detail ||
      data.non_field_errors?.[0] ||
      "Failed to add doctor"
    );

    error.responseData = data;
    throw error;
  }

  return data;
};

// UPDATE DOCTOR

export const updateDoctor = async (id, doctorData) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/api/doctors/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(doctorData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.detail ||
      data.non_field_errors?.[0] ||
      "Failed to update doctor"
    );

    error.responseData = data;
    throw error;
  }

  return data;
};

// ACTIVATE / DEACTIVATE DOCTOR

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
      data.detail ||
      data.error ||
      data.non_field_errors?.[0] ||
      "Failed to update doctor status"
    );
  }

  return data;
};