import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";

export default function Grievances({ currentUser }) {
  const [grievances, setGrievances] = useState([]);

  // Tenant Submit Form fields
  const [category, setCategory] = useState("WiFi Down");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/grievances");
      const data = await response.json();
      // Newest grievances first
      setGrievances(data.reverse());
    } catch (err) {
      console.error("Error fetching grievances:", err);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!description) {
      setError("Please fill in the description.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await apiCall("http://localhost:5000/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: currentUser.tenantId,
          category,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Grievance reported directly to Warden! We will look into it shortly.",
        );
        setDescription("");
        fetchGrievances();
      } else {
        setError(data.message || "Failed to submit grievance.");
      }
    } catch (err) {
      setError("Connection failed. Ensure backend server is running.");
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const response = await apiCall(
        `http://localhost:5000/api/grievances/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      if (response.ok) {
        fetchGrievances();
      }
    } catch (err) {
      console.error("Update grievance status failed:", err);
    }
  };

  // Filter grievances if logged in as a tenant (only show their own complaints)
  const visibleGrievances =
    currentUser.role === "tenant"
      ? grievances.filter((g) => g.tenantId === currentUser.tenantId)
      : grievances;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          currentUser.role === "tenant"
            ? "repeat(auto-fit, minmax(320px, 1fr))"
            : "1fr",
        gap: "2rem",
      }}
    >
      {/* COLUMN LEFT: Form to report complaint (Tenant Only) */}
      {currentUser.role === "tenant" && (
        <div className="glass-panel" style={{ height: "fit-content" }}>
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i
              className="fa-solid fa-bullhorn"
              style={{ color: "var(--accent-primary)" }}
            ></i>
            <span>Convey Problem</span>
          </h2>
          <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Report problems directly to the PG owner. WiFi outages, electrical
            issues, appliances malfunctioning, plumbing issues, etc.
          </p>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
                padding: "0.75rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#a7f3d0",
                padding: "0.75rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmitComplaint}>
            <div className="form-group">
              <label>Grievance Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="WiFi Down">
                  🌐 WiFi Password / Connection Outage
                </option>
                <option value="Washing Machine">
                  🧺 Washing Machine not working
                </option>
                <option value="Electricity Outage">
                  ⚡ Electricity Outage / Shortage
                </option>
                <option value="Plumbing / Water">
                  🚰 Plumbing / No Water Supply
                </option>
                <option value="Housekeeping">
                  🧹 Cleanliness / Housekeeping
                </option>
                <option value="Other Problems">
                  ❓ Other General Problems
                </option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label>Describe the Problem</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Explain the issue in detail so the warden can resolve it quickly..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "none" }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              <i className="fa-solid fa-paper-plane"></i> Submit Grievance
            </button>
          </form>
        </div>
      )}

      {/* COLUMN RIGHT: Log list of grievances */}
      <div className="glass-panel" style={{ flex: 1, padding: "1.75rem" }}>
        <h2
          style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <i
            className="fa-solid fa-list-check"
            style={{ color: "var(--accent-warning)" }}
          ></i>
          <span>
            {currentUser.role === "admin"
              ? "Active Grievance Log"
              : "My Reported Grievances"}
          </span>
        </h2>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {visibleGrievances.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "3rem 0",
              }}
            >
              <i
                className="fa-solid fa-shield-halved"
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                  opacity: "0.2",
                }}
              ></i>
              <div>
                No reported problems found! Everything is running smoothly.
              </div>
            </div>
          ) : (
            visibleGrievances.map((g) => {
              let statusBadgeClass = "badge-pending";
              if (g.status === "Resolved") statusBadgeClass = "badge-paid";
              if (g.status === "Pending") statusBadgeClass = "badge-unpaid";

              return (
                <div
                  key={g.id || g._id}
                  className="glass-card"
                  style={{
                    padding: "1.25rem",
                    hover: "none",
                    borderLeft: `4px solid ${g.status === "Pending" ? "var(--accent-danger)" : g.status === "In Progress" ? "var(--accent-warning)" : "var(--accent-success)"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <span
                        className="badge"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {g.category}
                      </span>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                        Room {g.roomNumber}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            color: "var(--text-muted)",
                          }}
                        >
                          • By {g.tenantName}
                        </span>
                      </h4>
                    </div>
                    <span
                      className={`badge ${statusBadgeClass}`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {g.status}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      margin: "0.75rem 0",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {g.description}
                  </p>

                  {/* Admin controls to update status */}
                  {currentUser.role === "admin" && g.status !== "Resolved" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "1rem",
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        paddingTop: "0.85rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          alignSelf: "center",
                          marginRight: "0.5rem",
                        }}
                      >
                        Update Status:
                      </span>

                      {g.status === "Pending" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(g.id || g._id, "In Progress")
                          }
                          className="btn btn-secondary"
                          style={{
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.75rem",
                            borderRadius: "8px",
                          }}
                        >
                          <i
                            className="fa-solid fa-spinner"
                            style={{ color: "var(--accent-warning)" }}
                          ></i>{" "}
                          In Progress
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleUpdateStatus(g.id || g._id, "Resolved")
                        }
                        className="btn btn-success"
                        style={{
                          padding: "0.35rem 0.75rem",
                          fontSize: "0.75rem",
                          borderRadius: "8px",
                        }}
                      >
                        <i className="fa-solid fa-check"></i> Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
