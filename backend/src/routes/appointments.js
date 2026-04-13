import express from 'express';
import nodemailer from 'nodemailer';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Email configuration (update with actual credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Book appointment with doctor and time slot
router.post('/book', requireAuth, (req, res) => {
  try {
    const { parentId, childId, doctorId, timeSlotId, reason } = req.body;
    const userId = req.user.id;

    if (!parentId || !childId || !doctorId || !timeSlotId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify parent-child relationship
    const parent = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(parentId, 'parent');
    const child = db.prepare('SELECT * FROM users WHERE id = ? AND parent_id = ? AND role = ?').get(childId, parentId, 'child');

    if (!parent || !child) {
      return res.status(404).json({ error: 'Parent or child not found' });
    }

    // Verify user is the parent
    if (Number(userId) !== Number(parentId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify doctor and time slot exist
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    const timeSlot = db.prepare('SELECT * FROM time_slots WHERE id = ? AND doctor_id = ? AND available = 1').get(timeSlotId, doctorId);

    if (!doctor || !timeSlot) {
      return res.status(404).json({ error: 'Doctor or time slot not available' });
    }

    // Check if this child already has an appointment for the same time slot
    const existingAppointment = db.prepare(`
      SELECT id FROM appointments_updated 
      WHERE child_id = ? AND time_slot_id = ? AND status IN ('booked', 'confirmed', 'pending')
    `).get(childId, timeSlotId);

    if (existingAppointment) {
      return res.status(409).json({ error: 'Child already has an appointment for this time slot' });
    }

    // Create appointment with "booked" status (awaiting doctor confirmation)
    const appointment = db.prepare(`
      INSERT INTO appointments_updated (parent_id, child_id, child_name, doctor_id, time_slot_id, reason, appointment_date, appointment_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(parentId, childId, child.name, doctorId, timeSlotId, reason || null, timeSlot.date, timeSlot.time, 'booked');

    // Mark time slot as unavailable
    db.prepare('UPDATE time_slots SET available = 0 WHERE id = ?').run(timeSlotId);

    // Send email to doctor
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@mentalkids.com',
      to: doctor.email,
      subject: `📅 New Appointment Booking - ${child.name} (Awaiting Confirmation)`,
      html: `
        <h2>✅ New Appointment Booking Request</h2>
        <p><strong>Status:</strong> <span style="background:#f59e0b; padding:5px 10px; border-radius:4px; color:white;">AWAITING YOUR CONFIRMATION</span></p>
        <p><strong>Child:</strong> ${child.name}</p>
        <p><strong>Parent:</strong> ${parent.name}</p>
        <p><strong>Parent Email:</strong> ${parent.email}</p>
        <p><strong>Date:</strong> ${timeSlot.date}</p>
        <p><strong>Time:</strong> ${timeSlot.time}</p>
        <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
        <p><strong>Appointment ID:</strong> ${appointment.lastInsertRowid}</p>
        <hr>
        <p><strong>ACTION REQUIRED:</strong> Please confirm or decline this appointment request.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        if (error.response) {
          console.error('Email response:', error.response);
        }
        // Still return success since appointment was created
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({
      id: appointment.lastInsertRowid,
      parentId: Number(parentId),
      childId: Number(childId),
      employeeId: Number(doctorId),
      doctorName: doctor.name,
      appointmentDate: timeSlot.date,
      appointmentTime: timeSlot.time,
      reason: reason || null,
      status: 'booked',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointments for parent
router.get('/parent/:parentId', requireAuth, (req, res) => {
  try {
    const { parentId } = req.params;
    const userId = req.user.id;

    if (Number(userId) !== Number(parentId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const appointments = db.prepare(`
      SELECT a.*, COALESCE(c.name, a.child_name, 'Deleted child') as child_name, d.name as doctor_name, d.specialization
      FROM appointments_updated a
      LEFT JOIN users c ON c.id = a.child_id
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.parent_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all(parentId);

    res.json({
      items: appointments.map((apt) => ({
        id: apt.id,
        parentId: apt.parent_id,
        childId: apt.child_id,
        childName: apt.child_name,
        doctorId: apt.doctor_id,
        doctorName: apt.doctor_name,
        doctorSpecialization: apt.specialization,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        reason: apt.reason,
        status: apt.status,
        createdAt: apt.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all appointments (admin only)
router.get('/admin/all', requireAuth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const appointments = db.prepare(`
      SELECT a.*, COALESCE(c.name, a.child_name, 'Deleted child') as child_name, p.name as parent_name, p.email as parent_email, d.name as doctor_name, d.email as doctor_email
      FROM appointments_updated a
      LEFT JOIN users c ON c.id = a.child_id
      JOIN users p ON p.id = a.parent_id
      JOIN doctors d ON d.id = a.doctor_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all();

    res.json({
      items: appointments.map((apt) => ({
        id: apt.id,
        childName: apt.child_name,
        parentName: apt.parent_name,
        parentEmail: apt.parent_email,
        doctorName: apt.doctor_name,
        doctorEmail: apt.doctor_email,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        reason: apt.reason,
        status: apt.status,
        createdAt: apt.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel appointment
router.delete('/:appointmentId', requireAuth, (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = db.prepare('SELECT * FROM appointments_updated WHERE id = ?').get(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (Number(userId) !== Number(appointment.parent_id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update appointment status and make time slot available again
    db.prepare('UPDATE appointments_updated SET status = ? WHERE id = ?').run('cancelled', appointmentId);
    db.prepare('UPDATE time_slots SET available = 1 WHERE id = ?').run(appointment.time_slot_id);

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Doctor confirms/rejects appointment
router.put('/:appointmentId/confirm', requireAuth, (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['confirmed', 'rejected', 'postponed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: confirmed, rejected, or postponed' });
    }

    const appointment = db.prepare('SELECT * FROM appointments_updated WHERE id = ?').get(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify doctor has permission (must be the assigned doctor)
    if (req.user.role !== 'admin' && Number(appointment.doctor_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized - You are not assigned to this appointment' });
    }

    // Log status change
    db.prepare(`
      INSERT INTO appointment_status_logs (appointment_id, old_status, new_status, changed_by, changed_by_id, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(appointmentId, appointment.status, status, 'doctor', req.user.id, reason || null);

    // Update appointment
    if (status === 'confirmed') {
      // Mark time slot as unavailable
      db.prepare('UPDATE time_slots SET available = 0 WHERE id = ?').run(appointment.time_slot_id);
      db.prepare(`
        UPDATE appointments_updated 
        SET status = ?, status_changed_at = datetime('now'), doctor_confirmed_at = datetime('now')
        WHERE id = ?
      `).run(status, appointmentId);
    } else if (status === 'rejected') {
      // Release time slot
      db.prepare('UPDATE time_slots SET available = 1 WHERE id = ?').run(appointment.time_slot_id);
      db.prepare(`
        UPDATE appointments_updated 
        SET status = ?, status_changed_at = datetime('now')
        WHERE id = ?
      `).run(status, appointmentId);
    } else if (status === 'postponed') {
      db.prepare(`
        UPDATE appointments_updated 
        SET status = ?, status_changed_at = datetime('now')
        WHERE id = ?
      `).run(status, appointmentId);
    }

    const updatedAppointment = db.prepare('SELECT * FROM appointments_updated WHERE id = ?').get(appointmentId);

    // TODO: Send email notification to parent
    // const parent = db.prepare('SELECT * FROM users WHERE id = ?').get(appointment.parent_id);
    // sendEmailNotification(parent.email, status, reason);

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        doctor_confirmed_at: updatedAppointment.doctor_confirmed_at,
        status_changed_at: updatedAppointment.status_changed_at,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoint (old appointments table)
router.post('/', (req, res) => {
  const { parentId, childId, preferredDate, preferredTime, reason } = req.body || {};
  if (!parentId || !childId) {
    return res.status(400).json({ message: 'parentId and childId are required' });
  }

  const parent = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(parentId, 'parent');
  const child = db.prepare('SELECT id, parent_id FROM users WHERE id = ? AND role = ?').get(childId, 'child');
  if (!parent || !child) {
    return res.status(404).json({ message: 'Parent or child not found' });
  }

  if (Number(child.parent_id) !== Number(parentId)) {
    return res.status(400).json({ message: 'Child is not linked to this parent' });
  }

  const info = db.prepare(`
    INSERT INTO appointments (parent_id, child_id, preferred_date, preferred_time, reason, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(parentId, childId, preferredDate || null, preferredTime || null, reason || null);

  return res.status(201).json({
    appointment: {
      id: info.lastInsertRowid,
      parentId: Number(parentId),
      childId: Number(childId),
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      reason: reason || null,
      status: 'pending',
    },
  });
});

export default router;

