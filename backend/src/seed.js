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
}
