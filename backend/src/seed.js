import bcrypt from 'bcryptjs';
import { db } from './db.js';

export async function seedIfEmpty() {
  const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  const sampleDoctorPasswordHash = await bcrypt.hash('doctor123', 10);
  const sampleClinicAddresses = [
    '12, Apollo Bunder, Colaba, Mumbai, Maharashtra 400001',
    '24, Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017',
    '18, Sector 62, Noida, Uttar Pradesh 201309',
  ];
  const existingAdminByEmail = db.prepare('SELECT id FROM users WHERE role = ? AND email = ?').get('admin', 'admin@example.com');
  if (existingAdminByEmail) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run('Dr. Gokul Kumar', existingAdminByEmail.id);
  }

  const existingAdminByName = db.prepare('SELECT id FROM users WHERE role = ? AND name = ?').get('admin', 'Dr. Johnson');
  if (existingAdminByName) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run('Dr. Gokul Kumar', existingAdminByName.id);
  }

  const doctorsWithoutPasswords = db.prepare("SELECT id FROM doctors WHERE password_hash IS NULL OR password_hash = ''").all();
  if (doctorsWithoutPasswords.length > 0) {
    const updateDoctorPassword = db.prepare('UPDATE doctors SET password_hash = ? WHERE id = ?');
    for (const doctor of doctorsWithoutPasswords) {
      updateDoctorPassword.run(sampleDoctorPasswordHash, doctor.id);
    }
  }

  const doctorsWithoutAddresses = db.prepare("SELECT id FROM doctors WHERE clinic_address IS NULL OR clinic_address = ''").all();
  if (doctorsWithoutAddresses.length > 0) {
    const updateDoctorAddress = db.prepare('UPDATE doctors SET clinic_address = ? WHERE id = ?');
    doctorsWithoutAddresses.forEach((doctor, index) => {
      updateDoctorAddress.run(sampleClinicAddresses[index % sampleClinicAddresses.length], doctor.id);
    });
  }

  if (usersCount > 0) return;

  const parentPassword = await bcrypt.hash('parent123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const childPassword = await bcrypt.hash('alex123', 10);

  const parentInfo = db
    .prepare('INSERT INTO users (role, name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run('parent', 'Sarah Smith', 'sarah@example.com', parentPassword);
  const parentId = parentInfo.lastInsertRowid;

  db.prepare('INSERT INTO users (role, name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run('admin', 'Dr. Gokul Kumar', 'admin@example.com', adminPassword);

  const childInfo = db
    .prepare('INSERT INTO users (role, name, username, password_hash, parent_id) VALUES (?, ?, ?, ?, ?)')
    .run('child', 'Alex', 'alex123', childPassword, parentId);
  const childId = childInfo.lastInsertRowid;

  db.prepare(`
    INSERT INTO assessments (child_id, responses_json, avg_score, risk_level, recommendation_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    childId,
    JSON.stringify({ e1: 4, e2: 4, b1: 3, c1: 4, s1: 5 }),
    4.0,
    'low',
    JSON.stringify({
      title: 'Keep up the great work!',
      description: 'Continue regular check-ins and wellness activities.',
      actions: ['Continue daily wellness habits', 'Maintain regular check-ins'],
      showAppointment: false,
      showExercises: true,
    }),
  );

  // Add sample doctors
  const doctor1 = db.prepare(`
    INSERT INTO doctors (name, specialization, email, clinic_address, password_hash, phone, bio, available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Dr. Emily Watson',
    'Child Psychologist',
    'emily.watson@clinic.com',
    sampleClinicAddresses[0],
    sampleDoctorPasswordHash,
    '+1-555-0101',
    'Specializes in anxiety and depression in children',
    1
  );
  const doctor1Id = doctor1.lastInsertRowid;

  const doctor2 = db.prepare(`
    INSERT INTO doctors (name, specialization, email, clinic_address, password_hash, phone, bio, available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Dr. Michael Chen',
    'Child Psychiatrist',
    'michael.chen@clinic.com',
    sampleClinicAddresses[1],
    sampleDoctorPasswordHash,
    '+1-555-0102',
    'Expert in ADHD and behavioral disorders',
    1
  );
  const doctor2Id = doctor2.lastInsertRowid;

  const doctor3 = db.prepare(`
    INSERT INTO doctors (name, specialization, email, clinic_address, password_hash, phone, bio, available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Dr. Sarah Martinez',
    'Child Counselor',
    'sarah.martinez@clinic.com',
    sampleClinicAddresses[2],
    sampleDoctorPasswordHash,
    '+1-555-0103',
    'Focuses on social skills and emotional development',
    1
  );
  const doctor3Id = doctor3.lastInsertRowid;

  // Add sample time slots
  const today = new Date();
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  // Add time slots for each doctor
  [doctor1Id, doctor2Id, doctor3Id].forEach((doctorId) => {
    dates.forEach((date) => {
      times.forEach((time) => {
        db.prepare(`
          INSERT INTO time_slots (doctor_id, date, time, duration_minutes, available)
          VALUES (?, ?, ?, ?, ?)
        `).run(doctorId, date, time, 30, 1);
      });
    });
  });
}

