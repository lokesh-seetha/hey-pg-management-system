import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";

export default function Menu({ currentUser }) {
  const [menu, setMenu] = useState({
    Monday: { breakfast: "", lunch: "", dinner: "" },
    Tuesday: { breakfast: "", lunch: "", dinner: "" },
    Wednesday: { breakfast: "", lunch: "", dinner: "" },
    Thursday: { breakfast: "", lunch: "", dinner: "" },
    Friday: { breakfast: "", lunch: "", dinner: "" },
    Saturday: { breakfast: "", lunch: "", dinner: "" },
    Sunday: { breakfast: "", lunch: "", dinner: "" },
  });

  const [editDay, setEditDay] = useState(null);
  const [editFields, setEditFields] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  });

  // Feedback Form State (Tenant Only)
  const [foodRating, setFoodRating] = useState(5);
  const [wifiRating, setWifiRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [comments, setComments] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  // Get current weekday name (e.g. "Monday")
  const currentDayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/menu");
      const data = await response.json();
      setMenu(data);
    } catch (err) {
      console.error("Error fetching mess menu:", err);
    }
  };

  const handleEditClick = (dayName) => {
    setEditDay(dayName);
    setEditFields(menu[dayName] || { breakfast: "", lunch: "", dinner: "" });
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      const updatedMenu = {
        ...menu,
        [editDay]: editFields,
      };

      const response = await apiCall("http://localhost:5000/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMenu),
      });

      if (response.ok) {
        setEditDay(null);
        fetchMenu();
      }
    } catch (err) {
      console.error("Save menu failed:", err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError("");
    setFeedbackSuccess("");

    try {
      const response = await apiCall("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: currentUser.tenantId,
          foodRating,
          wifiRating,
          cleanlinessRating,
          overallRating,
          comments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbackSuccess(
          "Thank you! Your weekly feedback has been logged to help improve PG amenities.",
        );
        setComments("");
        setFoodRating(5);
        setWifiRating(5);
        setCleanlinessRating(5);
        setOverallRating(5);
      } else {
        setFeedbackError(data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      setFeedbackError("Connection failed. Ensure backend is running.");
    }
  };

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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
            Mess Menu & Timetable
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {currentUser.role === "admin"
              ? "Update the weekly mess schedule and food options."
              : "Check the weekly meal timetable and submit weekly reviews."}
          </p>
        </div>
      </div>

      {/* Weekday Timetable Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {weekdays.map((day) => {
          const isToday = day === currentDayName;
          const dayData = menu[day] || { breakfast: "", lunch: "", dinner: "" };

          return (
            <div
              key={day}
              className="glass-card"
              style={{
                border: isToday
                  ? "2px solid var(--accent-warning)"
                  : "1px solid var(--glass-border)",
                boxShadow: isToday
                  ? "0 0 20px rgba(245, 158, 11, 0.2)"
                  : "0 8px 32px var(--glass-shadow)",
                position: "relative",
              }}
            >
              {isToday && (
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--accent-warning)",
                    color: "#000",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(245, 158, 11, 0.4)",
                    letterSpacing: "0.05em",
                  }}
                >
                  TODAY'S SPECIAL
                </span>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  marginTop: isToday ? "5px" : "0",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: isToday ? "var(--accent-warning)" : "#fff",
                  }}
                >
                  {day}
                </h3>
                {currentUser.role === "admin" && (
                  <button
                    onClick={() => handleEditClick(day)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--accent-primary)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  fontSize: "0.9rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    🍳 Breakfast
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {dayData.breakfast || "Not updated"}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    🍛 Lunch
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {dayData.lunch || "Not updated"}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    🥣 Dinner
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {dayData.dinner || "Not updated"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================================
         WEEKLY FEEDBACK SURVEY (TENANT ONLY)
         ====================================================================== */}
      {currentUser.role === "tenant" && (
        <div
          className="glass-panel"
          style={{ maxWidth: "640px", margin: "0 auto" }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i
              className="fa-regular fa-comment-check"
              style={{ color: "var(--accent-success)" }}
            ></i>
            <span>Weekly PG Feedback Form</span>
          </h2>
          <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            How was your stay this week? Rate our food, cleanliness, wifi, and
            general amenities to help warden drive improvements.
          </p>

          {feedbackSuccess && (
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
              {feedbackSuccess}
            </div>
          )}

          {feedbackError && (
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
              {feedbackError}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label>🍲 Food Quality Rating</label>
                <select
                  className="form-control"
                  value={foodRating}
                  onChange={(e) => setFoodRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                  <option value="3">⭐⭐⭐ Average (3/5)</option>
                  <option value="2">⭐⭐ Fair (2/5)</option>
                  <option value="1">⭐ Poor (1/5)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>🧹 Cleanliness & Hygiene</label>
                <select
                  className="form-control"
                  value={cleanlinessRating}
                  onChange={(e) => setCleanlinessRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                  <option value="3">⭐⭐⭐ Average (3/5)</option>
                  <option value="2">⭐⭐ Fair (2/5)</option>
                  <option value="1">⭐ Poor (1/5)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>🌐 WiFi Speed & Connection</label>
                <select
                  className="form-control"
                  value={wifiRating}
                  onChange={(e) => setWifiRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                  <option value="3">⭐⭐⭐ Average (3/5)</option>
                  <option value="2">⭐⭐ Fair (2/5)</option>
                  <option value="1">⭐ Poor (1/5)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>⭐ Overall PG Experience</label>
                <select
                  className="form-control"
                  value={overallRating}
                  onChange={(e) => setOverallRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                  <option value="3">⭐⭐⭐ Average (3/5)</option>
                  <option value="2">⭐⭐ Fair (2/5)</option>
                  <option value="1">⭐ Poor (1/5)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label>Weekly Suggestions / Comments</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Suggest any improvements (e.g. need washing machine repair, change breakfast menu)..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              style={{ width: "100%" }}
            >
              Submit Weekly Feedback
            </button>
          </form>
        </div>
      )}

      {/* ======================================================================
         EDIT TIMETABLE MEAL MODAL (ADMIN ONLY)
         ====================================================================== */}
      {editDay && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: "440px" }}
          >
            <div
              style={{
                display: "flex",
                justifyStyle: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                Update Menu: {editDay}
              </h2>
              <button
                onClick={() => setEditDay(null)}
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

            <form onSubmit={handleSaveMenu}>
              <div className="form-group">
                <label>🍳 Breakfast Menu</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFields.breakfast}
                  onChange={(e) =>
                    setEditFields({ ...editFields, breakfast: e.target.value })
                  }
                  placeholder="e.g. Idli, Sambar, Tea"
                  required
                />
              </div>

              <div className="form-group">
                <label>🍛 Lunch Menu</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFields.lunch}
                  onChange={(e) =>
                    setEditFields({ ...editFields, lunch: e.target.value })
                  }
                  placeholder="e.g. Roti, Paneer, Rice, Dal"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>🥣 Dinner Menu</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFields.dinner}
                  onChange={(e) =>
                    setEditFields({ ...editFields, dinner: e.target.value })
                  }
                  placeholder="e.g. Rice, Sambhar, Poriyal"
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setEditDay(null)}
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
                  Save Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
