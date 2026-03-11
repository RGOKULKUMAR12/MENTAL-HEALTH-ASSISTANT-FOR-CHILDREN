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
- **Parent** – Linked children, consent, reports, alerts
- **Admin/Counselor** – Aggregated analytics (no individual data)

### Parent–Child linking and consent

- List of linked children
- Pending consent requests
- Approve/reject child participation
- Child cannot submit assessments without parent approval

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
- Progress indicator and autosave-ready logic
- **Score-based risk assessment** (no ML): avg score determines Low/Moderate/High risk

### Risk-based recommendations (Parent dashboard)

- **Low risk:** Keep up wellness, regular check-ins
- **Moderate risk:** Suggest wellness exercises (breathing, grounding)
- **High risk:** Appointment booking section for counselor

## Project structure

```
src/
├── api/              # API service layer (ready for backend)
├── components/
│   ├── Layout/       # AppLayout, ProtectedLayout
│   └── ui/           # Card, RiskBadge
├── contexts/         # AuthContext (RBAC)
├── data/             # Mock data
├── pages/            # All page components
│   ├── dashboards/   # Child, Parent, Admin
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Questionnaire.jsx
│   ├── Wellness.jsx
│   ├── Reports.jsx
│   ├── Alerts.jsx
│   ├── Settings.jsx
│   └── ParentChildren.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Project flow & user responsibilities

See **[PROJECT_FLOW.md](./PROJECT_FLOW.md)** for:
- How to run the project
- End-to-end flow
- Risk-based recommendations
- Responsibilities of Child, Parent, and Admin

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Backend integration

- Frontend API client: `src/api/api.js`
- Set `VITE_API_URL` (default: `http://localhost:4000/api`)
- Backend service is in `backend/` (Express + SQLite)
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
