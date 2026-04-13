import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || './data/mental-pro.db';
const absoluteDbPath = path.resolve(process.cwd(), dbPath);
const dbDir = path.dirname(absoluteDbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(absoluteDbPath);
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('parent','child','admin')),
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      parent_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(parent_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL,
      responses_json TEXT NOT NULL,
      avg_score REAL NOT NULL,
      risk_level TEXT NOT NULL CHECK(risk_level IN ('low','moderate','high')),
      recommendation_json TEXT NOT NULL,
      identified_conditions TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(child_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      child_id INTEGER,
      child_name TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(child_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      child_id INTEGER,
      severity TEXT NOT NULL CHECK(severity IN ('low','moderate','high')),
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(child_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      bio TEXT,
      available INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS time_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      available INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(doctor_id) REFERENCES doctors(id)
    );

    CREATE TABLE IF NOT EXISTS appointments_updated (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      child_id INTEGER,
      child_name TEXT,
      doctor_id INTEGER,
      time_slot_id INTEGER,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'booked',
      appointment_date TEXT,
      appointment_time TEXT,
      doctor_confirmed_at TEXT,
      status_changed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(child_id, time_slot_id),
      FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(child_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY(doctor_id) REFERENCES doctors(id),
      FOREIGN KEY(time_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS appointment_status_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT,
      changed_by TEXT,
      changed_by_id INTEGER,
      reason TEXT,
      changed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(appointment_id) REFERENCES appointments_updated(id) ON DELETE CASCADE
    );
  `);

  // Migration: Add missing columns to existing tables
  try {
    // Check if identified_conditions column exists in assessments table
    const assessmentColumns = db.prepare("PRAGMA table_info(assessments)").all();
    const hasIdentifiedConditions = assessmentColumns.some(col => col.name === 'identified_conditions');

    if (!hasIdentifiedConditions) {
      db.exec('ALTER TABLE assessments ADD COLUMN identified_conditions TEXT');
      console.log('Added identified_conditions column to assessments table');
    }

    // Check if conditions_json column exists in assessments table (for disease tracking)
    const hasConditionsJson = assessmentColumns.some(col => col.name === 'conditions_json');

    if (!hasConditionsJson) {
      db.exec('ALTER TABLE assessments ADD COLUMN conditions_json TEXT');
      console.log('Added conditions_json column to assessments table');
    }

    // Check if appointment status columns exist in appointments_updated table
    const appointmentColumns = db.prepare("PRAGMA table_info(appointments_updated)").all();
    const hasDoctorConfirmedAt = appointmentColumns.some(col => col.name === 'doctor_confirmed_at');
    const hasStatusChangedAt = appointmentColumns.some(col => col.name === 'status_changed_at');
    const hasChildName = appointmentColumns.some(col => col.name === 'child_name');

    if (!hasDoctorConfirmedAt) {
      db.exec('ALTER TABLE appointments_updated ADD COLUMN doctor_confirmed_at TEXT');
      console.log('Added doctor_confirmed_at column to appointments_updated table');
    }

    if (!hasStatusChangedAt) {
      db.exec('ALTER TABLE appointments_updated ADD COLUMN status_changed_at TEXT');
      console.log('Added status_changed_at column to appointments_updated table');
    }

    if (!hasChildName) {
      db.exec('ALTER TABLE appointments_updated ADD COLUMN child_name TEXT');
      console.log('Added child_name column to appointments_updated table');
    }

    const appointmentFkList = db.prepare("PRAGMA foreign_key_list(appointments_updated)").all();
    const childFk = appointmentFkList.find((fk) => fk.from === 'child_id');
    if (childFk && childFk.on_delete !== 'SET NULL') {
      db.exec('PRAGMA foreign_keys = OFF');
      db.exec(`
        CREATE TABLE appointments_updated_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parent_id INTEGER NOT NULL,
          child_id INTEGER,
          child_name TEXT,
          doctor_id INTEGER,
          time_slot_id INTEGER,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'booked',
          appointment_date TEXT,
          appointment_time TEXT,
          doctor_confirmed_at TEXT,
          status_changed_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(child_id, time_slot_id),
          FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(child_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY(doctor_id) REFERENCES doctors(id),
          FOREIGN KEY(time_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL
        );
      `);
      db.exec(`
        INSERT INTO appointments_updated_new (
          id, parent_id, child_id, child_name, doctor_id, time_slot_id, reason,
          status, appointment_date, appointment_time, doctor_confirmed_at,
          status_changed_at, created_at
        )
        SELECT
          id, parent_id, child_id, child_name, doctor_id, time_slot_id, reason,
          status, appointment_date, appointment_time, doctor_confirmed_at,
          status_changed_at, created_at
        FROM appointments_updated;
      `);
      db.exec('DROP TABLE appointments_updated');
      db.exec('ALTER TABLE appointments_updated_new RENAME TO appointments_updated');
      db.exec('PRAGMA foreign_keys = ON');
      console.log('Migrated appointments_updated to preserve appointment history on child delete');
    }

    const legacyAppointmentColumns = db.prepare("PRAGMA table_info(appointments)").all();
    const hasLegacyChildName = legacyAppointmentColumns.some(col => col.name === 'child_name');
    if (!hasLegacyChildName) {
      db.exec('ALTER TABLE appointments ADD COLUMN child_name TEXT');
      console.log('Added child_name column to appointments table');
    }

    const legacyFkList = db.prepare("PRAGMA foreign_key_list(appointments)").all();
    const legacyChildFk = legacyFkList.find((fk) => fk.from === 'child_id');
    if (legacyChildFk && legacyChildFk.on_delete !== 'SET NULL') {
      db.exec('PRAGMA foreign_keys = OFF');
      db.exec(`
        CREATE TABLE appointments_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parent_id INTEGER NOT NULL,
          child_id INTEGER,
          child_name TEXT,
          preferred_date TEXT,
          preferred_time TEXT,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY(parent_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(child_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);
      db.exec(`
        INSERT INTO appointments_new (
          id, parent_id, child_id, child_name, preferred_date, preferred_time,
          reason, status, created_at
        )
        SELECT
          id, parent_id, child_id, child_name, preferred_date, preferred_time,
          reason, status, created_at
        FROM appointments;
      `);
      db.exec('DROP TABLE appointments');
      db.exec('ALTER TABLE appointments_new RENAME TO appointments');
      db.exec('PRAGMA foreign_keys = ON');
      console.log('Migrated legacy appointments to preserve history on child delete');
    }

  } catch (error) {
    console.error('Migration error:', error);
  }
}
