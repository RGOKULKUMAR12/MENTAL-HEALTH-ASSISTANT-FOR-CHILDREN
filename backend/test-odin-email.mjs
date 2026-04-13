import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, './data/mental-pro.db'));

console.log('=== Doctor Odin Appointment Booking Test (via API) ===\n');

// Find doctor Odin
const odin = db.prepare('SELECT * FROM doctors WHERE name LIKE ?').get('%odin%');

if (!odin) {
  console.log('❌ Doctor Odin not found in database');
  const allDoctors = db.prepare('SELECT id, name, email FROM doctors').all();
  console.log('\nAvailable doctors:');
  allDoctors.forEach(doc => {
    console.log(`  - ${doc.name} (${doc.email})`);
  });
  process.exit(1);
}

console.log(`✅ Found doctor: ${odin.name}`);
console.log(`   Email: ${odin.email}`);
console.log(`   Specialization: ${odin.specialization}\n`);

// Find or create a test parent and child
let parent = db.prepare('SELECT * FROM users WHERE role = ? AND email = ?').get('parent', 'test.parent@example.com');

if (!parent) {
  console.log('Creating test parent...');
  const result = db.prepare('INSERT INTO users (role, name, email, password_hash, username) VALUES (?, ?, ?, ?, ?)')
    .run('parent', 'Test Parent', 'test.parent@example.com', 'hashed', 'testparent');
  parent = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  console.log(`✅ Parent created: ${parent.name}`);
} else {
  console.log(`✅ Using existing parent: ${parent.name}`);
}

let child = db.prepare('SELECT * FROM users WHERE role = ? AND parent_id = ?').get('child', parent.id);

if (!child) {
  console.log('Creating test child...');
  const result = db.prepare('INSERT INTO users (role, name, username, password_hash, parent_id) VALUES (?, ?, ?, ?, ?)')
    .run('child', 'Test Child', 'testchild', 'hashed', parent.id);
  child = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  console.log(`✅ Child created: ${child.name}`);
} else {
  console.log(`✅ Using existing child: ${child.name}`);
}

// Get available time slots
let slot = db.prepare('SELECT * FROM time_slots WHERE doctor_id = ? AND available = 1 LIMIT 1').get(odin.id);

if (!slot) {
  console.log('⚠️  No available time slots, creating one...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  const slotResult = db.prepare('INSERT INTO time_slots (doctor_id, date, time, available) VALUES (?, ?, ?, 1)')
    .run(odin.id, dateStr, '10:00');
  
  slot = db.prepare('SELECT * FROM time_slots WHERE id = ?').get(slotResult.lastInsertRowid);
  console.log(`✅ Created time slot: ${dateStr} at 10:00`);
}

console.log(`\n📌 Using time slot: ${slot.date} at ${slot.time}\n`);

// Create JWT token for parent
const token = jwt.sign(
  { id: parent.id, role: 'parent' },
  'replace-with-a-strong-secret',
  { expiresIn: '24h' }
);

// Make API call to book appointment
const bookingData = {
  parentId: parent.id,
  childId: child.id,
  doctorId: odin.id,
  timeSlotId: slot.id,
  reason: 'Test appointment for email verification'
};

console.log('📤 Sending appointment booking request to API...\n');
console.log('Request details:');
console.log(JSON.stringify(bookingData, null, 2));

try {
  const response = await fetch('http://localhost:4000/api/appointments/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });

  const data = await response.json();

  if (response.ok) {
    console.log('\n✅ Appointment booked successfully!');
    console.log(`   Appointment ID: ${data.id}`);
    console.log(`   Status: ${data.status}`);
    console.log(`\n📧 Email should have been sent to: ${odin.email}`);
    console.log(`📧 Subject: 📅 New Appointment Booking - ${child.name} (Awaiting Confirmation)`);
    console.log('\n⏳ Check Dr. Odin\'s mailbox for the appointment confirmation email.\n');
  } else {
    console.log('\n❌ Appointment booking failed!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${data.error || data.message}`);
  }
} catch (error) {
  console.log('\n❌ API request failed!');
  console.log(`   Error: ${error.message}`);
  console.log('\n   Make sure the backend server is running on http://localhost:4000');
}
