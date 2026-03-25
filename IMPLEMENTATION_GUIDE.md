# Mental Health Assistant - Implementation Guide

## 📋 New Features Implemented

### 1. Mental Illness Identification System
- **File**: `src/utils/mentalIllnessIdentification.js`
- **Features**:
  - Identifies potential mental health conditions based on assessment responses
  - Tracks 8 main conditions: Anxiety, Depression, ADHD, Sleep Disorders, Low Self-Esteem, Social Anxiety, Behavioral Issues, Social Isolation
  - Generates confidence levels (high/moderate) for each identified condition
  - Provides condition-specific symptoms, tips, and professional recommendations

### 2. Improved Questionnaire with Pagination
- **File**: `src/pages/QuestionnaireImproved.jsx`
- **Features**:
  - Shows 4 section cards (Emotional, Behavioral, Cognitive, Social) initially
  - Click on a section to start answering questions
  - One question at a time with Next/Previous navigation
  - Auto-advance to next question after responding
  - Progress tracking showing % completed and answered questions
  - Mark sections as completed with visual indicators
  - Progress bar for each section

### 3. Assessment Results Page with Health Insights
- **File**: `src/pages/AssessmentResults.jsx`
- **Features**:
  - Displays risk level with color coding (Green/Yellow/Red)
  - Shows identified mental health conditions with:
    - Condition name and icon
    - Common symptoms
    - Helpful strategies and tips
    - Professional help recommendations
  - General wellness tips
  - Next steps and action items
  - Print-friendly results
  - Direct appointment booking integration

### 4. Advanced Appointment Booking System
- **File**: `src/components/AppointmentBookingModal.jsx`
- **Features**:
  - Multi-stage booking process:
    1. Select doctor from available list
    2. Choose available time slots
    3. Enter reason for visit
    4. Confirm and book
  - Shows doctor specialty, bio, and availability
  - Time slots grouped by date with day and time
  - Displays appointment summary before confirming
  - Automatic email sent to doctor upon booking
  - Success confirmation with appointment ID

### 5. Doctor Management Admin Panel
- **File**: `src/pages/DoctorManagementAdmin.jsx`
- **Features**:
  - Add new doctors with:
    - Name, specialization, email, phone
    - Professional bio
  - View all registered doctors
  - Manage time slots for each doctor
  - Add time slots with:
    - Date selection
    - Time selection
    - Duration options (15/30/45/60 minutes)
  - Delete doctors (soft delete, marks as unavailable)

### 6. Backend Doctor Management Routes
- **File**: `backend/src/routes/doctors.js`
- **Endpoints**:
  - `GET /doctors` - List all available doctors
  - `GET /doctors/:doctorId/slots` - Get doctor details and available slots
  - `GET /slots/available` - Get all available slots across all doctors
  - `POST /doctors` - Add new doctor (admin only)
  - `PUT /doctors/:doctorId` - Update doctor (admin only)
  -  `DELETE /doctors/:doctorId` - Delete doctor (admin only)
  - `POST /slots` - Add time slot (admin only)
  - `DELETE /slots/:slotId` - Delete time slot (admin only)

### 7. Enhanced Appointment Routes
- **File**: `backend/src/routes/appointments.js`
- **New Endpoints**:
  - `POST /appointments/book` - Book appointment with doctor and time slot
  - `GET /appointments/parent/:parentId` - Get parent's appointments
  - `GET /appointments/admin/all` - Get all appointments (admin only)
  - `DELETE /appointments/:appointmentId` - Cancel appointment
- **Features**:
  - Email notification to doctor when appointment is booked
  - Automatic time slot marking as unavailable
  - Appointment status tracking
  - Parent-child relationship verification

### 8. Database Schema Updates
- **File**: `backend/src/db.js`
- **New Tables**:
  - `doctors` - Doctor profiles with specialization, emails, bios
  - `time_slots` - Available time slots for appointments
  - `appointments_updated` - New appointment model with doctor and slot references

---

## 🔐 Admin Credentials

### Default Admin Account
```
Email: admin@example.com
Password: admin123
Role: admin
```

### Demo Parent Account
```
Email: sarah@example.com
Password: parent123
Role: parent
Child: Alex (username: alex123, password: alex123)
```

### Demo Sample Doctors (Pre-loaded)
1. **Dr. Emily Watson** - Child Psychologist
   - Email: emily.watson@clinic.com
   - Phone: +1-555-0101

2. **Dr. Michael Chen** - Child Psychiatrist
   - Email: michael.chen@clinic.com
   - Phone: +1-555-0102

3. **Dr. Sarah Martinez** - Child Counselor
   - Email: sarah.martinez@clinic.com
   - Phone: +1-555-0103

---

## 📧 Email Configuration

### For Appointment Notifications

To enable email sending when appointments are booked:

1. **Using Gmail (Recommended)**:
   - Go to: https://myaccount.google.com/apppasswords
   - Enable 2-Factor Authentication first
   - Generate an App Password for "Mail" and "Windows Computer"
   - Copy the 16-character password

2. **Set Environment Variables**:
   Create/update `backend/.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

3. **Test**:
   - When an appointment is booked, an email is sent to the doctor's email address
   - Email includes: child name, parent contact, appointment date/time, reason, confirmation ID

**Note**: If EMAIL_USER is not set, appointments still book but email notification is skipped (logged in console).

---

## 🚀 How to Use New Features

### For Parents:
1. **View Assessment Results**:
   - After child completes questionnaire, results show identified conditions
   - See symptoms, tips, and professional recommendations
   - Print results for reference

2. **Book Appointment**:
   - Click "Book an Appointment" button on results page or parent dashboard
   - Select doctor from available list (shows specialization and bio)
   - Choose preferred date and time
   - Enter reason for visit
   - Confirm booking
   - Get appointment confirmation with ID

3. **View Appointments**:
   - Parent dashboard shows all booked appointments
   - Shows doctor name, date, time, and status

### For Children:
1. **Improved Questionnaire**:
   - See 4 section cards on start
   - Click section to answer questions
   - Answer one question at a time
   - Use Next/Previous to navigate
   - Mark sections as complete as you go

2. **View Assessment Results**:
   - See identified health areas
   - Read helpful tips specific to your challenges
   - Print results to share

### For Admins:
1. **Manage Doctors**:
   - Go to Admin Dashboard → Doctor Management
   - Click "Add Doctor" to register new doctor
   - Fill: Name, Specialization, Email, Phone, Bio
   - Click doctor name to manage time slots

2. **Manage Time Slots**:
   - Select doctor to manage their schedule
   - Click "Add Slot"
   - Set date, time, and duration
   - Remove slots by clicking delete

3. **View All Appointments**:
   - Admin dashboard shows all appointments
   - See doctor, parent, child, appointment date/time
   - Track appointment confirmations

---

## 🔄 Data Flow

### Questionnaire → Results → Appointment Booking

```
1. Child completes QuestionnaireImproved
   ↓
2. Backend calculates risk score + identifies conditions
   ↓
3. AssessmentResults page displays:
   - Risk level
   - Identified conditions with tips
   ↓
4. Parent clicks "Book Appointment"
   ↓
5. AppointmentBookingModal opens
   ↓
6. Parent selects doctor → sees available slots
   ↓
7. Parent books appointment
   ↓
8. Email sent to doctor with details
   ↓
9. Confirmation shown to parent
```

---

## 📦 Dependencies Added

### Backend
- `nodemailer@^6.9.7` - For email notifications

### Frontend
- Uses existing dependencies (Lucide icons, React Router, etc.)

---

## 🔧 Configuration Files

### New Files:
- `.env.example` - Updated with email configuration

### Modified Files:
- `backend/src/db.js` - Added doctors and time_slots tables
- `backend/src/seed.js` - Seed sample doctors and time slots
- `backend/src/server.js` - Added doctors route
- `backend/src/routes/appointments.js` - Enhanced with new booking system
- `backend/package.json` - Added nodemailer dependency

### New Pages:
- `src/pages/QuestionnaireImproved.jsx`
- `src/pages/AssessmentResults.jsx`
- `src/pages/DoctorManagementAdmin.jsx`

### New Components:
- `src/components/AppointmentBookingModal.jsx`

### New Utils:
- `src/utils/mentalIllnessIdentification.js`

---

## ✅ Testing Checklist

- [ ] Admin can login with credentials
- [ ] Admin can add new doctors
- [ ] Admin can add time slots for doctors
- [ ] Parent can view child's questionnaire results
- [ ] Results show identified mental health conditions
- [ ] Parent can book appointment with doctor
- [ ] Appointment booking shows available time slots
- [ ] Email is sent to doctor (check configured email)
- [ ] Child can complete questionnaire with new UI
- [ ] Questionnaire shows one question at a time
- [ ] Sections mark as complete
- [ ] Progress bar updates correctly
- [ ] Results page displays condition-specific tips

---

## 🐛 Troubleshooting

### Email Not Sending:
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Ensure Gmail account has 2FA enabled
- Verify app password is correct (16 characters)
- Check backend console for error messages

### Database Issues:
- Delete `backend/data/mental-pro.db` to reset
- Run `npm run dev` to reinitialize
- Sample data will be reseeded

### Appointment Booking Not Working:
- Ensure doctors are added first
- Verify doctor has available time slots
- Check that date is not in the past

---

## 📝 Notes

- All emails are currently configured for Gmail
- To use other providers (Outlook, SendGrid), update transporter config in `appointments.js`
- Doctor soft delete (marked unavailable) preserves appointment history
- Time slot soft delete allows rebooking if needed
- Assessment results can be printed for records
- Mental illness identification has confidence scores to indicate reliability

---

For questions or issues, refer to the individual file comments and documentation.
