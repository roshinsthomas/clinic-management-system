const API_URL = "http://127.0.0.1:8000";

const getToken = () => localStorage.getItem("access_token");

// Get all lab tests / search lab tests
export const getLabTests = async (search = "") => {
  const response = await fetch(
    `${API_URL}/api/lab-tests/?search=${encodeURIComponent(search)}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch lab tests."
    );
  }

  return data;
};

// Add lab test
export const addLabTest = async (labTestData) => {
  const response = await fetch(
    `${API_URL}/api/lab-tests/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(labTestData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      JSON.stringify(data)
    );
  }

  return data;
};

// Update lab test
export const updateLabTest = async (id, labTestData) => {
  const response = await fetch(
    `${API_URL}/api/lab-tests/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(labTestData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      JSON.stringify(data)
    );
  }

  return data;
};

// Activate / deactivate lab test
export const updateLabTestStatus = async (id, status) => {
  return updateLabTest(id, { status });
};

