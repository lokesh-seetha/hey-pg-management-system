import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";

export default function Tenants({ currentUser }) {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Wizard fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joinDate, setJoinDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [rentPlan, setRentPlan] = useState("Monthly");
  const [rentAmount, setRentAmount] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTenants();
    fetchRooms();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/tenants");
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  // When room is selected, automatically pre-fill the rent price based on the selected room's rent plan
  const handleRoomSelect = (selectedId) => {
    setRoomId(selectedId);
    const room = rooms.find((r) => r.id === selectedId || r._id === selectedId);
    if (room) {
      setRentAmount(room.rent.toString());
      // Also generate a default username suggestion based on their name if set
      if (name) {
        setUsername(name.toLowerCase().replace(/\s+/g, "") + room.number);
      }
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !phone ||
      !email ||
      !emergencyContact ||
      !roomId ||
      !joinDate ||
      !rentAmount ||
      !username ||
      !password
    ) {
      setError(
        "Please fill in all details, including tenant login credentials.",
      );
      return;
    }

    setError("");

    try {
      const response = await apiCall("http://localhost:5000/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          emergencyContact,
          roomId,
          joinDate,
          rentPlan,
          rentAmount: Number(rentAmount),
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddWizard(false);
        // Clear fields
        setName("");
        setPhone("");
        setEmail("");
        setEmergencyContact("");
        setRoomId("");
        setRentAmount("");
        setUsername("");
        setPassword("");
        fetchTenants();
        fetchRooms();
      } else {
        setError(data.message || "Failed to create tenant profile.");
      }
    } catch (err) {
      setError("Connection failed. Ensure backend server is running.");
    }
  };

  const handleCheckout = async (id) => {
    if (
      !window.confirm(
        "Check out this tenant? This will release their room slot and revoke their login credentials.",
      )
    )
      return;
    try {
      const response = await apiCall(
        `http://localhost:5000/api/tenants/${id}/checkout`,
        {
          method: "POST",
        },
      );
      if (response.ok) {
        fetchTenants();
        fetchRooms();
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  };

  // Filter occupants based on query search
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter vacant rooms that have space
  const availableRooms = rooms.filter((r) => r.currentOccupancy < r.capacity);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
            Occupants Directory
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage profiles, room slot check-ins, and active billing plans.
          </p>
        </div>
        {currentUser.role === "admin" && (
          <button
            onClick={() => setShowAddWizard(true)}
            className="btn btn-primary"
          >
            <i className="fa-solid fa-user-plus"></i> Admit New Tenant
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        className="glass-card"
        style={{
          padding: "1rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          ></i>
          <input
            type="text"
            placeholder="Search occupants by name or room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: "2.5rem", background: "rgba(0,0,0,0.2)" }}
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Occupant Name</th>
                <th>Room</th>
                <th>Check-in Date</th>
                <th>Billing Scheme</th>
                <th>Monthly Rate</th>
                <th>Due Date</th>
                <th>Fee Status</th>
                {currentUser.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentUser.role === "admin" ? 8 : 7}
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "2rem",
                    }}
                  >
                    No occupants match your search query.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr
                    key={t.id || t._id}
                    style={{ opacity: t.status === "Inactive" ? 0.5 : 1 }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          marginTop: "0.15rem",
                        }}
                      >
                        <i
                          className="fa-solid fa-phone"
                          style={{ fontSize: "0.7rem" }}
                        ></i>{" "}
                        {t.phone}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: "rgba(99,102,241,0.06)",
                          color: "var(--accent-primary)",
                          border: "1px solid rgba(99,102,241,0.15)",
                          fontWeight: 700,
                        }}
                      >
                        Room {t.roomNumber}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem" }}>{t.joinDate}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                        {t.rentPlan}
                      </span>
                    </td>
                    <td>
                      <strong>₹{t.rentAmount.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color:
                            t.rentStatus === "Unpaid" && t.status === "Active"
                              ? "var(--accent-danger)"
                              : "inherit",
                          fontWeight:
                            t.rentStatus === "Unpaid" && t.status === "Active"
                              ? 600
                              : 400,
                        }}
                      >
                        {t.dueDate}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${t.status === "Inactive" ? "badge-secondary" : t.rentStatus === "Paid" ? "badge-paid" : "badge-unpaid"}`}
                      >
                        {t.status === "Inactive" ? "Checked Out" : t.rentStatus}
                      </span>
                    </td>
                    {currentUser.role === "admin" && (
                      <td>
                        {t.status === "Active" ? (
                          <button
                            onClick={() => handleCheckout(t.id || t._id)}
                            className="btn btn-danger"
                            style={{
                              padding: "0.35rem 0.75rem",
                              fontSize: "0.78rem",
                              borderRadius: "8px",
                            }}
                          >
                            Check Out
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            Inactive
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================================
         ADD TENANT WIZARD MODAL (ADMIN ONLY)
         ====================================================================== */}
      {showAddWizard && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                Admit New PG Occupant
              </h2>
              <button
                onClick={() => setShowAddWizard(false)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

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

            <form onSubmit={handleCreateTenant}>
              <h4
                style={{
                  fontSize: "0.95rem",
                  color: "var(--accent-primary)",
                  marginBottom: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Personal Information
              </h4>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Autofill username suggestion
                    if (e.target.value && roomId) {
                      const room = rooms.find(
                        (r) => r.id === roomId || r._id === roomId,
                      );
                      setUsername(
                        e.target.value.toLowerCase().replace(/\s+/g, "") +
                          (room ? room.number : ""),
                      );
                    }
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="10 digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Emergency Contact Name / Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 9876543211 (Father)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  required
                />
              </div>

              <h4
                style={{
                  fontSize: "0.95rem",
                  color: "var(--accent-primary)",
                  margin: "1.25rem 0 0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Allocation & Billing Details
              </h4>

              <div className="form-group">
                <label>Assign Available Room Slot</label>
                <select
                  className="form-control"
                  value={roomId}
                  onChange={(e) => handleRoomSelect(e.target.value)}
                  required
                >
                  <option value="">-- Choose Vacant Room --</option>
                  {availableRooms.map((r) => (
                    <option key={r.id || r._id} value={r.id || r._id}>
                      Room {r.number} ({r.type} -{" "}
                      {r.capacity - r.currentOccupancy} bed slots free)
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label>Billing Cycle Scheme</label>
                  <select
                    className="form-control"
                    value={rentPlan}
                    onChange={(e) => setRentPlan(e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="6-Months">6-Months</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Billing Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Check-in / Join Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  required
                />
              </div>

              <h4
                style={{
                  fontSize: "0.95rem",
                  color: "var(--accent-primary)",
                  margin: "1.25rem 0 0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Portal Credentials Generation
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label>Portal Username</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. rahul101"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Portal Password</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddWizard(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Admit & Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
