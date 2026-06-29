import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";

export default function Rooms({ currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("Single Sharing");
  const [rentAmount, setRentAmount] = useState("");
  const [capacity, setCapacity] = useState("1");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomNumber || !rentAmount) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await apiCall("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: roomNumber,
          type: roomType,
          rent: Number(rentAmount),
          capacity: Number(capacity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        // Clear fields
        setRoomNumber("");
        setRentAmount("");
        setCapacity("1");
        setError("");
        fetchRooms();
      } else {
        setError(data.message || "Failed to create room.");
      }
    } catch (err) {
      setError("Connection failed. Ensure backend server is running.");
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      const response = await apiCall(`http://localhost:5000/api/rooms/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchRooms();
      }
    } catch (err) {
      console.error("Delete room failed:", err);
    }
  };

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
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Room Directory</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            View and manage all PG hostel room sharing metrics.
          </p>
        </div>
        {currentUser.role === "admin" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <i className="fa-solid fa-plus"></i> Add New Room
          </button>
        )}
      </div>

      {/* Rooms Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {rooms.map((room) => {
          const occupancyRate = (room.currentOccupancy / room.capacity) * 100;
          let occupancyColor = "var(--accent-success)"; // Vacant / low
          if (room.currentOccupancy >= room.capacity) {
            occupancyColor = "var(--accent-danger)"; // Full
          } else if (room.currentOccupancy > 0) {
            occupancyColor = "var(--accent-warning)"; // Partially filled
          }

          return (
            <div
              key={room.id || room._id}
              className="glass-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "190px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--accent-primary)",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {room.type}
                    </span>
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        marginTop: "0.1rem",
                      }}
                    >
                      Room {room.number}
                    </h3>
                  </div>
                  {currentUser.role === "admin" &&
                    room.currentOccupancy === 0 && (
                      <button
                        onClick={() => handleDeleteRoom(room.id || room._id)}
                        style={{
                          border: "none",
                          background: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.color = "var(--accent-danger)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.color = "var(--text-muted)")
                        }
                      >
                        <i
                          className="fa-regular fa-trash-can"
                          style={{ fontSize: "1.1rem" }}
                        ></i>
                      </button>
                    )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "0.85rem 0",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Monthly Fee:
                  </span>
                  <strong style={{ color: "#fff" }}>
                    ₹{room.rent.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Occupancy Indicator */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Occupancy Status
                  </span>
                  <span style={{ color: occupancyColor, fontWeight: 600 }}>
                    {room.currentOccupancy === 0
                      ? "Vacant"
                      : room.currentOccupancy >= room.capacity
                        ? "Full"
                        : `${room.currentOccupancy} of ${room.capacity} filled`}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${occupancyRate}%`,
                      height: "100%",
                      background: occupancyColor,
                      borderRadius: "4px",
                      transition: "width 0.4s ease",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================================
         ADD ROOM MODAL (ADMIN)
         ====================================================================== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: "440px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                Create New Room
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 101, 204"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Room Sharing Type</label>
                <select
                  className="form-control"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                >
                  <option value="Single Sharing">Single Sharing</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                  <option value="Four Sharing">Four Sharing</option>
                </select>
              </div>

              <div className="form-group">
                <label>Monthly Rent (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 6000"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Total Room Capacity (Beds)</label>
                <select
                  className="form-control"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                >
                  <option value="1">1 Bed</option>
                  <option value="2">2 Beds</option>
                  <option value="3">3 Beds</option>
                  <option value="4">4 Beds</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
