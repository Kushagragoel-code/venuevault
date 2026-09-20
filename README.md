# VenueVault 🏛️✨
> **A modern, production-ready Event & Venue Booking Management System built with Node.js, Express, MongoDB Atlas, EJS, Tailwind CSS, Chart.js, and FullCalendar.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-CDN-38bdf8.svg)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Folder Structure](#-architecture--folder-structure)
- [Getting Started Locally](#-getting-started-locally)
- [Environment Variables](#-environment-variables)
- [Test Accounts & Credentials](#-test-accounts--credentials)
- [Deploying to Render](#-deploying-to-render)
- [API Endpoints & Routing](#-api-endpoints--routing)

---

## 🌟 Project Overview

**VenueVault** is an end-to-end venue reservation and event scheduling platform. It connects event organisers seeking ideal venues with venue administrators managing locations, capacities, schedules, approvals, and revenue analytics.

Built using **Server-Side Rendering (SSR) with EJS**, modern **Vanilla JavaScript (Fetch API)** for seamless client-side filtering without page reloads, and styled with **Tailwind CSS** for a clean, breathable SaaS aesthetic.

---

## ⚡ Key Features

### 👤 Authentication & Role-Based Access Control (RBAC)
- **Session-based authentication** using `express-session`, `connect-mongo`, and `bcryptjs` (no JWTs, secure HTTP-only cookies).
- Distinct roles:
  - **Admin**: Manage all venues, review/approve/reject booking requests, view real-time revenue analytics.
  - **Organiser**: Search venues, view availability on a calendar, request bookings, estimate hourly costs, and view personal booking history.

### 🏛️ Venue Discovery & AJAX Filtering
- **Dynamic Search & Filtering**: Filter venues by location, price range, and minimum guest capacity without reloading the page.
- **Client-side Sorting**: Instantly sort by price (low-to-high, high-to-low) and capacity.
- **Rich Media**: Multi-image galleries, detailed amenities tags, and location information.

### 📅 Real-Time Availability with FullCalendar
- Visual availability calendar powered by **FullCalendar.js**.
- Displays booked slots to prevent scheduling conflicts.
- Clickable dates automatically populate the booking request form.
- Live hourly cost estimator with automatic calculation.

### 📊 Admin Analytics Dashboard (Chart.js)
- **Revenue Overview**: Interactive 6-month revenue bar chart with currency formatting.
- **Booking Status Donut**: Visual breakdown of bookings by status (*Pending*, *Approved*, *Rejected*, *Completed*).
- **Stat Cards**: Quick indicators for Total Venues, Active Bookings, Total Paid Revenue, and Total Users.
- **Pending Approvals Queue**: Fast-action buttons to approve or reject pending requests with instant feedback.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (v5)
- **Database**: MongoDB Atlas via Mongoose (v9)
- **Session Store**: `connect-mongo` (v6) with MongoDB persistence
- **Frontend / Templating**: EJS (Embedded JavaScript)
- **Styling**: Tailwind CSS (via CDN) + Custom Vanilla CSS
- **Interactive UI**: 
  - **Chart.js (v4.4)** for administrative revenue and status visualisations
  - **FullCalendar (v6.1)** for venue schedule availability
  - **Fetch API** for zero-reload client-side venue filtering

---

## 📁 Architecture & Folder Structure

```text
venuevault/
├── config/
│   └── db.js                 # MongoDB connection logic with local & Atlas fallback
├── controllers/
│   ├── adminController.js    # Dashboard analytics, venue CRUD, booking approvals
│   ├── authController.js     # User registration, login, and session logout
│   ├── bookingController.js  # Booking creation, cost calculation, organiser dashboard
│   └── venueController.js    # Public venue listings and venue details view
├── middleware/
│   ├── authMiddleware.js     # isAuth, isAdmin, and isOrganiser guards
│   └── errorMiddleware.js    # Centralized 404 & 500 error handler
├── models/
│   ├── Booking.js            # Booking schema, time validation, and compound indexes
│   ├── User.js               # User schema with bcrypt password hashing
│   └── Venue.js              # Venue schema, capacity, pricing, and amenities
├── public/
│   ├── css/style.css         # Custom styles & design tokens
│   └── js/venue-filter.js    # AJAX filtering & dynamic DOM updates
├── routes/
│   ├── adminRoutes.js        # /admin routes (RBAC protected)
│   ├── apiRoutes.js          # /api JSON endpoints for calendar & filter
│   ├── authRoutes.js         # /login, /register, /logout, /dashboard
│   ├── bookingRoutes.js      # /bookings management
│   └── venueRoutes.js        # /venues listing & details
├── scripts/
│   └── seed.js               # Database population script with demo data
├── views/
│   ├── admin/                # Admin venue management & booking tables
│   ├── auth/                 # Login & registration forms
│   ├── dashboard/            # Admin & Organiser dashboard views
│   ├── partials/             # Header, footer, sidebar, flash messages
│   └── venues/               # Venue catalogue & calendar show view
├── .env.example              # Environment variables template
├── app.js                    # Express application setup, sessions & routes
├── package.json              # Project dependencies & npm scripts
├── render.yaml               # Infrastructure-as-code for Render deployment
└── server.js                 # HTTP server entry point
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- [MongoDB](https://www.mongodb.com/) (either a local instance or a free MongoDB Atlas cluster)

### 1. Clone the repository
```bash
git clone https://github.com/Kushagragoel-code/venuevault.git
cd venuevault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `.env` with your database connection details:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/venuevault?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key_here
```

### 4. Seed the database with demo data
Populate initial venues, admin, and organiser accounts:
```bash
npm run seed
```

### 5. Start the development server
```bash
npm run dev
```
Open your browser at **http://localhost:3000**.

---

## 🔑 Environment Variables

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port number the server listens on | `3000` |
| `NODE_ENV` | Application environment | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas or local connection URI | `mongodb+srv://...` |
| `SESSION_SECRET` | Secret key used to sign session cookies | Random 32+ character string |

---

## 👥 Test Accounts & Credentials

The seed script (`npm run seed`) automatically creates two test accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@venuevault.com` | `Admin@123` |
| **Organiser** | `organiser@venuevault.com` | `Organiser@123` |

---

## 🌐 Deploying to Render

This project includes a `render.yaml` blueprint for automatic deployment on [Render](https://render.com/).

### Manual Deployment via Render Dashboard:
1. Fork or push this repository to your GitHub account.
2. Log into Render and click **New +** → **Web Service**.
3. Select your repository: `venuevault`.
4. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `SESSION_SECRET`: *A secure random string*
6. Ensure your MongoDB Atlas cluster allows connections from anywhere (`0.0.0.0/0` under Network Access).
7. Click **Deploy Web Service**!

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Landing page with featured venues |
| `GET` | `/venues` | Public | Venue directory with search & filter |
| `GET` | `/venues/:id` | Public | Single venue view with availability calendar |
| `GET` | `/api/venues` | Public | JSON endpoint for AJAX venue filtering |
| `GET` | `/api/venues/:id/bookings` | Public | Booked time ranges for FullCalendar |
| `POST` | `/bookings` | Organiser | Submit a new booking reservation |
| `GET` | `/dashboard` | Organiser | View personal booking history & statuses |
| `GET` | `/admin` | Admin | Administrative metrics, revenue & status charts |
| `GET` | `/admin/venues` | Admin | Full venue management table |
| `POST` | `/admin/venues` | Admin | Create a new venue |
| `PUT` | `/admin/venues/:id` | Admin | Update venue details |
| `DELETE`| `/admin/venues/:id` | Admin | Remove a venue |
| `PUT` | `/admin/bookings/:id/approve` | Admin | Approve pending booking |
| `PUT` | `/admin/bookings/:id/reject` | Admin | Reject pending booking |

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
