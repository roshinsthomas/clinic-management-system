import React, { useEffect, useState } from "react";

import {
  getLabTests,
  getLabRequests,
  getLabResults,
} from "../../services/laboratoryService";


function LaboratoryDashboard({ onLogout, onPageChange }) {

  const [labTestsCount, setLabTestsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [completedResultsCount, setCompletedResultsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadDashboardData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        labTests,
        labRequests,
        labResults
      ] = await Promise.all([
        getLabTests(),
        getLabRequests(),
        getLabResults()
      ]);


      // Total laboratory tests
      setLabTestsCount(
        labTests.length
      );


      // Only PENDING requests
      const pendingRequests =
        labRequests.filter(
          (request) =>
            request.status === "PENDING"
        );

      setPendingRequestsCount(
        pendingRequests.length
      );


      // Total completed results
      setCompletedResultsCount(
        labResults.length
      );


    } catch (err) {

      setError(
        err.message ||
        "Failed to load dashboard data"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadDashboardData();

  }, []);


  return (
    <div className="container-fluid min-vh-100 bg-light p-4">


      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Laboratory Dashboard
          </h2>

          <p className="text-muted mb-0">
            Clinic Management System
          </p>

        </div>


        <button
          className="btn btn-outline-danger"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>


      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {/* Dashboard Cards */}
      <div className="row g-4">


        {/* Lab Tests */}
        <div className="col-md-6 col-lg-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h6 className="text-muted">
                Lab Tests
              </h6>

              <h2 className="fw-bold">
                {loading
                  ? "..."
                  : labTestsCount}
              </h2>

              <p className="text-muted mb-3">
                Available laboratory tests
              </p>

              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  onPageChange("lab-tests")
                }
              >
                View Tests
              </button>

            </div>

          </div>

        </div>


        {/* Pending Requests */}
        <div className="col-md-6 col-lg-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h6 className="text-muted">
                Pending Requests
              </h6>

              <h2 className="fw-bold">
                {loading
                  ? "..."
                  : pendingRequestsCount}
              </h2>

              <p className="text-muted mb-3">
                Tests waiting for processing
              </p>

              <button
                className="btn btn-warning btn-sm"
                onClick={() =>
                  onPageChange("lab-requests")
                }
              >
                View Requests
              </button>

            </div>

          </div>

        </div>


        {/* Completed Results */}
        <div className="col-md-6 col-lg-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h6 className="text-muted">
                Completed Results
              </h6>

              <h2 className="fw-bold">
                {loading
                  ? "..."
                  : completedResultsCount}
              </h2>

              <p className="text-muted mb-3">
                Completed laboratory results
              </p>

              <button
                className="btn btn-success btn-sm"
                onClick={() =>
                  onPageChange("lab-results")
                }
              >
                View Results
              </button>

            </div>

          </div>

        </div>


      </div>


      {/* Quick Actions */}
      <div className="card border-0 shadow-sm mt-4">

        <div className="card-body p-4">

          <h5 className="fw-bold mb-3">
            Quick Actions
          </h5>

          <div className="d-flex gap-2 flex-wrap">

            <button
              className="btn btn-primary"
              onClick={() =>
                onPageChange("lab-tests")
              }
            >
              View Lab Tests
            </button>


            <button
              className="btn btn-warning"
              onClick={() =>
                onPageChange("lab-requests")
              }
            >
              View Requests
            </button>


            <button
              className="btn btn-success"
              onClick={() =>
                onPageChange("lab-results")
              }
            >
              View Results
            </button>


            <button
              className="btn btn-info"
              onClick={() =>
                onPageChange("enter-lab-result")
              }
            >
              Enter Lab Result
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default LaboratoryDashboard;