import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";
import AdminDashboardContent from "../components/AdminDashboardContent";
import TenantDashboardContent from "../components/TenantDashboardContent";
import RoomService from "../services/roomService";

const defaultFoodSummary = {
  total: 0,
  breakfast: { eating: 0, leave: 0 },
  lunch: { eating: 0, leave: 0 },
  dinner: { eating: 0, leave: 0 },
};

export default function Dashboard({ currentUser, onNavigate }) {
  const [stats, setStats] = useState({
    totalTenants: 0,
    occupiedRooms: 0,
    totalRooms: 0,
    unpaidTenantsCount: 0,
    paidTenantsCount: 0,
    totalRevenueCollected: 0,
    totalRevenuePending: 0,
  });

  const [foodSummary, setFoodSummary] = useState(defaultFoodSummary);

  const [activeSOS, setActiveSOS] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [activeGrievances, setActiveGrievances] = useState([]);
  const [todayMenu, setTodayMenu] = useState(null);
  const [tenantAttendance, setTenantAttendance] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
  });

  const [tenantProfile, setTenantProfile] = useState(null);
  const [triggeringSOS, setTriggeringSOS] = useState(false);
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);

  // Load dashboard data from backend APIs
  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Rooms
      const rooms = await RoomService.getAllRooms();

      // 2. Fetch Tenants
      let activeTenants = [];

      if (currentUser.role === "admin") {
        const tenantsRes = await apiCall("http://localhost:5000/api/tenants");

        const tenants = await tenantsRes.json();

        activeTenants = tenants.filter((t) => t.status === "Active");
      } else {
        const tenantRes = await apiCall("http://localhost:5000/api/tenants/me");

        const tenant = await tenantRes.json();

        setTenantProfile(tenant);
      }

      // 3. Fetch Payments
      const payRes = await apiCall("http://localhost:5000/api/payments");
      const payments = await payRes.json();
      setRecentPayments(payments.slice(0, 4));

      // 4. Fetch Grievances
      const grievRes = await apiCall("http://localhost:5000/api/grievances");
      const grievances = await grievRes.json();
      setActiveGrievances(
        grievances.filter((g) => g.status !== "Resolved").slice(0, 3),
      );

      // 5. Fetch Food Attendance
      const attRes = await apiCall(
        "http://localhost:5000/api/attendance/today",
      );
      const attData = await attRes.json();
      setFoodSummary(attData?.summary || defaultFoodSummary);

      // 6. Fetch Emergencies
      const sosRes = await apiCall("http://localhost:5000/api/emergencies");
      const sosList = await sosRes.json();
      const activeAlert = sosList.find((a) => a.status === "Active");
      setActiveSOS(activeAlert || null);

      // 7. Fetch Menu
      const menuRes = await apiCall("http://localhost:5000/api/menu");
      const menuData = await menuRes.json();
      // Get current day name
      const dayName = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      setTodayMenu(
        menuData[dayName] || {
          breakfast: "Not set",
          lunch: "Not set",
          dinner: "Not set",
        },
      );

      if (currentUser.role === "admin") {
        // Compute statistics
        let unpaidCount = 0;
        let paidCount = 0;
        let revCollected = 0;
        let revPending = 0;

        activeTenants.forEach((tenant) => {
          if (tenant.rentStatus === "Unpaid") {
            unpaidCount++;
            revPending += tenant.rentAmount;
          } else {
            paidCount++;
            revCollected += tenant.rentAmount;
          }
        });

        setStats({
          totalTenants: activeTenants.length,
          occupiedRooms: rooms.filter((r) => r.currentOccupancy > 0).length,
          totalRooms: rooms.length,
          unpaidTenantsCount: unpaidCount,
          paidTenantsCount: paidCount,
          totalRevenueCollected: revCollected,
          totalRevenuePending: revPending,
        });
      }
      // If logged in as tenant, load tenant specific data
      if (currentUser.role === "tenant") {
        const myAttRes = await apiCall(
          `http://localhost:5000/api/attendance/tenant/${currentUser.tenantId}`,
        );

        const myAtt = await myAttRes.json();

        setTenantAttendance({
          breakfast: myAtt.breakfast !== false,
          lunch: myAtt.lunch !== false,
          dinner: myAtt.dinner !== false,
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard details:", err);
    }
  };

  // Toggle meal attendance for tenant
  const handleToggleAttendance = async (meal) => {
    if (!tenantProfile) return;

    const updated = {
      ...tenantAttendance,
      [meal]: !tenantAttendance[meal],
    };

    setTenantAttendance(updated);

    try {
      const today = new Date().toISOString().split("T")[0];
      await apiCall("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenantProfile.id,
          date: today,
          ...updated,
        }),
      });
      // Refresh counts after toggle
      fetchDashboardData();
    } catch (err) {
      console.error("Error toggling attendance:", err);
    }
  };

  // Trigger Medical Emergency SOS
  const handleTriggerSOS = async () => {
    if (!tenantProfile) return;
    setTriggeringSOS(true);
    try {
      const response = await apiCall("http://localhost:5000/api/emergencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenantProfile.id,
          message:
            "🚨 CRITICAL MEDICAL EMERGENCY: Requesting immediate warden assistance at room " +
            tenantProfile.roomNumber +
            "! 🚨",
        }),
      });
      if (response.ok) {
        setShowSOSConfirm(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("SOS trigger failed:", err);
    } finally {
      setTriggeringSOS(false);
    }
  };

  // Resolve SOS (Admin)
  const handleResolveSOS = async (id) => {
    try {
      const response = await apiCall(
        `http://localhost:5000/api/emergencies/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Resolved" }),
        },
      );
      if (response.ok) {
        setActiveSOS(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("SOS resolution failed:", err);
    }
  };

  // Calculate percentage of paid tenants for progress rings
  const totalBillingAccounts =
    stats.paidTenantsCount + stats.unpaidTenantsCount;
  const paidPercent =
    totalBillingAccounts > 0
      ? Math.round((stats.paidTenantsCount / totalBillingAccounts) * 100)
      : 0;

  return (
    <div>
      {/* 1. Global Critical Medical Emergency SOS Alert for Admin/Tenants */}
      {activeSOS && (
        <div className="sos-banner">
          <div className="sos-banner-left">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div>
              <div className="sos-title">CRITICAL EMERGENCY SOS ACTIVE</div>
              <div className="sos-desc">
                Tenant <strong>{activeSOS.tenantName}</strong> (Room{" "}
                {activeSOS.roomNumber}) triggered a Medical Emergency! Contact:{" "}
                {activeSOS.phone}.
              </div>
            </div>
          </div>
          {currentUser.role === "admin" ? (
            <button
              onClick={() => handleResolveSOS(activeSOS.id || activeSOS._id)}
              className="btn btn-success"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              <i className="fa-solid fa-check"></i> Mark Resolved
            </button>
          ) : (
            <span
              style={{
                fontSize: "0.85rem",
                padding: "0.5rem 1rem",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Warden Notified
            </span>
          )}
        </div>
      )}

      {/* 2. Red Heading Alert for Overdue Tenant Rent Fee */}
      {currentUser.role === "tenant" &&
        tenantProfile &&
        tenantProfile.rentStatus === "Unpaid" && (
          <div className="tenant-overdue-alert">
            <div className="overdue-header">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>Rent Fee Past Due</span>
            </div>
            <div className="overdue-details">
              Attention <strong>{tenantProfile.name}</strong>, your rent for the
              billing plan <strong>({tenantProfile.rentPlan})</strong> amounting
              to <strong>₹{tenantProfile.rentAmount}</strong> was due on{" "}
              <strong>{tenantProfile.dueDate}</strong>. Please clear this
              immediately.
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.7)",
                marginTop: "0.25rem",
              }}
            >
              *Contact warden Mr. Karthik at 9876543210 to settle payments. Once
              paid, the warden will clear this red warning indicator.
            </div>
          </div>
        )}

      {/* Header Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            Welcome, {currentUser.name}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {currentUser.role === "admin"
              ? "Warden Panel • Real-time overview of rooms, check-ins, mess, and feedback metrics."
              : `Room ${tenantProfile ? tenantProfile.roomNumber : "Assigning..."} • Tenant Portal`}
          </p>
        </div>

        {/* Global Emergency Button for Tenants */}
        {currentUser.role === "tenant" && (
          <button
            onClick={() => setShowSOSConfirm(true)}
            className="btn btn-danger"
            style={{
              padding: "0.85rem 1.75rem",
              animation: "border-pulse 1.5s infinite",
            }}
          >
            <i className="fa-solid fa-truck-medical"></i> Trigger Medical SOS
          </button>
        )}
      </div>

      {/* ======================================================================
         ADMIN VIEW
         ====================================================================== */}
      {currentUser.role === "admin" && (
        <div>
          {/* Quick Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            <div
              className="glass-card"
              style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "rgba(99,102,241,0.1)",
                  color: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifySelf: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fa-solid fa-user-group"
                  style={{ fontSize: "1.4rem" }}
                ></i>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Total Occupants
                </span>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    marginTop: "0.15rem",
                  }}
                >
                  {stats.totalTenants}
                </h3>
              </div>
            </div>

            <div
              className="glass-card"
              style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "rgba(16,185,129,0.1)",
                  color: "var(--accent-success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fa-solid fa-door-open"
                  style={{ fontSize: "1.4rem" }}
                ></i>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Occupied Rooms
                </span>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    marginTop: "0.15rem",
                  }}
                >
                  {stats.occupiedRooms} / {stats.totalRooms}
                </h3>
              </div>
            </div>

            <div
              className="glass-card"
              style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "rgba(245,158,11,0.1)",
                  color: "var(--accent-warning)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fa-solid fa-triangle-exclamation"
                  style={{ fontSize: "1.4rem" }}
                ></i>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Rent Due Accounts
                </span>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    marginTop: "0.15rem",
                  }}
                >
                  {stats.unpaidTenantsCount}
                </h3>
              </div>
            </div>

            <div
              className="glass-card"
              style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "rgba(99,102,241,0.1)",
                  color: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fa-solid fa-indian-rupee-sign"
                  style={{ fontSize: "1.4rem" }}
                ></i>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Collected Rent
                </span>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    marginTop: "0.15rem",
                  }}
                >
                  ₹{stats.totalRevenueCollected.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* Dues Visualization & Food Count widgets */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
              marginBottom: "2.5rem",
            }}
          >
            {/* Visual Dues Representation Chart */}
            <div className="glass-panel" style={{ padding: "1.75rem" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fa-solid fa-chart-pie"
                  style={{ color: "var(--accent-primary)" }}
                ></i>
                <span>Fee Collection status</span>
              </h3>

              <div
                style={{ display: "flex", alignItems: "center", gap: "2rem" }}
              >
                {/* Circular Progress Gauge */}
                <div
                  style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: `conic-gradient(var(--accent-success) ${paidPercent}%, var(--bg-tertiary) 0%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    style={{
                      width: "94px",
                      height: "94px",
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-secondary)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                      {paidPercent}%
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Paid
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "var(--accent-success)",
                        }}
                      ></span>
                      <span>Paid Accounts</span>
                    </span>
                    <strong>{stats.paidTenantsCount}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "var(--accent-danger)",
                        }}
                      ></span>
                      <span>Overdue Accounts</span>
                    </span>
                    <strong style={{ color: "var(--accent-danger)" }}>
                      {stats.unpaidTenantsCount}
                    </strong>
                  </div>
                  <hr style={{ borderColor: "rgba(255,255,255,0.05)" }} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Outstanding Dues:
                    </span>
                    <strong style={{ color: "var(--accent-danger)" }}>
                      ₹{stats.totalRevenuePending.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Food Timetable Prep Counts */}
            <div className="glass-panel" style={{ padding: "1.75rem" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fa-solid fa-utensils"
                  style={{ color: "var(--accent-warning)" }}
                ></i>
                <span>Kitchen Food planner</span>
              </h3>

              <p style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Real-time active eating counts based on tenant attendance logs
                for today:
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.88rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span>🍳 Breakfast</span>
                    <strong>
                      {foodSummary.breakfast.eating} eating{" "}
                      <span
                        style={{ color: "var(--text-muted)", fontWeight: 400 }}
                      >
                        ({foodSummary.breakfast.leave} leave)
                      </span>
                    </strong>
                  </div>
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
                        width: `${foodSummary.total > 0 ? (foodSummary.breakfast.eating / foodSummary.total) * 100 : 100}%`,
                        height: "100%",
                        background: "var(--accent-primary)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.88rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span>🍛 Lunch</span>
                    <strong>
                      {foodSummary.lunch.eating} eating{" "}
                      <span
                        style={{ color: "var(--text-muted)", fontWeight: 400 }}
                      >
                        ({foodSummary.lunch.leave} leave)
                      </span>
                    </strong>
                  </div>
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
                        width: `${foodSummary.total > 0 ? (foodSummary.lunch.eating / foodSummary.total) * 100 : 100}%`,
                        height: "100%",
                        background: "var(--accent-success)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.88rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span>🥣 Dinner</span>
                    <strong>
                      {foodSummary.dinner.eating} eating{" "}
                      <span
                        style={{ color: "var(--text-muted)", fontWeight: 400 }}
                      >
                        ({foodSummary.dinner.leave} leave)
                      </span>
                    </strong>
                  </div>
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
                        width: `${foodSummary.total > 0 ? (foodSummary.dinner.eating / foodSummary.total) * 100 : 100}%`,
                        height: "100%",
                        background: "var(--accent-warning)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Audits and Active Grievances split tables */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "2rem",
            }}
          >
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyStyle: "space-between",
                }}
              >
                <span>Recent payments</span>
                <button
                  onClick={() => onNavigate("payments")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--accent-primary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  View All
                </button>
              </h3>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{
                            textAlign: "center",
                            color: "var(--text-muted)",
                          }}
                        >
                          No payments logged yet.
                        </td>
                      </tr>
                    ) : (
                      recentPayments.map((p) => (
                        <tr key={p.id || p._id}>
                          <td>{p.tenantName}</td>
                          <td>
                            <strong>₹{p.amount}</strong>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem" }}>
                              {p.mode}
                            </span>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                fontSize: "0.75rem",
                              }}
                            >
                              {p.plan}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyStyle: "space-between",
                }}
              >
                <span>Pending Grievances</span>
                <button
                  onClick={() => onNavigate("grievances")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--accent-primary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Resolve
                </button>
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                {activeGrievances.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "1.5rem 0",
                    }}
                  >
                    No active grievances pending! 👍
                  </div>
                ) : (
                  activeGrievances.map((g) => (
                    <div
                      key={g.id || g._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        padding: "0.85rem",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "10px",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                          {g.category}{" "}
                          <span
                            style={{
                              fontWeight: 400,
                              color: "var(--text-muted)",
                            }}
                          >
                            • Room {g.roomNumber}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.25rem",
                            display: "-webkit-box",
                            WebkitLineBreak: "anywhere",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            overflow: "hidden",
                          }}
                        >
                          {g.description}
                        </p>
                      </div>
                      <span
                        className={`badge ${g.status === "Pending" ? "badge-unpaid" : "badge-pending"}`}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {g.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
         TENANT VIEW
         ====================================================================== */}
      {currentUser.role === "tenant" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Column Left: Today's Menu & Leave management */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* Today's Menu */}
            <div className="glass-panel">
              <h3
                style={{
                  fontSize: "1.25rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fa-solid fa-utensils"
                  style={{ color: "var(--accent-warning)" }}
                ></i>
                <span>Today's Food Menu</span>
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "0.85rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--accent-primary)",
                      width: "30px",
                    }}
                  >
                    🍳
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Breakfast
                    </h4>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--text-primary)",
                        marginTop: "0.15rem",
                      }}
                    >
                      {todayMenu ? todayMenu.breakfast : "Loading..."}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "0.85rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--accent-success)",
                      width: "30px",
                    }}
                  >
                    🍛
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Lunch
                    </h4>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--text-primary)",
                        marginTop: "0.15rem",
                      }}
                    >
                      {todayMenu ? todayMenu.lunch : "Loading..."}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "0.85rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--accent-warning)",
                      width: "30px",
                    }}
                  >
                    🥣
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Dinner
                    </h4>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--text-primary)",
                        marginTop: "0.15rem",
                      }}
                    >
                      {todayMenu ? todayMenu.dinner : "Loading..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Food Attendance Toggles */}
            <div className="glass-panel">
              <h3
                style={{
                  fontSize: "1.25rem",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fa-regular fa-calendar-check"
                  style={{ color: "var(--accent-primary)" }}
                ></i>
                <span>Meal Leave Toggles</span>
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  color: "var(--text-secondary)",
                }}
              >
                Please check/uncheck to notify the kitchen whether you will be
                eating at the PG today. Uncheck to mark as "On Leave" for that
                meal.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.25rem",
                    background: tenantAttendance.breakfast
                      ? "rgba(99,102,241,0.05)"
                      : "rgba(0,0,0,0.2)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    <i
                      className="fa-solid fa-mug-saucer"
                      style={{ color: "var(--accent-primary)" }}
                    ></i>
                    <span>Eating Breakfast</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={tenantAttendance.breakfast}
                    onChange={() => handleToggleAttendance("breakfast")}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "var(--accent-primary)",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.25rem",
                    background: tenantAttendance.lunch
                      ? "rgba(16,185,129,0.05)"
                      : "rgba(0,0,0,0.2)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    <i
                      className="fa-solid fa-bowl-rice"
                      style={{ color: "var(--accent-success)" }}
                    ></i>
                    <span>Eating Lunch</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={tenantAttendance.lunch}
                    onChange={() => handleToggleAttendance("lunch")}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "var(--accent-success)",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.25rem",
                    background: tenantAttendance.dinner
                      ? "rgba(245,158,11,0.05)"
                      : "rgba(0,0,0,0.2)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    <i
                      className="fa-solid fa-plate-wheat"
                      style={{ color: "var(--accent-warning)" }}
                    ></i>
                    <span>Eating Dinner</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={tenantAttendance.dinner}
                    onChange={() => handleToggleAttendance("dinner")}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: "var(--accent-warning)",
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Column Right: PG Details & Quick Links */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* PG Info Card */}
            <div
              className="glass-panel"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <h3 style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}>
                Stay Information
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  fontSize: "0.92rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Joined Date:
                  </span>
                  <strong>
                    {tenantProfile ? tenantProfile.joinDate : "N/A"}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Rent Scheme:
                  </span>
                  <strong>
                    {tenantProfile ? tenantProfile.rentPlan : "N/A"}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Amount Due:
                  </span>
                  <strong>
                    ₹{tenantProfile ? tenantProfile.rentAmount : "0"}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Due Status:
                  </span>
                  <span
                    className={`badge ${tenantProfile && tenantProfile.rentStatus === "Paid" ? "badge-paid" : "badge-unpaid"}`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {tenantProfile ? tenantProfile.rentStatus : "Unpaid"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Billing Cycle End:
                  </span>
                  <strong>
                    {tenantProfile ? tenantProfile.dueDate : "N/A"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="glass-panel">
              <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                Shortcuts
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={() => onNavigate("menu")}
                  className="btn btn-secondary"
                  style={{
                    flexDirection: "column",
                    padding: "1rem",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <i
                    className="fa-regular fa-calendar-days"
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--accent-primary)",
                    }}
                  ></i>
                  <span>Menu Calendar</span>
                </button>
                <button
                  onClick={() => onNavigate("grievances")}
                  className="btn btn-secondary"
                  style={{
                    flexDirection: "column",
                    padding: "1rem",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <i
                    className="fa-solid fa-wrench"
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--accent-danger)",
                    }}
                  ></i>
                  <span>File Complaint</span>
                </button>
                <button
                  onClick={() => onNavigate("menu")}
                  className="btn btn-secondary"
                  style={{
                    flexDirection: "column",
                    padding: "1rem",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    gridColumn: "span 2",
                  }}
                >
                  <i
                    className="fa-regular fa-comment-check"
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--accent-success)",
                    }}
                  ></i>
                  <span>Submit Weekly Feedback & Rating</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
         MEDICAL EMERGENCY SOS MODAL CONFIRMATION (TENANT)
         ====================================================================== */}
      {showSOSConfirm && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{
              maxWidth: "460px",
              border: "2px solid var(--accent-danger)",
            }}
          >
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.1)",
                  color: "var(--accent-danger)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  animation: "alarm-spin 1s infinite",
                }}
              >
                <i
                  className="fa-solid fa-truck-medical"
                  style={{ fontSize: "2.2rem" }}
                ></i>
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--accent-danger)",
                  marginBottom: "0.5rem",
                }}
              >
                TRIGGER MEDICAL SOS?
              </h2>
              <p
                style={{
                  fontSize: "0.92rem",
                  color: "var(--text-primary)",
                  marginBottom: "1.5rem",
                }}
              >
                This will trigger a flashing alarm and red notification on the
                Warden/Owner dashboard immediately. Call an ambulance if it is
                life-threatening!
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setShowSOSConfirm(false)}
                  className="btn btn-secondary"
                  disabled={triggeringSOS}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerSOS}
                  className="btn btn-danger"
                  disabled={triggeringSOS}
                  style={{ flex: 1 }}
                >
                  {triggeringSOS ? "Broadcasting..." : "Yes, Trigger SOS"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
