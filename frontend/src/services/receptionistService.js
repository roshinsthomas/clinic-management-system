// Base URL of the Django backend.
const API_URL = "http://127.0.0.1:8000";


/**
 * Return the JWT access token stored after login.
 */
const getAccessToken = () => {
  return localStorage.getItem("access_token");
};


/**
 * Build the common authenticated request headers.
 */
const getAuthHeaders = (includeJson = false) => {
  const token = getAccessToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  // Add JSON content type only when the request contains a JSON body.
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};


/**
 * Convert DRF validation errors into one readable message.
 */
const getErrorMessage = (
  data,
  fallbackMessage = "Request failed."
) => {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.error) {
    return data.error;
  }

  if (
    Array.isArray(data.non_field_errors) &&
    data.non_field_errors.length > 0
  ) {
    return data.non_field_errors[0];
  }

  const fieldMessages = Object.entries(data)
    .map(([field, messages]) => {
      if (Array.isArray(messages)) {
        return `${field}: ${messages.join(", ")}`;
      }

      return `${field}: ${messages}`;
    })
    .join(" | ");

  return fieldMessages || fallbackMessage;
};


/**
 * Convert DRF paginated responses into normal arrays.
 */
const getResultList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
};


// ============================================================
// PATIENT APIs
// ============================================================

/**
 * Get all patients.
 */
export const getPatients = async () => {
  const response = await fetch(
    `${API_URL}/api/receptionist/patients/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to fetch patients."
      )
    );
  }

  return data;
};


/**
 * Get one patient's complete details.
 */
export const getPatientById = async (patientId) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/patients/${patientId}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to load patient details."
      )
    );
  }

  return data;
};


/**
 * Register a new patient.
 *
 * Validation errors from Django are preserved in
 * error.responseData so the form can display field errors.
 */
export const addPatient = async (patientData) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/patients/`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(patientData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(
        data,
        "Please correct the highlighted fields."
      )
    );

    // Preserve backend field errors for PatientRegistration.jsx.
    error.responseData = data;

    throw error;
  }

  return data;
};


/**
 * Fully update an existing patient.
 *
 * PatientList.jsx currently uses PUT, so this service
 * preserves that existing behavior.
 */
export const updatePatient = async (
  patientId,
  patientData
) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/patients/${patientId}/`,
    {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: JSON.stringify(patientData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(
        data,
        "Failed to update patient."
      )
    );

    error.responseData = data;

    throw error;
  }

  return data;
};


/**
 * Activate or deactivate a patient.
 */
export const updatePatientStatus = async (
  patientId,
  status
) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/patients/${patientId}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to update patient status."
      )
    );
  }

  return data;
};


// ============================================================
// DOCTOR + DEPARTMENT LOOKUP APIs
// ============================================================

/**
 * Get doctors for appointment scheduling.
 */
export const getDoctors = async () => {
  const response = await fetch(
    `${API_URL}/api/doctors/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to fetch doctors."
      )
    );
  }

  return data;
};


/**
 * Get departments for appointment scheduling.
 */
export const getDepartments = async () => {
  const response = await fetch(
    `${API_URL}/api/departments/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to fetch departments."
      )
    );
  }

  return data;
};


/**
 * Load patients, doctors and departments together
 * for ScheduleAppointment.jsx.
 */
export const getAppointmentFormData = async () => {
  const [
    patientsData,
    doctorsData,
    departmentsData,
  ] = await Promise.all([
    getPatients(),
    getDoctors(),
    getDepartments(),
  ]);

  return {
    patients: getResultList(patientsData),
    doctors: getResultList(doctorsData),
    departments: getResultList(departmentsData),
  };
};


// ============================================================
// APPOINTMENT APIs
// ============================================================

/**
 * Get appointments.
 *
 * Pass appointmentDate when only appointments for
 * one specific day are needed.
 */
export const getAppointments = async (
  appointmentDate = ""
) => {
  let url =
    `${API_URL}/api/receptionist/appointments/`;

  if (appointmentDate) {
    url +=
      `?appointment_date=${encodeURIComponent(
        appointmentDate
      )}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to load appointments."
      )
    );
  }

  return data;
};


/**
 * Get one appointment.
 *
 * This is needed after bill payment because the
 * bill response does not contain the updated token number.
 */
export const getAppointmentById = async (
  appointmentId
) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/appointments/${appointmentId}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to load appointment details."
      )
    );
  }

  return data;
};


/**
 * Get available slots for a doctor on a specific date.
 */
export const getAvailableSlots = async (
  doctorId,
  appointmentDate
) => {
  const url =
    `${API_URL}/api/receptionist/appointments/available-slots/` +
    `?doctor=${encodeURIComponent(doctorId)}` +
    `&date=${encodeURIComponent(appointmentDate)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to fetch available appointment slots."
      )
    );
  }

  return data;
};


/**
 * Create a new appointment.
 */
export const addAppointment = async (
  appointmentData
) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/appointments/`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(appointmentData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(
        data,
        "Failed to schedule appointment."
      )
    );

    // Preserve DRF field errors if the page needs them.
    error.responseData = data;

    throw error;
  }

  return data;
};


/**
 * Partially update an appointment.
 *
 * Used for rescheduling/editing appointment details.
 */
export const updateAppointment = async (
  appointmentId,
  appointmentData
) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/appointments/${appointmentId}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(appointmentData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(
        data,
        "Failed to update appointment."
      )
    );

    error.responseData = data;

    throw error;
  }

  return data;
};


/**
 * Cancel a scheduled appointment.
 */
export const cancelAppointment = async (
  appointmentId
) => {
  return updateAppointment(
    appointmentId,
    {
      status: "Cancelled",
    }
  );
};


// ============================================================
// CONSULTATION BILL APIs
// ============================================================

/**
 * Get all consultation bills.
 */
export const getConsultationBills = async () => {
  const response = await fetch(
    `${API_URL}/api/receptionist/consultation-bills/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Failed to load consultation bills."
      )
    );
  }

  return data;
};


/**
 * Create a new consultation bill.
 */
export const addConsultationBill = async (
  billData
) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/consultation-bills/`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(billData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(
        data,
        "Failed to save consultation bill."
      )
    );

    error.responseData = data;

    throw error;
  }

  return data;
};


/**
 * Update an existing consultation bill.
 */
export const updateConsultationBill = async (
  billId,
  billData
) => {
  const response = await fetch(
    `${API_URL}/api/receptionist/consultation-bills/${billId}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(billData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(
        data,
        "Failed to update consultation bill."
      )
    );

    error.responseData = data;

    throw error;
  }

  return data;
};


// ============================================================
// COMBINED PAGE DATA
// ============================================================

/**
 * Load the data required by ReceptionistDashboard.jsx.
 */
export const getReceptionistDashboardData =
  async () => {
    const [
      appointmentsData,
      patientsData,
    ] = await Promise.all([
      getAppointments(),
      getPatients(),
    ]);

    return {
      appointments:
        getResultList(appointmentsData),

      patients:
        getResultList(patientsData),
    };
  };


/**
 * Load the data required by BillList.jsx.
 */
export const getBillListData = async () => {
  const [
    billsData,
    patientsData,
    appointmentsData,
  ] = await Promise.all([
    getConsultationBills(),
    getPatients(),
    getAppointments(),
  ]);

  return {
    bills: getResultList(billsData),
    patients: getResultList(patientsData),
    appointments:
      getResultList(appointmentsData),
  };
};


/**
 * Load all data required by CreateBill.jsx.
 */
export const getCreateBillData = async () => {
  const [
    appointmentsData,
    patientsData,
    doctorsData,
    billsData,
  ] = await Promise.all([
    getAppointments(),
    getPatients(),
    getDoctors(),
    getConsultationBills(),
  ]);

  return {
    appointments:
      getResultList(appointmentsData),

    patients:
      getResultList(patientsData),

    doctors:
      getResultList(doctorsData),

    bills:
      getResultList(billsData),
  };
};