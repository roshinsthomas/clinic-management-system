const API_URL = "http://127.0.0.1:8000";


// Get all laboratory tests
export const getLabTests = async () => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/tests/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch laboratory tests"
    );
  }

  return data;
};


// Get all laboratory prescriptions
export const getLabRequests = async () => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/prescriptions/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch laboratory requests"
    );
  }

  return data;
};


// Get all laboratory results
export const getLabResults = async () => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/results/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch laboratory results"
    );
  }

  return data;
};


// Create laboratory result
export const createLabResult = async (resultData) => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/results/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(resultData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to create laboratory result"
    );
  }

  return data;
};


// Generate laboratory bill
export const createLabBill = async (billData) => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/bills/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(billData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to generate laboratory bill"
    );
  }

  return data;
};


// Get all laboratory bills
export const getLabBills = async () => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/bills/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to fetch laboratory bills"
    );
  }

  return data;
};


// Complete laboratory bill payment
export const payLabBill = async (billId) => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/bills/${billId}/pay/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to complete laboratory bill payment"
    );
  }

  return data;
};


// Email laboratory bill
export const emailLabBill = async (billId) => {

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/api/laboratory/bills/${billId}/email/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      "Failed to email laboratory bill"
    );
  }

  return data;
};