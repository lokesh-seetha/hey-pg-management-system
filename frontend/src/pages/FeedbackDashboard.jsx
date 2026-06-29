import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";

export default function FeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [averages, setAverages] = useState({
    food: 0,
    wifi: 0,
    cleanliness: 0,
    overall: 0,
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/feedback");
      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
      setAverages(
        data.averages || { food: 0, wifi: 0, cleanliness: 0, overall: 0 },
      );
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  const getRatingColor = (score) => {
    const num = Number(score);
    if (num >= 4.0) return "var(--accent-success)";
    if (num >= 3.0) return "var(--accent-warning)";
    return "var(--accent-danger)";
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
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
            Feedback & Improvement Center
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Track average weekly scores and read occupant suggestions to drive
            PG improvements.
          </p>
        </div>
      </div>

      {/* Averages Scorecards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          className="glass-card"
          style={{ textAlign: "center", padding: "1.75rem 1rem" }}
        >
          <span
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            🍲
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Food Quality
          </span>
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: getRatingColor(averages.food),
              margin: "0.35rem 0",
            }}
          >
            {averages.food}★
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2px",
              color: "var(--accent-warning)",
              fontSize: "0.8rem",
            }}
          >
            {"★".repeat(Math.round(averages.food))}
            {"☆".repeat(5 - Math.round(averages.food))}
          </div>
        </div>

        <div
          className="glass-card"
          style={{ textAlign: "center", padding: "1.75rem 1rem" }}
        >
          <span
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            🧹
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Cleanliness
          </span>
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: getRatingColor(averages.cleanliness),
              margin: "0.35rem 0",
            }}
          >
            {averages.cleanliness}★
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2px",
              color: "var(--accent-warning)",
              fontSize: "0.8rem",
            }}
          >
            {"★".repeat(Math.round(averages.cleanliness))}
            {"☆".repeat(5 - Math.round(averages.cleanliness))}
          </div>
        </div>

        <div
          className="glass-card"
          style={{ textAlign: "center", padding: "1.75rem 1rem" }}
        >
          <span
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            🌐
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            WiFi Speed
          </span>
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: getRatingColor(averages.wifi),
              margin: "0.35rem 0",
            }}
          >
            {averages.wifi}★
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2px",
              color: "var(--accent-warning)",
              fontSize: "0.8rem",
            }}
          >
            {"★".repeat(Math.round(averages.wifi))}
            {"☆".repeat(5 - Math.round(averages.wifi))}
          </div>
        </div>

        <div
          className="glass-card"
          style={{ textAlign: "center", padding: "1.75rem 1rem" }}
        >
          <span
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            ⭐
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Overall Stay
          </span>
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: getRatingColor(averages.overall),
              margin: "0.35rem 0",
            }}
          >
            {averages.overall}★
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2px",
              color: "var(--accent-warning)",
              fontSize: "0.8rem",
            }}
          >
            {"★".repeat(Math.round(averages.overall))}
            {"☆".repeat(5 - Math.round(averages.overall))}
          </div>
        </div>
      </div>

      {/* Feedbacks Listing Logs */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <i
            className="fa-solid fa-comments"
            style={{ color: "var(--accent-primary)" }}
          ></i>
          <span>Weekly Occupant Submissions ({feedbacks.length})</span>
        </h3>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {feedbacks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "3rem 0",
              }}
            >
              No feedback reviews submitted yet.
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div
                key={fb.id || fb._id}
                className="glass-card"
                style={{
                  padding: "1.25rem",
                  borderLeft: `4px solid ${getRatingColor(fb.overallRating)}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    paddingBottom: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                      {fb.tenantName}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Room {fb.roomNumber} • Submitted{" "}
                      {new Date(
                        fb.submittedDate || fb.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Rating chips */}
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.5rem",
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "4px",
                      }}
                    >
                      🍲 Food: <strong>{fb.foodRating}★</strong>
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.5rem",
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "4px",
                      }}
                    >
                      🧹 Clean: <strong>{fb.cleanlinessRating}★</strong>
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.5rem",
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "4px",
                      }}
                    >
                      🌐 WiFi: <strong>{fb.wifiRating}★</strong>
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.5rem",
                        background: "rgba(99,102,241,0.1)",
                        color: "var(--accent-primary)",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      Overall: <strong>{fb.overallRating}★</strong>
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    fontStyle: fb.comments ? "normal" : "italic",
                    color: fb.comments ? "inherit" : "var(--text-muted)",
                  }}
                >
                  {fb.comments
                    ? `"${fb.comments}"`
                    : "No written suggestions submitted."}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
