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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(child_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      child_id INTEGER NOT NULL,
      preferred_date TEXT,
      preferred_time TEXT,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(parent_id) REFERENCES users(id),
      FOREIGN KEY(child_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      child_id INTEGER,
      severity TEXT NOT NULL CHECK(severity IN ('low','moderate','high')),
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(parent_id) REFERENCES users(id),
      FOREIGN KEY(child_id) REFERENCES users(id)
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
      child_id INTEGER NOT NULL,
      doctor_id INTEGER,
      time_slot_id INTEGER,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      appointment_date TEXT,
      appointment_time TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(child_id, time_slot_id),
      FOREIGN KEY(parent_id) REFERENCES users(id),
      FOREIGN KEY(child_id) REFERENCES users(id),
      FOREIGN KEY(doctor_id) REFERENCES doctors(id),
      FOREIGN KEY(time_slot_id) REFERENCES time_slots(id)
    );
  `);
}
