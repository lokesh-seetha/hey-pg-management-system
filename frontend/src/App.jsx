import React, { useState, useEffect } from "react";
import { apiCall } from "./utils/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Tenants from "./pages/Tenants";
import Payments from "./pages/Payments";
import Grievances from "./pages/Grievances";
import Menu from "./pages/Menu";
import FeedbackDashboard from "./pages/FeedbackDashboard";
import Chatbot from "./components/Chatbot";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [todayMenu, setTodayMenu] = useState(null);

  // Fetch today's menu globally to feed into the chatbot knowledge base
  useEffect(() => {
    if (currentUser) {
      fetchTodayMenu();
    }
  }, [currentUser]);

  const fetchTodayMenu = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/menu");
      const menu = await response.json();
      const dayName = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      setTodayMenu(menu[dayName] || null);
    } catch (err) {
      console.error("Chatbot menu fetch failed:", err);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("dashboard");
  };

  // If user is not logged in, render the login page
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Define sidebar navigation link classes
  const getNavLinkClass = (pageName) => {
    return currentPage === pageName ? "nav-link active" : "nav-link";
  };

  return (
    <div className="app-container">
      {/* 1. SIDEBAR NAVIGATION PANEL */}
      <aside className="sidebar">
        {/* Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "2.5rem",
            paddingLeft: "0.5rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background:
                "linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)",
              color: "#fff",
            }}
          >
            <i className="fa-solid fa-hotel" style={{ fontSize: "1.1rem" }}></i>
          </div>
          <h2
            className="brand-name"
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              background: "linear-gradient(90deg, #fff 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Hey-PG
          </h2>
        </div>

        {/* Navigation items list */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            flex: 1,
          }}
          className="sidebar-nav"
        >
          <button
            onClick={() => setCurrentPage("dashboard")}
            className={getNavLinkClass("dashboard")}
          >
            <i className="fa-solid fa-chart-line"></i>
            <span className="nav-link-text">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentPage("rooms")}
            className={getNavLinkClass("rooms")}
          >
            <i className="fa-solid fa-bed"></i>
            <span className="nav-link-text">Rooms Directory</span>
          </button>

          {currentUser.role === "admin" ? (
            <>
              <button
                onClick={() => setCurrentPage("tenants")}
                className={getNavLinkClass("tenants")}
              >
                <i className="fa-solid fa-users"></i>
                <span className="nav-link-text">Occupants</span>
              </button>

              <button
                onClick={() => setCurrentPage("payments")}
                className={getNavLinkClass("payments")}
              >
                <i className="fa-solid fa-indian-rupee-sign"></i>
                <span className="nav-link-text">Rent Ledger</span>
              </button>

              <button
                onClick={() => setCurrentPage("grievances")}
                className={getNavLinkClass("grievances")}
              >
                <i className="fa-solid fa-circle-exclamation"></i>
                <span className="nav-link-text">Grievances</span>
              </button>

              <button
                onClick={() => setCurrentPage("menu")}
                className={getNavLinkClass("menu")}
              >
                <i className="fa-solid fa-utensils"></i>
                <span className="nav-link-text">Mess Schedule</span>
              </button>

              <button
                onClick={() => setCurrentPage("feedback_dashboard")}
                className={getNavLinkClass("feedback_dashboard")}
              >
                <i className="fa-solid fa-comments"></i>
                <span className="nav-link-text">Feedback Analytics</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentPage("menu")}
                className={getNavLinkClass("menu")}
              >
                <i className="fa-solid fa-calendar-days"></i>
                <span className="nav-link-text">Food & Feedback</span>
              </button>

              <button
                onClick={() => setCurrentPage("grievances")}
                className={getNavLinkClass("grievances")}
              >
                <i className="fa-solid fa-wrench"></i>
                <span className="nav-link-text">Convey Problem</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer details */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "1.25rem",
            marginTop: "auto",
          }}
        >
          <div
            className="user-profile-badge"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
              paddingLeft: "0.5rem",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background:
                  currentUser.role === "admin"
                    ? "rgba(99,102,241,0.15)"
                    : "rgba(16,185,129,0.15)",
                color:
                  currentUser.role === "admin"
                    ? "var(--accent-primary)"
                    : "var(--accent-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              {currentUser.name[0].toUpperCase()}
            </div>
            <div
              className="nav-link-text"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "140px",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                {currentUser.name}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  textTransform: "capitalize",
                }}
              >
                {currentUser.role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              width: "100%",
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "var(--accent-danger)",
              padding: "0.65rem 1rem",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "var(--transition)",
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span className="logout-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT AND PAGES PANEL */}
      <main className="main-content">
        {/* TOP HEADER CONTROLS (includes Dev Switcher) */}
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            paddingBottom: "1rem",
            gap: "1rem",
          }}
        ></header>

        {/* DYNAMIC PAGE DISPATCHER */}
        {currentPage === "dashboard" && (
          <Dashboard currentUser={currentUser} onNavigate={setCurrentPage} />
        )}
        {currentPage === "rooms" && <Rooms currentUser={currentUser} />}
        {currentPage === "tenants" && <Tenants currentUser={currentUser} />}
        {currentPage === "payments" && <Payments currentUser={currentUser} />}
        {currentPage === "grievances" && (
          <Grievances currentUser={currentUser} />
        )}
        {currentPage === "menu" && <Menu currentUser={currentUser} />}
        {currentPage === "feedback_dashboard" && <FeedbackDashboard />}
      </main>

      {/* 3. HOSTEL SUPPORT HELPER CHATBOT WIDGET (GLOBALLY DOCKED) */}
      <Chatbot todayMenu={todayMenu} ownerPhone="9876543210" />

      {/* Custom Styles for Nav links and button interactions */}
      <style>{`
        /* Sidebar navigation buttons */
        .nav-link {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          text-align: left;
          padding: 0.85rem 1rem;
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: var(--transition);
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          transform: translateX(4px);
        }

        .nav-link.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-primary);
          font-weight: 600;
          border-left: 3px solid var(--accent-primary);
          border-radius: 0 var(--border-radius) var(--border-radius) 0;
          transform: translateX(2px);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
