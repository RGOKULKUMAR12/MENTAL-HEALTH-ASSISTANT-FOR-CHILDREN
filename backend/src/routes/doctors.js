import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors
router.get('/doctors', (req, res) => {
  try {
    const doctors = db.prepare(`
      SELECT d.*, 
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
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
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
    const { userId, role } = req.user;
    if (role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { name, specialization, email, phone, bio } = req.body;
    if (!name || !specialization || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare(`
      INSERT INTO doctors (name, specialization, email, phone, bio, available)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, specialization, email, phone || null, bio || null, 1);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      specialization,
      email,
      phone,
      bio,
      available: 1,
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
    const { name, specialization, email, phone, bio, available } = req.body;

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    db.prepare(`
      UPDATE doctors 
      SET name = ?, specialization = ?, email = ?, phone = ?, bio = ?, available = ?
      WHERE id = ?
    `).run(
      name || doctor.name,
      specialization || doctor.specialization,
      email || doctor.email,
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
    db.prepare('UPDATE doctors SET available = 0 WHERE id = ?').run(doctorId);
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add time slot
router.post('/slots', requireAuth, (req, res) => {
  try {
    const { userId, role } = req.user;
    if (role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { doctorId, date, time, durationMinutes } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
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
    const { userId, role } = req.user;
    if (role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const { slotId } = req.params;
    db.prepare('UPDATE time_slots SET available = 0 WHERE id = ?').run(slotId);
    res.json({ success: true, message: 'Time slot deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
