import React, { useState, useEffect } from "react";
import { apiCall } from "../utils/api";

export default function Payments({ currentUser }) {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form Fields
  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [payMode, setPayMode] = useState("UPI");
  const [billingPlan, setBillingPlan] = useState("Monthly");
  const [transactionId, setTransactionId] = useState("");
  const [monthYear, setMonthYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
    fetchTenants();

    // Set default month/year representation (e.g. "June 2026")
    const dateObj = new Date();
    const month = dateObj.toLocaleString("default", { month: "long" });
    const year = dateObj.getFullYear();
    setMonthYear(`${month} ${year}`);
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/payments");
      const data = await response.json();
      // Sort payments: newest first
      setPayments(data.reverse());
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await apiCall("http://localhost:5000/api/tenants");
      const data = await response.json();
      setTenants(data.filter((t) => t.status === "Active"));
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  // Pre-fill amount and plan based on selected tenant
  const handleTenantSelect = (selectedId) => {
    setTenantId(selectedId);
    const tenant = tenants.find(
      (t) => t.id === selectedId || t._id === selectedId,
    );
    if (tenant) {
      setAmount(tenant.rentAmount.toString());
      setBillingPlan(tenant.rentPlan);
    }
  };

  const handleLogPayment = async (e) => {
    e.preventDefault();
    if (!tenantId || !amount || !payDate || !payMode || !monthYear) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await apiCall("http://localhost:5000/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          amount: Number(amount),
          date: payDate,
          mode: payMode,
          plan: billingPlan,
          transactionId,
          monthYear,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowLogModal(false);
        // Clear fields
        setTenantId("");
        setAmount("");
        setTransactionId("");
        setError("");
        fetchPayments();
        fetchTenants(); // Re-load tenants to update their dues status
      } else {
        setError(data.message || "Failed to log rent payment.");
      }
    } catch (err) {
      setError("Connection failed. Ensure backend server is running.");
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  // Filter payments if logged in as a tenant
  const visiblePayments =
    currentUser.role === "tenant"
      ? payments.filter((p) => p.tenantId === currentUser.tenantId)
      : payments;

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
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Rent ledger</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {currentUser.role === "admin"
              ? "Record rents, clear outstanding due logs, and print receipts."
              : "View personal payment history, status receipts, and invoices."}
          </p>
        </div>
        {currentUser.role === "admin" && (
          <button
            onClick={() => setShowLogModal(true)}
            className="btn btn-primary"
          >
            <i className="fa-solid fa-file-invoice-dollar"></i> Record Fee
            Payment
          </button>
        )}
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Tenant Name</th>
                <th>Payment Date</th>
                <th>Billing Plan</th>
                <th>Month Cycle</th>
                <th>Paid Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: "2rem",
                    }}
                  >
                    No payments logged in the database yet.
                  </td>
                </tr>
              ) : (
                visiblePayments.map((p) => (
                  <tr key={p.id || p._id}>
                    <td>
                      <code
                        style={{
                          fontSize: "0.8rem",
                          background: "rgba(255,255,255,0.03)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {p.id ? p.id.split("-")[0].toUpperCase() : "REC"}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.tenantName}</div>
                    </td>
                    <td>{p.date}</td>
                    <td>{p.plan}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--accent-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {p.monthYear}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--accent-success)" }}>
                        ₹{p.amount.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          fontSize: "0.78rem",
                        }}
                      >
                        {p.mode}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: "0.8rem" }}>
                        {p.transactionId}
                      </code>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="btn btn-secondary"
                        style={{
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.78rem",
                          borderRadius: "8px",
                          gap: "0.35rem",
                        }}
                      >
                        <i className="fa-regular fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================================
         RECORD PAYMENT MODAL (ADMIN ONLY)
         ====================================================================== */}
      {showLogModal && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: "460px" }}
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
                Record Rent Payment
              </h2>
              <button
                onClick={() => setShowLogModal(false)}
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

            <form onSubmit={handleLogPayment}>
              <div className="form-group">
                <label>Select Tenant</label>
                <select
                  className="form-control"
                  value={tenantId}
                  onChange={(e) => handleTenantSelect(e.target.value)}
                  required
                >
                  <option value="">-- Select Active Tenant --</option>
                  {tenants.map((t) => (
                    <option key={t.id || t._id} value={t.id || t._id}>
                      {t.name} (Room {t.roomNumber} -{" "}
                      {t.rentStatus === "Unpaid" ? "⚠️ Overdue" : "Paid"})
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
                  <label>Amount Paid (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    className="form-control"
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Card">Card Payment</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Month/Year Cycle</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. June 2026"
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Transaction ID (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. TXN91238123"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ flex: 1 }}
                >
                  Log Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
         PRINT READY RECEIPT DRAWER MODAL
         ====================================================================== */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{
              maxWidth: "520px",
              padding: "2rem",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {/* Printable Receipt Layout */}
            <div
              id="printable-receipt"
              style={{
                color: "#000",
                background: "#fff",
                padding: "1.5rem",
                borderRadius: "8px",
                fontFamily: "var(--font-family)",
              }}
            >
              {/* Receipt Letterhead */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "2px solid #000",
                  paddingBottom: "0.85rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      color: "var(--accent-primary)",
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    HEY-PG HOSTEL
                  </h2>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#555",
                      margin: "2px 0 0",
                    }}
                  >
                    12th Main Road, Sector 3, HSR Layout, Bengaluru
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#333",
                    }}
                  >
                    Rent Receipt
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: "#666" }}>
                    ID:{" "}
                    {selectedReceipt.id
                      ? selectedReceipt.id.split("-")[0].toUpperCase()
                      : "REC"}
                  </span>
                </div>
              </div>

              {/* Receipt Details Body */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#222",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Payment Date:</span>
                  <strong>{selectedReceipt.date}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Tenant Name:</span>
                  <strong>{selectedReceipt.tenantName}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Billing Plan:</span>
                  <strong>{selectedReceipt.plan} Plan</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Month/Year Cycle:</span>
                  <strong style={{ color: "#4f46e5" }}>
                    {selectedReceipt.monthYear}
                  </strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Payment Mode:</span>
                  <strong>{selectedReceipt.mode}</strong>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Transaction ID:</span>
                  <strong>
                    <code>{selectedReceipt.transactionId}</code>
                  </strong>
                </div>

                <hr style={{ borderColor: "#ddd", margin: "0.5rem 0" }} />

                {/* Total box */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    fontSize: "1.05rem",
                    fontWeight: 800,
                  }}
                >
                  <span style={{ color: "#444" }}>Total Amount Paid:</span>
                  <span style={{ color: "#10b981" }}>
                    ₹{selectedReceipt.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Signature lines */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "2.5rem",
                  fontSize: "0.7rem",
                  color: "#666",
                }}
              >
                <div>
                  <div
                    style={{
                      width: "100px",
                      borderBottom: "1px solid #999",
                      marginBottom: "4px",
                    }}
                  ></div>
                  <span>Tenant Signature</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      width: "100px",
                      borderBottom: "1px solid #999",
                      marginBottom: "4px",
                      marginLeft: "auto",
                    }}
                  ></div>
                  <span>Authorized Warden</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                onClick={triggerPrint}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <i className="fa-solid fa-print"></i> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
