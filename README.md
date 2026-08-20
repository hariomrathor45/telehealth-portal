# Design and Development of Smart, Priority-Based Telehealth Portal System

An academic cornerstone full-stack telemedicine platform engineered with **React 19**, **Node.js/Express**, **MongoDB/Mongoose**, and an integrated **Rule-Based Clinical Urgency Triage Engine**.

Inspired by modern clinical workflows, the system dynamically prioritizes patient consultation queues by clinical urgency rather than traditional first-come-first-served ordering.

---

## 🌟 Core System Innovations (USPs)

1. **Smart Priority Triage Engine:**  
   Evaluates patient-reported symptoms, subjective severity, duration, and clinical risk flags to compute an urgency index (0–100) and urgency classification (`LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH`).
2. **Admin-Verified Medical Practitioners:**  
   Mandatory multi-step doctor verification state machine (`PENDING` → `APPROVED` / `REJECTED`). Only credential-audited practitioners can accept appointments and conduct consultations.
3. **Urgency-Aware Consultation Queue:**  
   Doctors receive an intelligently ordered consultation queue weighted by clinical urgency score and waiting time (with anti-starvation protection for routine cases).

> **Safety Disclaimer:** This system is an urgency-prioritization decision-support prototype. It is not an automated medical diagnostic tool.

---

## 🏗️ System Architecture

```
React 19 Frontend (Vite)
       │ (REST APIs + JWT Auth)
Node.js + Express API Gateway
       │ (Mongoose ODM)
MongoDB Database (Atlas / Local)
```

---

## 👥 Role-Based Access Control (RBAC)

| Role | Access Scope |
|---|---|
| **PATIENT** | Profile management, Smart Triage submission, specialist discovery, appointment booking, live consultation room, and medical records history. |
| **DOCTOR** | Practice management, Priority Waiting Queue, appointment scheduling, active video consultation session, clinical notes/diagnosis entry, and authorized patient records. |
| **ADMIN** | System KPIs, Doctor Credential Verification queue (document inspection, approval/rejection with remarks), patient supervision, audit logs, and analytics. |



## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection string (or local MongoDB on port 27017)

### 2. Environment Configuration
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/telehealth
# (Or paste your MongoDB Atlas URI: mongodb+srv://<user>:<password>@cluster0.mongodb.net/telehealth)

JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
FRONTEND_URL=http://localhost:5173
ADMIN_SETUP_KEY=telehealth-admin-setup-2024
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Development Servers
From the root directory:
```bash
npm run dev
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

---

## 🧪 End-to-End Workflow

1. **Doctor Registration & Verification:**
   - Register as Doctor at `/register/doctor` (Status set to `PENDING`).
   - Log in with Administrator credentials.
   - Navigate to **Doctor Verification**, inspect credentials and submitted documents, click **Approve Doctor**.
2. **Patient Smart Triage & Priority Booking:**
   - Register or log in as Patient.
   - Navigate to **Smart Triage**, input symptoms (e.g. chest pain, moderate severity, today duration).
   - Priority Engine computes urgency score (e.g. `HIGH (72/100)`).
   - Click **Book Priority Appointment** with approved specialist.
3. **Doctor Priority Queue & Live Consultation:**
   - Log in with Doctor credentials.
   - View patient at the top of the **Priority Queue**.
   - Click **Start Consultation** to enter live session room.
   - Enter clinical observations, diagnosis, and prescription advice, click **Complete Consultation**.
4. **Patient Medical Record:**
   - Patient views instant electronic health record in **Medical Records** with printable prescription summary.

---
*Developed for 3rd-year B.Tech CSE Cornerstone Capstone Project.*
