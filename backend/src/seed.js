import bcrypt from 'bcryptjs';
import { db } from './db.js';

export async function seedIfEmpty() {
  const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (usersCount > 0) return;

  const parentPassword = await bcrypt.hash('parent123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const childPassword = await bcrypt.hash('alex123', 10);

  const parentInfo = db
    .prepare('INSERT INTO users (role, name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run('parent', 'Sarah Smith', 'sarah@example.com', parentPassword);
  const parentId = parentInfo.lastInsertRowid;

  db.prepare('INSERT INTO users (role, name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run('admin', 'Dr. Johnson', 'admin@example.com', adminPassword);

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
    INSERT INTO doctors (name, specialization, email, phone, bio, available)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Dr. Emily Watson',
    'Child Psychologist',
    'emily.watson@clinic.com',
    '+1-555-0101',
    'Specializes in anxiety and depression in children',
    1
  );
  const doctor1Id = doctor1.lastInsertRowid;

  const doctor2 = db.prepare(`
    INSERT INTO doctors (name, specialization, email, phone, bio, available)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Dr. Michael Chen',
    'Child Psychiatrist',
    'michael.chen@clinic.com',
    '+1-555-0102',
    'Expert in ADHD and behavioral disorders',
    1
  );
  const doctor2Id = doctor2.lastInsertRowid;

  const doctor3 = db.prepare(`
    INSERT INTO doctors (name, specialization, email, phone, bio, available)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Dr. Sarah Martinez',
    'Child Counselor',
    'sarah.martinez@clinic.com',
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

