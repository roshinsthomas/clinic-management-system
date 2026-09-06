// Base URL of the Django backend.
const API_URL = "http://127.0.0.1:8000";

/**
 * Return the JWT access token stored after login.
 */
const getAccessToken = () => {
  return localStorage.getItem("access_token");
};


// ============================================================
// DEPARTMENT APIs
// ============================================================

/**
 * Get all departments.
 */
export const getDepartments = async () => {
  const token = getAccessToken();

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


/**
 * Add a new department.
 */
export const addDepartment = async (
  department_name,
  status = true
) => {
  const token = getAccessToken();

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


/**
 * Update an existing department.
 */
export const updateDepartment = async (
  id,
  department_name,
  status
) => {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/api/departments/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        department_name,
        status,
      }),
    }
  );

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


/**
 * Delete a department.
 */
export const deleteDepartment = async (id) => {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/api/departments/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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


// ============================================================
// STAFF APIs
// ============================================================

/**
 * Get staff members.
 * An optional search value can be used to filter the results.
 */
export const getStaff = async (search = "") => {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/api/staff/?search=${encodeURIComponent(search)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.error ||
        "Failed to fetch staff."
    );
  }

  return data;
};


/**
 * Create a new staff member.
 *
 * staffData contains the User and Staff fields
 * expected by the Django serializer.
 */
export const addStaff = async (staffData) => {
  const token = getAccessToken();

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
    console.log("ADD STAFF BACKEND ERROR:", data);

    const error = new Error(JSON.stringify(data));

    error.responseData = data;

    throw error;
  }

  return data;
};

/**
 * Update an existing staff member.
 */
export const updateStaff = async (id, staffData) => {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/api/staff/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    // Preserve serializer validation errors for the UI.
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


/**
 * Activate or deactivate a staff member.
 */
export const updateStaffStatus = async (id, status) => {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/api/staff/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

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


// ============================================================
// DOCTOR APIs
// ============================================================

/**
 * Get doctors.
 * If a search term is supplied, send it as a query parameter.
 */
export const getDoctors = async (search = "") => {
  const token = getAccessToken();

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


/**
 * Create a new doctor.
 */
export const addDoctor = async (doctorData) => {
  const token = getAccessToken();

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
    // Preserve backend validation errors for the form.
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


/**
 * Update an existing doctor.
 */
export const updateDoctor = async (id, doctorData) => {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/api/doctors/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doctorData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    // Preserve serializer field errors for the frontend form.
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


/**
 * Activate or deactivate a doctor.
 */
export const updateDoctorStatus = async (id, status) => {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/api/doctors/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

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