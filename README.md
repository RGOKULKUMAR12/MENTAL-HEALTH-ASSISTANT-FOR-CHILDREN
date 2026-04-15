# Mindful Kids - Mental Health Assistant for Children

Mindful Kids is a role-based web platform for child mental well-being tracking.
It supports children, parents, doctors, and admins with a complete workflow from questionnaire submission to consent-based appointment management.

## Documentation

Start here:
- [MASTER_PROJECT_REPORT.md](MASTER_PROJECT_REPORT.md) (full technical master guide)
- [Report/MASTER_PROJECT_REPORT.pdf](Report/MASTER_PROJECT_REPORT.pdf) (PDF version)
- [PROJECT_FLOW.md](PROJECT_FLOW.md) (quick flow summary)
- [backend/README.md](backend/README.md) (backend-specific notes)
- [CONTINUE_CHAT.md](CONTINUE_CHAT.md) (cross-device continuation template)

## Core Features

### Role-based access (RBAC)
- Child: check-in questionnaire, wellness activities, streak tracking
- Parent: child management, risk insights, appointment booking
- Doctor: appointment triage, future schedule, patient reports, password update
- Admin: parent/doctor management, analytics dashboard

### Assessment and risk flow
- Child submits structured questionnaire responses
- Backend computes average score and risk level
- Parent sees recommendations and condition highlights
- Alerts are generated for moderate/high concern levels

### Appointment and consent workflow
- Parent booking requires explicit data-sharing consent
- Parent booking is temporarily withheld when child has an active appointment
- Doctor can confirm, reject, postpone, or complete appointment
- Slot availability is updated automatically based on status transitions

### Doctor onboarding and security
- Admin creates doctor account
- Temporary password is auto-generated and emailed
- First doctor login is forced to change password via popup modal

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
- Node.js 18+ (Node 20+ recommended)
- npm

### 2. Install dependencies
Project root:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
```

### 3. Configure environment
Create backend env file:
- Copy backend/.env.example to backend/.env

Set at minimum:
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASS
- APP_URL (usually http://localhost:3000)
- PORT (usually 4000)

### 4. Run the app
Terminal A (project root):

```bash
npm run dev
```

Terminal B (backend):

```bash
cd backend
npm run dev
```

Frontend:
- http://localhost:3000

Backend:
- http://localhost:4000

Health endpoint:
- http://localhost:4000/health

## Build Commands

Project root:

```bash
npm run build
npm run preview
```

## Repository Structure (High Level)

- [src](src): frontend app source
- [backend/src](backend/src): API routes, middleware, DB init/migrations
- [backend/data](backend/data): SQLite DB files
- [Report](Report): generated and document files
- [MASTER_PROJECT_REPORT.md](MASTER_PROJECT_REPORT.md): master architecture and workflow guide

For detailed file-by-file explanation, use:
- [MASTER_PROJECT_REPORT.md](MASTER_PROJECT_REPORT.md)

## Current Workflow Summary

1. Parent creates child account.
2. Child signs in and submits questionnaire.
3. Backend stores assessment and risk level.
4. Parent views recommendations and, if needed, books doctor with consent.
5. Doctor receives notification, signs in, and manages appointment status.
6. Parent booking availability updates automatically based on appointment state.

## Notes

- This is a support and monitoring system, not a medical diagnosis engine.
- Parent consent is enforced before doctor sees child assessment data.
- Keep .env and database artifacts out of public sharing.
