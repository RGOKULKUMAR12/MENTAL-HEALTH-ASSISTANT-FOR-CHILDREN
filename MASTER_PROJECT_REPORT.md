# Mindful Kids: Master Project Report

## 1. What This Report Is

This report is the complete guide for this project.

It is written for:
- Students and reviewers who want clear, non-technical explanation
- Developers who need exact implementation details
- Team members who need a single source of truth

## 2. Project in Simple Words

Mindful Kids is a web application that helps families track child well-being.

The app has four user roles:
- Child: answers check-in questions and uses wellness tools
- Parent: creates child account, checks reports, books doctor appointments
- Doctor: reviews appointment requests and consented child history
- Admin: manages users and checks system-level analytics

Important safety points:
- This is not a medical diagnosis system
- Parent consent is required before child data is shared with doctor
- Role-based access is enforced in both frontend and backend

## 3. Technical Terms (Simple Meanings)

- Frontend: the screens users see in browser
- Backend: server that handles rules, database, and APIs
- API: URL endpoint used by frontend to talk to backend
- JWT token: secure login ticket sent with each protected request
- Hashing: converting password into secure unreadable form
- SQLite: local file-based database
- Migration: automatic database update when schema changes
- RBAC: role-based access control (child/parent/doctor/admin rules)
- WAL/SHM: SQLite runtime files created automatically while DB is in use
- SMTP: protocol used to send emails
- Consent: parent permission to share child assessment history with doctor

## 4. System Architecture

The app runs as two processes:

1. Frontend
- URL: http://localhost:3000
- Built with React + Vite
- Handles pages, forms, charts, and user actions

2. Backend
- URL: http://localhost:4000
- Built with Express + SQLite
- Handles auth, data rules, business logic, and email sending

Data storage:
- Main DB: backend/data/mental-pro.db
- Runtime side files: backend/data/mental-pro.db-wal and backend/data/mental-pro.db-shm

## 5. Tech Stack

Frontend:
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Recharts
- Lucide React

Backend:
- Node.js
- Express
- better-sqlite3
- jsonwebtoken
- bcryptjs
- nodemailer
- dotenv

## 6. Setup and Run

### 6.1 Prerequisites
- Node.js 18+
- npm

### 6.2 Install

From project root:

```bash
npm install
```

From backend folder:

```bash
cd backend
npm install
```

### 6.3 Environment file

Create backend/.env using backend/.env.example.

Required values:
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASS
- APP_URL (usually http://localhost:3000)
- PORT (usually 4000)

### 6.4 Start app

Terminal A (root):

```bash
npm run dev
```

Terminal B (backend):

```bash
cd backend
npm run dev
```

## 7. Folder Overview

- src: frontend code
- backend/src: backend code
- backend/src/routes: API handlers
- backend/src/middleware: token and role checks
- backend/src/utils: reusable backend logic
- backend/data: SQLite files
- Report: document outputs including PDF report

## 8. Database Overview

Main tables:
- users: parent/child/admin accounts
- doctors: doctor records and credentials
- time_slots: doctor availability
- assessments: child responses, score, risk, conditions
- alerts: parent warning messages
- appointments_updated: main appointment workflow table
- appointment_status_logs: status change history
- appointments: legacy appointment table

Recent schema updates:
- doctors now include clinic_address
- assessments now save identified_conditions and conditions_json

## 9. Authentication and Security

- Login returns JWT token
- Frontend stores token in local storage
- Protected APIs require Authorization header
- Passwords are hashed with bcrypt
- Doctor first login uses must_change_password flag

### First doctor login flow (updated)

At first login, doctor must create a new password.

Modal asks only:
- New password
- Retype new password

No extra temporary-password re-entry is needed in portal.

## 10. Current Functional Flow

### 10.1 Parent and child flow

1. Parent registers and logs in
2. Parent creates child account
3. Child logs in with parent-created credentials
4. Child fills questionnaire
5. All questions are mandatory before moving next
6. Timer wait rule is enforced before next action
7. Backend stores responses and risk details
8. Parent dashboard and reports update using saved data

### 10.2 Risk calculation

Average score to risk level:
- 3.5 to 5.0 -> low
- 2.0 to 3.4 -> moderate
- 1.0 to 1.9 -> high

### 10.3 Appointment booking flow

1. Parent selects doctor and slot
2. Parent must enable consent checkbox
3. Backend validates parent-child relation, slot status, duplicate lock
4. Appointment saved with status booked
5. Slot is marked unavailable
6. Doctor receives booking email

Update applied:
- Doctor email no longer includes confirm/reject links
- Doctor must decide from doctor portal UI

### 10.4 Doctor decision flow

Doctor can set:
- confirmed
- rejected
- postponed
- completed

Effects:
- Confirmed: slot stays occupied
- Rejected: slot released
- Completed: slot released

### 10.5 Parent email reply flow (updated)

When doctor confirms or rejects:
- Parent receives status email reply

Confirmed email includes:
- Date
- Time
- Clinic location

Rejected email includes:
- Rejection status
- Optional reason if provided

### 10.6 Consent rule

Doctor can see child assessment history only for appointments where parent consent is enabled.

## 11. Admin Analytics

Admin dashboard now shows real aggregated data from database:
- Child risk distribution
- Appointment status counts
- Disease-wise breakdown based on saved condition fields

Update applied:
- Disease-wise analytics now update from stored assessment condition data (with fallback normalization)

## 12. Key APIs

Auth:
- POST /api/auth/register-parent
- POST /api/auth/login
- POST /api/auth/change-password

Parent/Child:
- GET /api/parents/:parentId/children
- POST /api/parents/:parentId/children
- DELETE /api/parents/:parentId/children/:childId
- GET /api/parents/:parentId/dashboard

Assessments:
- POST /api/children/:childId/assessments
- GET /api/children/:childId/assessments

Doctors and Slots:
- GET /api/doctors
- GET /api/doctors/:doctorId/slots
- POST /api/doctors
- PUT /api/doctors/:doctorId
- DELETE /api/doctors/:doctorId
- POST /api/slots
- DELETE /api/slots/:slotId

Appointments:
- POST /api/appointments/book
- GET /api/appointments/parent/:parentId
- GET /api/appointments/doctor/me
- GET /api/appointments/doctor/patients
- PUT /api/appointments/:appointmentId/confirm
- DELETE /api/appointments/:appointmentId

Admin:
- GET /api/admin/analytics
- PUT /api/admin/appointments/:appointmentId/status
- DELETE /api/admin/users/:userId

## 13. Key File Changes in This Phase

Backend:
- backend/src/db.js
- backend/src/seed.js
- backend/src/routes/doctors.js
- backend/src/routes/appointments.js
- backend/src/routes/assessments.js
- backend/src/routes/admin.js
- backend/src/routes/auth.js
- backend/src/utils/conditionDetection.js
- backend/src/loadEnv.js

Frontend:
- src/components/AdminDoctorsManagement.jsx
- src/components/AppointmentBookingModal.jsx
- src/pages/dashboards/DoctorDashboard.jsx
- src/pages/dashboards/ParentDashboard.jsx
- src/pages/Questionnaire.jsx
- src/pages/Reports.jsx
- src/api/api.js

## 14. Operational Notes

- Do not commit backend/.env
- Do not commit runtime artifacts from WAL/SHM or Vite cache
- Use .env.example for sample values only
- Keep secrets private

## 15. Limitations and Future Work

Current limitations:
- Single SQLite database (good for local/small use)
- Email depends on SMTP credentials
- No advanced calendar sync

Future enhancements:
- Multi-language support
- Better exportable report templates
- Stronger appointment reminders (SMS/WhatsApp)
- Cloud database and deployment pipeline

## 16. Conclusion

The project now has a cleaner and safer workflow:
- Better doctor onboarding flow
- Cleaner appointment email behavior
- Parent gets direct status communication
- Analytics reflect real stored data
- Documentation is now simpler and aligned with implemented behavior

This makes the system easier to use, easier to maintain, and easier to evaluate.
