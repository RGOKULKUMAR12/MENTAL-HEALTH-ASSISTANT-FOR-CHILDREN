# Mindful Kids - Project Flow

This document explains the full app flow in simple steps.

## 1. Start the Project

Prerequisites:
- Node.js 18+
- npm

Run frontend (root):

```bash
npm install
npm run dev
```

Run backend:

```bash
cd backend
npm install
npm run dev
```

Open:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## 2. Users and Their Job

- Child: complete check-ins and wellness activities
- Parent: manage children, view insights, book appointments
- Doctor: manage appointment decisions and review consented history
- Admin: manage accounts and monitor analytics

## 3. Parent and Child Flow

1. Parent registers and logs in
2. Parent creates child account (name, user id, password)
3. Child logs in with user id and password
4. Child answers questionnaire section by section
5. Each question is mandatory before moving to next
6. Timer check is enforced before next action
7. Submission stores score, risk level, and condition summary
8. Parent dashboard updates with real saved data

## 4. Risk Logic (Simple)

Average score mapping:
- 3.5 to 5.0 = Low risk
- 2.0 to 3.4 = Moderate risk
- 1.0 to 1.9 = High risk

## 5. Parent Appointment Booking Flow

1. Parent opens booking for a child
2. Parent selects doctor and time slot
3. Parent must enable data-sharing consent
4. System checks child has no active appointment lock
5. Booking is created with status `booked`
6. Slot becomes unavailable
7. Doctor receives booking email (no action links)

## 6. Doctor Flow

1. Admin creates doctor with temporary password + clinic address
2. Doctor logs in first time
3. Doctor sees required password modal
4. Modal asks only:
   - New password
   - Retype new password
5. Doctor enters portal and reviews bookings
6. Doctor can set status:
   - confirmed
   - rejected
   - postponed
   - completed

## 7. Appointment Status and Email Rules

- Confirmed:
  - Parent gets reply email with date, time, and clinic location
  - Slot remains occupied

- Rejected:
  - Parent gets reply email about rejection
  - Slot is released

- Completed:
  - Slot is released

## 8. Parent Data Visibility Rule

- Doctor can only view patient history if parent consent was enabled for booking.

## 9. Admin Flow

Admin can:
- Create and manage doctors
- Create/manage parent accounts
- Review analytics dashboard

Analytics now include:
- Risk distribution
- Appointment status distribution
- Disease-wise breakdown from saved condition data

## 10. Important Notes

- This system supports monitoring and early support, not medical diagnosis.
- Runtime files like `.db-wal`, `.db-shm`, and Vite cache should not be committed.
