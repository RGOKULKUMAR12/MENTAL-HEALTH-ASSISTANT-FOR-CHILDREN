# Mental Pro Backend

Express + SQLite backend for the Mindful Kids app.

## Stack

- Node.js + Express
- SQLite (`better-sqlite3`)
- JWT auth
- `bcryptjs` password hashing

## Setup

1. Go to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create env file:
   - Copy `.env.example` to `.env`
   - Set a strong `JWT_SECRET`

4. Start server:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:4000` by default.

## Seeded Demo Users

- Parent: `sarah@example.com` / `parent123`
- Admin: `admin@example.com` / `admin123`
- Child: `alex123` / `alex123`

## API Overview

- `POST /api/auth/register-parent`
- `POST /api/auth/login`
- `GET /api/parents/:parentId/children`
- `POST /api/parents/:parentId/children`
- `DELETE /api/parents/:parentId/children/:childId`
- `GET /api/parents/:parentId/dashboard`
- `POST /api/children/:childId/assessments`
- `GET /api/children/:childId/assessments`
- `POST /api/appointments`
- `GET /api/appointments/parent/:parentId`
- `GET /api/alerts?parentId=:parentId`
- `GET /api/admin/analytics`

## Auth

Pass JWT in header:

```http
Authorization: Bearer <token>
```

