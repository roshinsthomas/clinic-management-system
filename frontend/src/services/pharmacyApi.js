const BASE_URL = "http://127.0.0.1:8000/api/pharmacy";


// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


// =====================================================
// MEDICINES
// =====================================================

// Get all medicines
export const getMedicines = async () => {
  const response = await fetch(
    `${BASE_URL}/medicines/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to fetch medicines";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};


// Update medicine stock
export const updateMedicineStock = async (
  medicineId,
  stockQuantity
) => {
  const response = await fetch(
    `${BASE_URL}/medicines/${medicineId}/stock/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        stock_quantity: stockQuantity,
      }),
    }
  );

  if (!response.ok) {
    let message = "Failed to update stock";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};


// =====================================================
// PATIENT SEARCH
// =====================================================

export const searchPatient = async (search) => {
  const response = await fetch(
    `${BASE_URL}/patients/search/?search=${encodeURIComponent(search)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to search patient";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};


// =====================================================
// APPOINTMENTS
// =====================================================

export const getPatientAppointments = async (patientId) => {
  const response = await fetch(
    `${BASE_URL}/patients/${patientId}/appointments/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to fetch appointments";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};


// =====================================================
// PRESCRIPTIONS
// =====================================================

export const getAppointmentPrescriptions = async (appointmentId) => {
  const response = await fetch(
    `${BASE_URL}/appointments/${appointmentId}/prescriptions/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to fetch prescriptions";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};


export const getPendingPrescriptions = async () => {
  const response = await fetch(
    `${BASE_URL}/prescriptions/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to fetch pending prescriptions";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};


// Dispense medicine
export const dispenseMedicine = async (prescriptionId) => {
  const response = await fetch(
    `${BASE_URL}/dispense/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prescription_id: prescriptionId,
      }),
    }
  );

  if (!response.ok) {
    let message = "Failed to dispense medicine";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};


// =====================================================
// MEDICINE BILLS
// =====================================================

// Get all medicine bills
export const getMedicineBills = async () => {
  const response = await fetch(
    `${BASE_URL}/bills/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  console.log("BILLS STATUS:", response.status);

  const data = await response.json();

  console.log("BILLS RESPONSE:", data);

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch medicine bills"
    );
  }

  return data;
};


// =====================================================
// SALES REPORT
// =====================================================

export const getSalesReport = async (period) => {
  const response = await fetch(
    `${BASE_URL}/reports/sales/?period=${period}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to fetch sales report";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};

// =====================================================
// PHARMACY DASHBOARD SUMMARY
// =====================================================

export const getPharmacyDashboardSummary = async () => {
  const response = await fetch(
    `${BASE_URL}/dashboard/summary/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to fetch dashboard summary";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  return response.json();
};