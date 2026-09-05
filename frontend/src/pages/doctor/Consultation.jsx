// useEffect loads medicine data when the consultation page opens.
import { useEffect, useState } from "react";
import axios from "axios";


// Form used by the doctor to enter consultation details.
function Consultation({ appointmentId, onBack, onSaved }) {
    const [symptoms, setSymptoms] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");

    // Tracks API request state and messages.
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Stores medicine prescription rows added during the consultation.
    const [medicines, setMedicines] = useState([
        {
            medicine_id: "",
            other_medicine_name: "",
            other_medicine_type: "",
            dosage: "",
            quantity: 1,
            frequency: "",
            duration: "",
        },
    ]);

    // Stores lab tests selected during the consultation.
    const [labTests, setLabTests] = useState([
        {
            lab_test_id: "",
        },
    ]);

    // Stores medicines retrieved from the Pharmacy medicine master.
    const [medicineOptions, setMedicineOptions] = useState([]);

    // Stores lab tests retrieved from the Laboratory module.
    const [labTestOptions, setLabTestOptions] = useState([]);

    // Saves the consultation first, then saves medicine and lab prescriptions.
    const handleSaveConsultation = async () => {
        // Prevent empty required fields from being submitted.
        if (!symptoms.trim() || !diagnosis.trim()) {
            setError("Symptoms and diagnosis are required.");
            return;
        }

        const token = localStorage.getItem("access_token");

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            // Step 1: Save the main consultation.
            const response = await axios.post(
                `http://127.0.0.1:8000/api/doctor/appointments/${appointmentId}/consultation/`,
                {
                    symptoms: symptoms.trim(),
                    diagnosis: diagnosis.trim(),
                    notes: notes.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // The backend returns this ID after creating the consultation.
            const consultationId = response.data.consultation_id;

            // Step 2: Save each valid medicine prescription row.
            for (const medicine of medicines) {
                const hasClinicMedicine = medicine.medicine_id;
                const hasOutsideMedicine = medicine.other_medicine_name.trim();

                // Ignore completely empty medicine rows.
                if (!hasClinicMedicine && !hasOutsideMedicine) {
                    continue;
                }

                await axios.post(
                    `http://127.0.0.1:8000/api/doctor/consultations/${consultationId}/medicine-prescriptions/`,
                    {
                        // Clinic medicine uses medicine_id.
                        medicine_id: hasClinicMedicine
                            ? Number(medicine.medicine_id)
                            : null,

                        // Outside medicine uses manual name/type.
                        other_medicine_name: hasOutsideMedicine
                            ? medicine.other_medicine_name.trim()
                            : null,

                        other_medicine_type: hasOutsideMedicine
                            ? medicine.other_medicine_type.trim()
                            : null,

                        dosage: medicine.dosage.trim(),
                        quantity: Number(medicine.quantity),
                        frequency: medicine.frequency.trim(),
                        duration: medicine.duration.trim(),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // Step 3: Save each selected lab prescription.
            for (const test of labTests) {
                // Ignore empty lab rows.
                if (!test.lab_test_id) {
                    continue;
                }

                await axios.post(
                    `http://127.0.0.1:8000/api/doctor/consultations/${consultationId}/lab-prescriptions/`,
                    {
                        lab_test_id: Number(test.lab_test_id),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            setSuccess("Consultation and prescriptions saved successfully.");
            // Open the read-only consultation page after everything saves successfully.
            onSaved(appointmentId);
        } catch (error) {
            console.error("Error saving consultation:", error);

            setError(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                "Unable to save consultation."
            );
        } finally {
            setSaving(false);
        }
    };

    // Updates one field in a medicine prescription row.
    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...medicines];

        updatedMedicines[index][field] = value;

        setMedicines(updatedMedicines);
    };

    // Adds another medicine prescription row.
    const addMedicineRow = () => {
        setMedicines([
            ...medicines,
            {
                medicine_id: "",
                other_medicine_name: "",
                other_medicine_type: "",
                dosage: "",
                quantity: 1,
                frequency: "",
                duration: "",
            },
        ]);
    };

    // Removes a medicine row from the form.
    const removeMedicineRow = (index) => {
        const updatedMedicines = medicines.filter(
            (_, medicineIndex) => medicineIndex !== index
        );

        setMedicines(updatedMedicines);
    };

    // Updates the selected test in one lab prescription row.
    const handleLabTestChange = (index, value) => {
        const updatedLabTests = [...labTests];

        updatedLabTests[index].lab_test_id = value;

        setLabTests(updatedLabTests);
    };

    // Adds another lab test prescription row.
    const addLabTestRow = () => {
        setLabTests([
            ...labTests,
            {
                lab_test_id: "",
            },
        ]);
    };

    // Removes a lab test prescription row.
    const removeLabTestRow = (index) => {
        const updatedLabTests = labTests.filter(
            (_, labIndex) => labIndex !== index
        );

        setLabTests(updatedLabTests);
    };

    // Load clinic medicines for the prescription dropdown.
    useEffect(() => {
        const loadMedicines = async () => {
            try {
                const token = localStorage.getItem("access_token");

                const response = await axios.get(
                    "http://127.0.0.1:8000/api/pharmacy/medicines/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setMedicineOptions(response.data);
            } catch (err) {
                console.error("Failed to load medicines:", err);
            }
        };

        loadMedicines();
    }, []);

    // Load available lab tests for the prescription dropdown.
    useEffect(() => {
        const loadLabTests = async () => {
            try {
                const token = localStorage.getItem("access_token");

                const response = await axios.get(
                    "http://127.0.0.1:8000/api/laboratory/tests/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setLabTestOptions(response.data);
            } catch (err) {
                console.error("Failed to load lab tests:", err);
            }
        };

        loadLabTests();
    }, []);

    return (
        <div className="container-fluid min-vh-100 bg-light p-4">
            {/* Page header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Consultation</h2>
                    <p className="text-muted mb-0">
                        Appointment ID: {appointmentId}
                    </p>
                </div>

                <button
                    className="btn btn-outline-secondary"
                    onClick={onBack}
                >
                    Back to Appointments
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-4">Consultation Details</h5>

                    {/* Symptoms are required when saving the consultation. */}
                    <div className="mb-3">
                        <label className="form-label">
                            Symptoms <span className="text-danger">*</span>
                        </label>

                        <textarea
                            className="form-control"
                            rows="3"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Enter patient symptoms"
                        />
                    </div>

                    {/* Diagnosis is also required by the backend. */}
                    <div className="mb-3">
                        <label className="form-label">
                            Diagnosis <span className="text-danger">*</span>
                        </label>

                        <textarea
                            className="form-control"
                            rows="3"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter diagnosis"
                        />
                    </div>

                    {/* Notes are optional. */}
                    <div className="mb-3">
                        <label className="form-label">Notes</label>

                        <textarea
                            className="form-control"
                            rows="3"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter additional notes"
                        />
                    </div>

                    {/* Medicine prescription section */}
                    <hr className="my-4" />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Medicine Prescription</h5>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={addMedicineRow}
                        >
                            + Add Medicine
                        </button>
                    </div>

                    {medicines.map((medicine, index) => (
                        <div
                            className="border rounded p-3 mb-3"
                            key={index}
                        >
                            <div className="row g-3">

                                {/* Clinic medicine selection will be populated from the API later. */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Clinic Medicine
                                    </label>

                                    <select
                                        className="form-select"
                                        value={medicine.medicine_id}
                                        onChange={(e) =>
                                            handleMedicineChange(
                                                index,
                                                "medicine_id",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select medicine
                                        </option>


                                        {/* Display medicines from the Pharmacy medicine master. */}
                                        {medicineOptions.map((medicine) => (
                                            <option key={medicine.id} value={medicine.id}>
                                                {medicine.name} - {medicine.type}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* Used when the required medicine is not in the clinic pharmacy. */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Outside Medicine Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={medicine.other_medicine_name}
                                        onChange={(e) =>
                                            handleMedicineChange(
                                                index,
                                                "other_medicine_name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter outside medicine"
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Medicine Type
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={medicine.other_medicine_type}
                                        onChange={(e) =>
                                            handleMedicineChange(
                                                index,
                                                "other_medicine_type",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Tablet, Syrup, etc."
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Dosage
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={medicine.dosage}
                                        onChange={(e) =>
                                            handleMedicineChange(
                                                index,
                                                "dosage",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 500 mg"
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        value={medicine.quantity}
                                        onChange={(e) =>
                                            handleMedicineChange(
                                                index,
                                                "quantity",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Frequency
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={medicine.frequency}
                                        onChange={(e) =>
                                            handleMedicineChange(
                                                index,
                                                "frequency",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Twice daily"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Duration
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={medicine.duration}
                                        onChange={(e) =>
                                            handleMedicineChange(
                                                index,
                                                "duration",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 5 days"
                                    />
                                </div>
                            </div>

                            {/* Keep at least one medicine row visible. */}
                            {medicines.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger mt-3"
                                    onClick={() => removeMedicineRow(index)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Lab prescription section */}
                    <hr className="my-4" />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Lab Prescription</h5>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={addLabTestRow}
                        >
                            + Add Lab Test
                        </button>
                    </div>

                    {labTests.map((labTest, index) => (
                        <div
                            className="border rounded p-3 mb-3"
                            key={index}
                        >
                            <div className="row">
                                <div className="col-md-8">
                                    <label className="form-label">
                                        Lab Test
                                    </label>

                                    {/* Lab test options will be loaded from the API later. */}
                                    <select
                                        className="form-select"
                                        value={labTest.lab_test_id}
                                        onChange={(e) =>
                                            handleLabTestChange(index, e.target.value)
                                        }
                                    >
                                        <option value="">Select lab test</option>
                                        {/* Display tests from the Laboratory master list. */}
                                        {labTestOptions.map((test) => (
                                            <option key={test.id} value={test.id}>
                                                {test.test_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4 d-flex align-items-end">
                                    {/* Keep at least one lab test row visible. */}
                                    {labTests.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => removeLabTestRow(index)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Show API feedback to the doctor. */}
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}

                    {/* Save the completed consultation. */}
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleSaveConsultation}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Consultation"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Consultation;