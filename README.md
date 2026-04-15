# Mindful Kids - Mental Health Assistant for Children

Mindful Kids is a role-based web app that helps families track child well-being in a safe and simple way.

It supports four user roles:
- Child: answers daily check-in questions and uses wellness tools
- Parent: creates child accounts, views risk insights, books appointments
- Doctor: reviews appointments, confirms or rejects bookings, sees consented child history
- Admin: manages users and reviews system analytics

## Documentation

- [MASTER_PROJECT_REPORT.md](MASTER_PROJECT_REPORT.md) - full project report in simple language
- [Report/MASTER_PROJECT_REPORT.pdf](Report/MASTER_PROJECT_REPORT.pdf) - PDF version of the report
- [PROJECT_FLOW.md](PROJECT_FLOW.md) - step-by-step user flow
- [backend/README.md](backend/README.md) - backend setup details

## What Is New

- Doctor records now include clinic address
- Doctor creation now requires clinic address
- Booking email to doctor no longer contains approve/reject links
- When doctor confirms or rejects, parent receives email reply
- Confirmation email includes date, time, and clinic location
- Parent analytics now use real saved assessment data
- Sample weekly mood-only analytics were removed from parent view
- Disease-wise admin analytics now update from stored assessment condition data
- Questionnaire enforces answer-before-next and timer wait rules
- First doctor login password modal now asks only:
	- New password
	- Retype new password
- In-dashboard doctor password-change card is removed

## Tech Stack

Frontend:
- React 18
- Vite
- Tailwind CSS
- React Router v6
- Recharts
- Lucide React

Backend:
- Node.js
- Express
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs
- nodemailer
- dotenv

## Quick Start

### 1. Prerequisites
- Node.js 18+
- npm

### 2. Install dependencies

Root:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
```

### 3. Configure backend environment

Create [backend/.env](backend/.env) from [backend/.env.example](backend/.env.example).

Minimum values:
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASS
- APP_URL=http://localhost:3000
- PORT=4000

### 4. Run app

Terminal A (root):

```bash
npm run dev
```

Terminal B (backend):

```bash
cd backend
npm run dev
```

URLs:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health: http://localhost:4000/health

## Build Frontend

```bash
npm run build
npm run preview
```

## High-Level Flow

1. Parent creates child account
2. Child completes questionnaire
3. Backend stores score, risk level, and condition summary
4. Parent sees recommendations and books doctor with consent
5. Doctor confirms or rejects in portal
6. Parent receives status email update
7. Admin sees updated aggregated analytics

## Important Notes

- This is a support tool, not a medical diagnosis tool.
- Doctor only sees child assessment history when parent gives consent.
- Do not commit local secrets from [backend/.env](backend/.env).
- Runtime artifacts such as `.db-wal`, `.db-shm`, and Vite cache should not be committed.
