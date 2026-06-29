# 🏨 HEY-PG: PG Hostel Management System

A comprehensive **MERN stack** web application for managing Paying Guest (PG) hostels. Features tenant management, room allocation, payment tracking, grievance handling, emergency alerts, and more.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Authentication & Security](#authentication--security)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Configuration](#configuration)
- [Demo Credentials](#demo-credentials)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**HEY-PG** is a full-stack hostel management application designed for PG owners (wardens) and tenants. It streamlines operations like tenant onboarding, room allocation, rent collection, and issue resolution through an intuitive web interface.

### Key Roles:

- **Warden/Admin**: Full control over hostel operations, tenant management, and reporting
- **Tenant**: Self-service portal for payments, grievances, feedback, and attendance tracking

---

## ✨ Features

### Admin Features

- 🏠 **Room Management**: Create, update, and delete room listings with pricing
- 👥 **Tenant Management**: Onboard tenants, assign rooms, manage profiles, checkout tenants
- 💰 **Payment Tracking**: Record rent payments, track outstanding dues, generate reports
- 📝 **Grievance Management**: Track tenant complaints, assign status, maintain resolution history
- 🚨 **Emergency Alerts**: Real-time SOS notifications from tenants
- 🍽️ **Menu Management**: Set weekly meal plans for the hostel
- 📊 **Dashboard Analytics**: View occupancy, revenue, payment status, and active issues
- 📋 **Feedback Dashboard**: Monitor tenant feedback on food, WiFi, cleanliness, and overall satisfaction

### Tenant Features

- 🔐 **Secure Login**: JWT-based authentication with encrypted sessions
- 📄 **Profile Management**: View personal details and room assignment
- 💸 **Payment History**: View payment records and dues
- 📤 **Grievance Submission**: File complaints and track status
- 🆘 **Emergency SOS**: Trigger emergency alerts to warden
- 🍲 **Meal Tracking**: Mark attendance for meals, view weekly menu
- ⭐ **Feedback Submission**: Rate services (food, WiFi, cleanliness, overall)
- 💬 **AI Chatbot**: Get instant answers about hostel policies and meals

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with JSON fallback)
- **Authentication**: JWT (JSON Web Tokens)
- **Middleware**: CORS, dotenv
- **ORM**: Mongoose (optional)

### Frontend

- **Framework**: React 18
- **Bundler**: Parcel
- **Styling**: Vanilla CSS with CSS variables
- **Icons**: Font Awesome 6
- **HTTP Client**: Fetch API with JWT interceptor

### Tools & Services

- **Dev Server**: Nodemon (backend), Parcel (frontend)
- **Process Manager**: Concurrently (run both servers)
- **Environment**: Node v16+, npm v7+

---

## 📁 Project Structure

```
hey-pg/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── EmergencyAlert.js
│   │   ├── Feedback.js
│   │   ├── Grievance.js
│   │   ├── Menu.js
│   │   ├── Payment.js
│   │   ├── Room.js
│   │   ├── Tenant.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js               # Login endpoint (JWT generation)
│   │   ├── rooms.js
│   │   ├── tenants.js
│   │   ├── payments.js
│   │   ├── grievances.js
│   │   ├── emergencies.js
│   │   ├── menus.js
│   │   ├── attendance.js
│   │   └── feedback.js
│   ├── server.js                 # Express app entry point
│   ├── db.json                   # Local JSON database (fallback)
│   ├── package.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chatbot.jsx       # AI support chatbot
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── Tenants.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Grievances.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── FeedbackDashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── utils/
│   │   │   └── api.js            # Authenticated API calls with JWT
│   │   ├── App.jsx               # Main app component
│   │   ├── index.jsx             # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── package.json
│   └── .parcelrc
│
├── package.json                  # Monorepo root scripts
└── README.md                     # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Git**: For cloning (optional)
- **MongoDB**: v5+ (optional - fallback to JSON storage)

### Step 1: Clone/Download the Project

```bash
cd hey-pg
```

### Step 2: Install All Dependencies

```bash
npm run install-all
```

This command installs dependencies for:

- Root monorepo
- Backend
- Frontend

---

## ▶️ Running the Application

### Option 1: Run Both Backend & Frontend Concurrently (Recommended)

```bash
npm run dev
```

This starts:

- **Backend**: http://localhost:5000 (Node.js + Express)
- **Frontend**: http://localhost:3000 (Parcel dev server)

### Option 2: Run Backend Only

```bash
npm run backend
```

Backend runs on **http://localhost:5000**

### Option 3: Run Frontend Only

```bash
npm run frontend
```

Frontend runs on **http://localhost:3000**

### Option 4: Individual Commands

**Backend:**

```bash
cd backend
npm start                # Production mode
npm run dev              # Development mode with auto-reload
```

**Frontend:**

```bash
cd frontend
npm start                # Dev server with hot reload
npm run build            # Production build
```

---

## 🔐 Authentication & Security

### JWT Implementation

The application uses **JSON Web Tokens (JWT)** for stateless authentication:

#### How It Works:

1. **Login Flow**:
   - User enters credentials on login page
   - Backend validates credentials and generates JWT token (24-hour expiry)
   - Token stored in browser's `localStorage`

2. **API Calls**:
   - Every API request includes token in `Authorization` header:
     ```
     Authorization: Bearer <token>
     ```
   - Frontend `apiCall()` helper automatically attaches token

3. **Token Verification**:
   - Backend middleware `verifyToken` validates token on every protected route
   - Invalid/expired tokens return 401 status → redirects to login

#### Protected Routes:

All API endpoints **except login** require valid JWT:

- ✅ `/api/rooms` (GET, POST, PUT, DELETE)
- ✅ `/api/tenants` (GET, POST, PUT, checkout)
- ✅ `/api/payments` (GET, POST)
- ✅ `/api/grievances` (GET, POST, PUT)
- ✅ `/api/emergencies` (GET, POST, PUT)
- ✅ `/api/menu` (GET, PUT)
- ✅ `/api/attendance` (GET, POST)
- ✅ `/api/feedback` (GET, POST)
- ❌ `/api/auth/login` (No auth required)

#### Token Features:

- **Expiry**: 24 hours from login
- **Secret**: Stored in `.env` as `JWT_SECRET`
- **Payload**: Contains user ID, username, role, tenantId

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

```
Header: Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Endpoints

#### 🔐 Authentication

**POST** `/auth/login`

- **Auth**: ❌ Not required
- **Body**: `{ username, password }`
- **Response**: `{ token, user: { id, username, role, name, tenantId } }`
- **Example**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}'
  ```

#### 🏠 Rooms

**GET** `/rooms`

- **Auth**: ✅ Required
- **Response**: Array of rooms with pricing and occupancy

**POST** `/rooms` (Admin only)

- **Auth**: ✅ Required
- **Body**: `{ number, type, rent, capacity }`

**PUT** `/rooms/:id` (Admin only)

- **Auth**: ✅ Required
- **Body**: `{ type, rent, capacity }`

**DELETE** `/rooms/:id` (Admin only)

- **Auth**: ✅ Required

#### 👥 Tenants

**GET** `/tenants`

- **Auth**: ✅ Required
- **Response**: Array of all tenants (admin view)

**POST** `/tenants` (Admin only)

- **Auth**: ✅ Required
- **Body**: `{ name, phone, email, emergencyContact, roomId, joinDate, rentPlan, rentAmount, username, password }`

**PUT** `/tenants/:id` (Admin only)

- **Auth**: ✅ Required
- **Body**: `{ name, phone, email, emergencyContact, rentStatus, dueDate }`

**POST** `/tenants/:id/checkout` (Admin only)

- **Auth**: ✅ Required
- **Effect**: Deactivates tenant, releases room

#### 💰 Payments

**GET** `/payments`

- **Auth**: ✅ Required
- **Response**: Array of payment records

**POST** `/payments` (Admin only)

- **Auth**: ✅ Required
- **Body**: `{ tenantId, amount, date, mode, plan, transactionId, monthYear }`

#### 📝 Grievances

**GET** `/grievances`

- **Auth**: ✅ Required
- **Response**: Array of grievances

**POST** `/grievances` (Tenant)

- **Auth**: ✅ Required
- **Body**: `{ tenantId, category, description }`

**PUT** `/grievances/:id` (Admin only)

- **Auth**: ✅ Required
- **Body**: `{ status }`

#### 🚨 Emergencies

**GET** `/emergencies`

- **Auth**: ✅ Required
- **Response**: Emergency alert logs

**POST** `/emergencies` (Tenant)

- **Auth**: ✅ Required
- **Body**: `{ tenantId, message }`

**PUT** `/emergencies/:id` (Admin only)

- **Auth**: ✅ Required
- **Body**: `{ status }`

#### 🍲 Meals & Attendance

**GET** `/menu`

- **Auth**: ✅ Required
- **Response**: Weekly meal plan

**PUT** `/menu` (Admin only)

- **Auth**: ✅ Required
- **Body**: Weekly meal object

**GET** `/attendance/today`

- **Auth**: ✅ Required
- **Response**: Daily meal attendance summary

**POST** `/attendance` (Tenant)

- **Auth**: ✅ Required
- **Body**: `{ tenantId, date, breakfast, lunch, dinner }`

#### ⭐ Feedback

**GET** `/feedback`

- **Auth**: ✅ Required
- **Response**: All feedback with averages

**POST** `/feedback` (Tenant)

- **Auth**: ✅ Required
- **Body**: `{ tenantId, foodRating, wifiRating, cleanlinessRating, overallRating, comments }`

---

## 💾 Database

### MongoDB (Recommended)

- Set `MONGODB_URI` in `.env`
- Mongoose automatically handles collections
- Supports cloud services (MongoDB Atlas)

### JSON Fallback

- If MongoDB connection fails, data stores in `backend/db.json`
- Perfect for development without database setup
- Data persists across server restarts

### Models

All models stored in `backend/models/`:

- **User.js**: Login credentials and profile
- **Room.js**: Room details, pricing, occupancy
- **Tenant.js**: Tenant profile, status, assignments
- **Payment.js**: Rent payment records
- **Grievance.js**: Tenant complaints
- **EmergencyAlert.js**: SOS alerts
- **Menu.js**: Weekly meal plans
- **Attendance.js**: Meal attendance logs
- **Feedback.js**: Tenant ratings

---

## ⚙️ Configuration

### Environment Variables (`.env`)

```env
# Server Port
PORT=5000

# Database Connection (Optional)
MONGODB_URI=mongodb://localhost:27017/hey-pg

# JWT Secret (Generate new one for production)
JWT_SECRET=99a6027615a307427007e03664be025b199bf32754c9177bd6978eb8c517871001c8935d831fd51df80eb133ce942bc429a65e640a1454c1c66f80d9e83fb029
```

### Generate New JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then update `.env` with the generated value.

---

## 📝 Demo Credentials

### Warden/Admin Account

```
Username: admin
Password: admin123
```

### Tenant Account

```
Username: rahul
Password: 123
```

**Note**: These credentials are pre-seeded in `backend/db.json` for demo purposes.

---

## 📖 Usage Guide

### For Admins

1. **Login** with admin credentials
2. **Dashboard**: View occupancy, revenue, active issues
3. **Manage Rooms**: Add/edit/delete room inventory
4. **Manage Tenants**: Onboard tenants and assign rooms
5. **Track Payments**: Record and monitor rent collection
6. **Handle Grievances**: Review and resolve complaints
7. **Set Menu**: Update weekly meal plans
8. **View Feedback**: Monitor tenant satisfaction scores

### For Tenants

1. **Login** with tenant credentials
2. **Dashboard**: View room details, dues, active issues
3. **Pay Rent**: View payment history and due dates
4. **File Grievance**: Submit complaints with category
5. **Trigger SOS**: Send emergency alert to warden
6. **Mark Attendance**: Opt-out of meals as needed
7. **Submit Feedback**: Rate hostel services
8. **Chat Support**: Use AI chatbot for instant help

---

## 🐛 Troubleshooting

### Backend Issues

#### Error: `Cannot find module 'jsonwebtoken'`

**Solution**: Install JWT package

```bash
cd backend
npm install jsonwebtoken
```

#### Error: `Port 5000 already in use`

**Solution**: Kill existing process or change PORT in `.env`

```bash
# Kill on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT
echo "PORT=5001" >> backend/.env
```

#### Error: `MongoDB connection failed`

**Solution**: Database falls back to JSON automatically. Ensure `backend/db.json` exists:

```bash
cd backend
touch db.json
```

### Frontend Issues

#### Error: `Module not found: react`

**Solution**: Install dependencies

```bash
cd frontend
npm install
```

#### Error: `Port 3000 already in use`

**Solution**: Change port in Parcel config or kill process

```bash
# Kill on port 3000
lsof -ti:3000 | xargs kill -9
```

#### Error: `CORS error when calling API`

**Solution**: Ensure backend is running on `http://localhost:5000`

### Authentication Issues

#### Error: `401 Unauthorized`

**Possible Causes**:

- JWT token expired → Login again
- Token not sent in headers → Check browser localStorage
- Invalid credentials → Verify username/password

**Solution**:

```javascript
// Check token in browser console
localStorage.getItem("token");
localStorage.getItem("user");

// Clear and login again
localStorage.clear();
```

#### Error: `Invalid token`

**Solution**: JWT secret mismatch. Regenerate and update:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Update JWT_SECRET in backend/.env
```

### Common Errors

| Error                       | Cause                  | Solution                                 |
| --------------------------- | ---------------------- | ---------------------------------------- |
| `Cannot POST /api/tenants`  | Middleware not applied | Check `verifyToken` middleware in routes |
| `401 Access token required` | No token in header     | Login to get token                       |
| `Token expired`             | 24h expiry exceeded    | Login again                              |
| `EADDRINUSE`                | Port occupied          | Change PORT in .env                      |
| `ECONNREFUSED`              | Backend not running    | Start backend: `npm run backend`         |

---

## 📱 Responsive Design

The application features a **cyberpunk-themed UI** with:

- Glass morphism effects
- Gradient accents (Indigo/Purple)
- Responsive grid layouts
- Mobile-friendly components
- Dark mode by default

---

## 🤝 Contributing

To contribute to this project:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

This project is created for educational and demonstration purposes.

---

## 🆘 Support

For issues or questions:

1. Check the **Troubleshooting** section
2. Review API documentation
3. Examine browser console logs
4. Check backend server logs

---

## 🎉 Getting Started Quickly

```bash
# 1. Install all dependencies
npm run install-all

# 2. Start both servers
npm run dev

# 3. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api/health

# 4. Login
# Username: admin
# Password: admin123
```

**That's it!** Your HEY-PG system is ready. 🚀

---

**Last Updated**: June 2026  
**Version**: 1.0.0
