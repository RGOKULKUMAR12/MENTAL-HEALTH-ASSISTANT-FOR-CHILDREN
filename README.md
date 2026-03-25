# Mindful Kids – Mental Health & Well-Being Surveillance for Children

A modern, responsive frontend for a Mental Health and Well-Being Surveillance, Assessment and Tracking System for Children. The app is **ethical, child-friendly, privacy-aware, and supportive** (non-diagnostic).

## Tech Stack

- **React 18** (Vite)
- **Tailwind CSS** for styling
- **Recharts** for visualizations
- **React Router v6** for routing
- **Lucide React** for icons

## Features

### User roles (RBAC)

- **Child** – Check-ins, wellness activities, dashboard
- **Parent** – Linked children, consent, reports, alerts, appointment booking
- **Admin/Counselor** – Aggregated analytics, doctor management, user administration

### Parent–Child linking and consent

- List of linked children
- Pending consent requests
- Approve/reject child participation
- Child cannot submit assessments without parent approval

### Doctor & Appointment Management

- **Admin portal:** Create and manage doctors with bio and specialization
- **Time slot management:** Admins add multiple time slots per doctor during registration
- **Sequential slot allocation:** Next slot automatically starts at previous slot end time
- **Date picker:** Only allows booking from today onwards (no past dates)
- **Appointment booking:** Parents can select doctor and available time slot
- **Duplicate prevention:** Same child cannot book the same time slot twice (database-level constraint)
- **Email notifications:** Doctor receives email notification when appointment is booked

### Mental Health Condition Identification

- **8 mental health conditions identified:** Anxiety Disorders, Depression, ADHD, OCD, PTSD, Panic Disorder, Insomnia, Stress-related Disorders
- **Confidence scoring:** Each condition shows confidence level (high/moderate/low)
- **Condition details:** Full description and key symptoms displayed to parents
- **Prominent display:** Conditions highlighted with red/orange visual styling on parent dashboard

### Longitudinal tracking

- Weekly and monthly mood/wellness trend graphs
- Historical risk-level timeline (informational)

### Early warning UI

- Non-alarming, informational alerts
- Color-coded (yellow/orange/red)
- “Risk increase detected” messaging (non-diagnostic)

### Wellness activities

- Timer-based breathing exercise
- Mindfulness prompts (5–4–3–2–1 grounding)
- Positive habit reminders

### Analytics and reporting

- **Parent:** summary cards, mood trends, downloadable/print-friendly layout
- **Admin:** aggregated, anonymized analytics (no individual child data)

### Questionnaire module (Child portal)

- Child-friendly Likert scale (1–5) with emoji inputs
- **Grouped questions:** Emotional, Behavioral, Cognitive, Social
- **Card-based section selection:** Visual cards to choose assessment topics
- **Single-question pagination:** One question per screen for better focus
- **5-second waiting timer:** Encourages reflection before proceeding
- **Progress bars:** Shows overall and section-specific progress
- **Score-based risk assessment** (no ML): avg score determines Low/Moderate/High risk

### Risk-based recommendations (Parent dashboard)

- **Low risk:** Keep up wellness, regular check-ins
- **Moderate risk:** Suggest wellness exercises (breathing, grounding)
- **High risk:** Appointment booking section for counselor
- **Identified conditions:** Display mental health areas for parental awareness

## Project structure

```
src/
├── api/              # API service layer with generic HTTP methods
├── components/
│   ├── AdminUserManagement.jsx      # Admin portal for user & doctor management
│   ├── AppointmentBookingModal.jsx  # Appointment booking workflow
│   ├── Layout/       # AppLayout, ProtectedLayout
│   └── ui/           # Card, RiskBadge
├── contexts/         # AuthContext (RBAC)
├── data/             # Mock data
├── pages/            # All page components
│   ├── dashboards/   # Child, Parent (with condition display), Admin
│   ├── DoctorManagementAdmin.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Questionnaire.jsx (improved with cards & pagination)
│   ├── Wellness.jsx
│   ├── Reports.jsx
│   ├── Alerts.jsx
│   ├── Settings.jsx
│   └── ParentChildren.jsx
├── utils/
│   ├── mentalIllnessIdentification.js  # 8 condition definitions
│   ├── riskAssessment.js
│   └── streakUtils.js
├── App.jsx
├── main.jsx
└── index.css

backend/
├── src/
│   ├── routes/
│   │   ├── auth.js                # User authentication & admin endpoints
│   │   ├── doctors.js             # Doctor CRUD & time slot management
│   │   ├── appointments.js        # Appointment booking with duplicate prevention
│   │   ├── assessments.js
│   │   ├── alerts.js
│   │   ├── parents.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js                # JWT verification & RBAC
│   ├── db.js                      # SQLite with UNIQUE constraint on (child_id, time_slot_id)
│   ├── seed.js                    # Database initialization
│   └── server.js                  # Express app setup
├── data/
│   └── mental-pro.db              # SQLite database
└── package.json
```

## Project flow & user responsibilities

See **[PROJECT_FLOW.md](./PROJECT_FLOW.md)** for:
- How to run the project
- End-to-end flow
- Risk-based recommendations
- Responsibilities of Child, Parent, and Admin

## Recent updates (March 2026 Checkpoint)

### Admin Features
- Centralized user management portal for creating parents and doctors
- Real-time parent/child/doctor listing from database
- Modal-based forms for streamlined data entry
- Session-aware authentication with automatic logout on expiry

### Doctor Management
- Create doctors with specialization, contact info, and bio
- Add multiple time slots during doctor registration
- Sequential time slot allocation (9:00-9:30, 9:30-10:00, etc.)
- Date restrictions (no past dates) for new slots

### Appointment System
- Parent-friendly booking modal with visual doctor cards
- Show available time slots per selected doctor
- Booking confirmation with appointment ID
- Database-level duplicate prevention (UNIQUE constraint)
- Email notifications to doctors on new bookings

### Mental Health Insights
- Automatic identification of 8 mental health conditions
- Confidence-based scoring system
- Enhanced parent dashboard with condition cards
- Red/orange styling for visual prominence

### UX/UI Improvements
- Token management fixes (prevent logout loops)
- Robust API response parsing (array/object handling)
- Better error messages with actionable feedback
- Responsive modal layouts with scrolling support
- Accessible form inputs with date/time pickers

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Start the backend server (in another terminal):
   ```bash
   cd backend
   npm start
   ```
   Backend runs on `http://localhost:4000`

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

## Backend integration

- Frontend API client: `src/api/api.js` (generic get, post, put, delete methods)
- Set `VITE_API_URL` (default: `http://localhost:4000/api`)
- Backend service is in `backend/` (Express + SQLite)
- **Doctor endpoints:** Create, read, update, delete doctors and time slots
- **Appointment endpoints:** Book appointments with duplicate prevention validation
- **Admin endpoints:** User management (create parents, view users, delete users)
- **Email notifications:** Nodemailer integration for appointment confirmations
- Backend setup and endpoints: `backend/README.md`

## Demo login

Use any email/password and choose a role on the login page:

- **Child** – Access to child dashboard, questionnaire, wellness
- **Parent** – Access to parent dashboard, children, reports
- **Admin** – Access to admin dashboard and analytics

## Ethical and privacy notes

- No medical diagnosis; focus on monitoring and support
- Child-friendly design and language
- Parent consent required before child assessments
- Admin views only aggregated, anonymized data
