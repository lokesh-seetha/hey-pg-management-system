import React, { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(
          data.message || "Authentication failed. Please check credentials.",
        );
      }
    } catch (err) {
      setError("Cannot connect to server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), var(--bg-primary)",
      }}
    >
      <div
        className="glass-panel"
        style={{ width: "100%", maxWidth: "440px", padding: "2.5rem 2rem" }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
              marginBottom: "1rem",
              color: "#fff",
            }}
          >
            <i className="fa-solid fa-hotel" style={{ fontSize: "1.8rem" }}></i>
          </div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              marginBottom: "0.25rem",
            }}
          >
            Welcome to Hey-PG
          </h2>
          <p style={{ fontSize: "0.9rem" }}>PG Hostel Management Console</p>
        </div>

        {/* Info Alert explaining restricted signups */}
        <div
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            fontSize: "0.82rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
            color: "var(--text-secondary)",
          }}
        >
          <i
            className="fa-solid fa-circle-info"
            style={{ color: "var(--accent-primary)", marginTop: "2px" }}
          ></i>
          <div>
            <strong>Restricted Access:</strong> There is no public registration
            form. Tenant accounts must be created by the Warden/Admin.
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#fca5a5",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div style={{ position: "relative" }}>
              <i
                className="fa-regular fa-user"
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
                id="username"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <i
                className="fa-solid fa-lock"
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              ></i>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem" }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <i className="fa-solid fa-right-to-bracket"></i>
              </>
            )}
          </button>
        </form>

        {/* Credentials cheat-sheet for user testing */}
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          <p
            style={{
              marginBottom: "0.5rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            Demo Account Details:
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Warden/Admin:</span>
              <code
                style={{
                  background: "rgba(255,255,255,0.04)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                }}
              >
                admin / admin123
              </code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tenant (Rahul):</span>
              <code
                style={{
                  background: "rgba(255,255,255,0.04)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                }}
              >
                rahul / 123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
