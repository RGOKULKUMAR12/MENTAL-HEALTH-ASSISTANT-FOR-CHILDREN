import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function generateTemporaryPassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let index = 0; index < length; index += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

// Get all doctors
router.get('/doctors', (req, res) => {
  try {
    const doctors = db.prepare(`
      SELECT d.id, d.name, d.specialization, d.email, d.clinic_address, d.phone, d.bio, d.available, d.created_at,
        (SELECT COUNT(*) FROM time_slots WHERE doctor_id = d.id AND available = 1) as available_slots
      FROM doctors d
      WHERE d.available = 1
      ORDER BY d.name
    `).all();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by ID with available time slots
router.get('/doctors/:doctorId/slots', (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = db.prepare('SELECT id, name, specialization, email, clinic_address, phone, bio, available, created_at FROM doctors WHERE id = ?').get(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const slots = db.prepare(`
      SELECT * FROM time_slots 
      WHERE doctor_id = ? AND available = 1 AND date >= date('now')
      ORDER BY date ASC, time ASC
    `).all(doctorId);

    res.json({ doctor, slots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all available time slots grouped by doctor
router.get('/slots/available', (req, res) => {
  try {
    const slots = db.prepare(`
      SELECT ts.*, d.name as doctor_name, d.specialization
      FROM time_slots ts
      JOIN doctors d ON ts.doctor_id = d.id
      WHERE ts.available = 1 AND ts.date >= date('now')
      ORDER BY ts.date ASC, ts.time ASC
    `).all();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add new doctor
router.post('/doctors', requireAuth, (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { name, specialization, email, clinicAddress, phone, bio } = req.body;
    if (!name || !specialization || !email || !clinicAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = bcrypt.hashSync(temporaryPassword, 10);
    const doctorEmail = email.trim().toLowerCase();

    const result = db.prepare(`
      INSERT INTO doctors (name, specialization, email, clinic_address, password_hash, must_change_password, phone, bio, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, specialization, doctorEmail, clinicAddress.trim(), passwordHash, 1, phone || null, bio || null, 1);

    const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@mentalkids.com',
      to: doctorEmail,
      subject: 'Your doctor account has been created',
      html: `
        <h2>Welcome to Mindful Kids</h2>
        <p>Your doctor account has been created by the admin.</p>
        <p><strong>Email:</strong> ${doctorEmail}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please log in at <a href="${appBaseUrl}/login">${appBaseUrl}/login</a> and change your password immediately after signing in.</p>
      `,
    };

    emailTransporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Failed to send doctor account email:', error);
      }
    });

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      specialization,
      email: doctorEmail,
      clinicAddress: clinicAddress.trim(),
      phone,
      bio,
      available: 1,
      temporaryPassword,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update doctor
router.put('/doctors/:doctorId', requireAuth, (req, res) => {
  try {
    const { userId, role } = req.user;
    if (role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { doctorId } = req.params;
    const { name, specialization, email, clinicAddress, phone, bio, available } = req.body;

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    db.prepare(`
      UPDATE doctors 
      SET name = ?, specialization = ?, email = ?, clinic_address = ?, phone = ?, bio = ?, available = ?
      WHERE id = ?
    `).run(
      name || doctor.name,
      specialization || doctor.specialization,
      email || doctor.email,
      clinicAddress !== undefined ? clinicAddress : doctor.clinic_address,
      phone !== undefined ? phone : doctor.phone,
      bio !== undefined ? bio : doctor.bio,
      available !== undefined ? available : doctor.available,
      doctorId
    );

    res.json({ success: true, message: 'Doctor updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete doctor
router.delete('/doctors/:doctorId', requireAuth, (req, res) => {
  try {
    const { userId, role } = req.user;
    if (role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { doctorId } = req.params;

    // First delete associated time slots
    db.prepare('DELETE FROM time_slots WHERE doctor_id = ?').run(doctorId);

    // Then delete the doctor
    const result = db.prepare('DELETE FROM doctors WHERE id = ?').run(doctorId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add time slot
router.post('/slots', requireAuth, (req, res) => {
  try {
    const { role, id } = req.user;
    if (!['admin', 'doctor'].includes(role)) return res.status(403).json({ error: 'Unauthorized' });

    const { doctorId, date, time, durationMinutes } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role === 'doctor' && Number(id) !== Number(doctorId)) {
      return res.status(403).json({ error: 'You can only manage your own slots' });
    }

    const result = db.prepare(`
      INSERT INTO time_slots (doctor_id, date, time, duration_minutes, available)
      VALUES (?, ?, ?, ?, ?)
    `).run(doctorId, date, time, durationMinutes || 30, 1);

    res.status(201).json({
      id: result.lastInsertRowid,
      doctorId,
      date,
      time,
      durationMinutes: durationMinutes || 30,
      available: 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete time slot
router.delete('/slots/:slotId', requireAuth, (req, res) => {
  try {
    const { role, id } = req.user;
    if (!['admin', 'doctor'].includes(role)) return res.status(403).json({ error: 'Unauthorized' });

    const { slotId } = req.params;

    if (role === 'doctor') {
      const slot = db.prepare('SELECT doctor_id FROM time_slots WHERE id = ?').get(slotId);
      if (!slot || Number(slot.doctor_id) !== Number(id)) {
        return res.status(403).json({ error: 'You can only delete your own slots' });
      }
    }

    db.prepare('UPDATE time_slots SET available = 0 WHERE id = ?').run(slotId);
    res.json({ success: true, message: 'Time slot deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
