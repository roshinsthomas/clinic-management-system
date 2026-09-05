const API_URL = "http://127.0.0.1:8000";

const getToken = () => localStorage.getItem("access_token");

export const getMedicines = async (search = "") => {
  const response = await fetch(
    `${API_URL}/api/medicines/?search=${encodeURIComponent(search)}`,
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
      "Failed to fetch medicines."
    );
  }

  return data;
};

export const addMedicine = async (medicineData) => {
  const response = await fetch(
    `${API_URL}/api/medicines/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(medicineData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};

export const updateMedicine = async (id, medicineData) => {
  const response = await fetch(
    `${API_URL}/api/medicines/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(medicineData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};
export const deleteMedicine = async (id) => {
  const response = await fetch(
    `${API_URL}/api/medicines/${id}/`,
    {
      method: "DELETE",
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
      "Medicine could not be deleted."
    );
  }

  return data;
};