import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Delete user endpoint
router.delete('/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Check for related records before deletion
    if (user.role === 'parent') {
      const childCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE parent_id = ?').get(userId);
      if (childCount.count > 0) {
        return res.status(409).json({ 
          error: `Cannot delete parent with ${childCount.count} child(ren). Please delete children first.` 
        });
      }

      const appointmentCount = db.prepare('SELECT COUNT(*) as count FROM appointments_updated WHERE parent_id = ?').get(userId);
      if (appointmentCount.count > 0) {
        return res.status(409).json({ 
          error: `Cannot delete parent with ${appointmentCount.count} appointment(s). Please cancel appointments first.` 
        });
      }
    }

    if (user.role === 'child') {
      const appointmentCount = db.prepare('SELECT COUNT(*) as count FROM appointments_updated WHERE child_id = ?').get(userId);
      const assessmentCount = db.prepare('SELECT COUNT(*) as count FROM assessments WHERE child_id = ?').get(userId);
      const childName = user.name;

      if (appointmentCount.count > 0) {
        db.prepare(`
          UPDATE appointments_updated
          SET child_name = ?, child_id = NULL
          WHERE child_id = ?
        `).run(childName, userId);
        db.prepare(`
          UPDATE appointments
          SET child_name = ?, child_id = NULL
          WHERE child_id = ?
        `).run(childName, userId);
      }

      if (assessmentCount.count > 0) {
        db.prepare('DELETE FROM assessments WHERE child_id = ?').run(userId);
      }
    }

    // Delete user after dependent records are preserved or removed
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', (req, res) => {
  try {
    const riskCounts = db.prepare(`
      SELECT risk_level as category, COUNT(*) as count
      FROM (
        SELECT a1.*
        FROM assessments a1
        JOIN (
          SELECT child_id, MAX(id) AS max_id
          FROM assessments
          GROUP BY child_id
        ) latest ON latest.max_id = a1.id
      )
      GROUP BY risk_level
    `).all();

    const totalParticipantsRow = db
      .prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'child'`)
      .get();

    const assessmentsThisMonthRow = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM assessments
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
      `)
      .get();

    const doctorsCountRow = db
      .prepare(`SELECT COUNT(*) AS count FROM doctors`)
      .get();

    const parentCountRow = db
      .prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'parent'`)
      .get();

    const appointmentsCountRow = db
      .prepare(`SELECT COUNT(*) AS count FROM appointments_updated`)
      .get();

    const appointmentsByStatusRow = db
      .prepare(`
        SELECT status, COUNT(*) as count FROM appointments_updated GROUP BY status
      `)
      .all();

    const normalized = [
      { category: 'low', label: 'Low Risk', color: '#22c55e', description: 'Children with low mental health risk' },
      { category: 'moderate', label: 'Moderate Risk', color: '#f59e0b', description: 'Requires monitoring and support' },
      { category: 'high', label: 'High Risk', color: '#ef4444', description: 'Needs immediate professional attention' },
    ].map((item) => ({
      category: item.label,
      key: item.category,
      color: item.color,
      description: item.description,
      count: riskCounts.find((r) => r.category === item.category)?.count || 0,
    }));

    const appointmentsByStatus = {
      booked: appointmentsByStatusRow.find((s) => s.status === 'booked')?.count || 0,
      confirmed: appointmentsByStatusRow.find((s) => s.status === 'confirmed')?.count || 0,
      cancelled: appointmentsByStatusRow.find((s) => s.status === 'cancelled')?.count || 0,
      postponed: appointmentsByStatusRow.find((s) => s.status === 'postponed')?.count || 0,
      rejected: appointmentsByStatusRow.find((s) => s.status === 'rejected')?.count || 0,
    };

    // Get disease-wise analytics
    const allAssessments = db.prepare(`
      SELECT identified_conditions FROM assessments WHERE identified_conditions IS NOT NULL
    `).all();

    const diseaseStats = {};
    const DISEASES = {
      anxiety: 'Anxiety',
      depression: 'Depression',
      adhd: 'ADHD',
      sleep_disorder: 'Sleep Issues',
      low_self_esteem: 'Low Self-Esteem',
      social_anxiety: 'Social Anxiety',
      behavioral_issues: 'Behavioral Issues',
      social_isolation: 'Social Isolation'
    };

    // Initialize disease counts
    Object.keys(DISEASES).forEach(key => {
      diseaseStats[key] = { name: DISEASES[key], count: 0, percentage: 0 };
    });

    // Parse and count conditions
    allAssessments.forEach(assessment => {
      try {
        const conditions = JSON.parse(assessment.identified_conditions || '[]');
        if (Array.isArray(conditions)) {
          conditions.forEach(condition => {
            const key = condition.key || condition;
            if (diseaseStats[key]) {
              diseaseStats[key].count++;
            }
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Calculate percentages
    const totalConditionOccurrences = Object.values(diseaseStats).reduce((sum, d) => sum + d.count, 0);
    Object.keys(diseaseStats).forEach(key => {
      diseaseStats[key].percentage = totalConditionOccurrences > 0 
        ? Math.round((diseaseStats[key].count / totalConditionOccurrences) * 100) 
        : 0;
    });

    res.json({
      totalParticipants: totalParticipantsRow.count || 0,
      totalParents: parentCountRow.count || 0,
      totalDoctors: doctorsCountRow.count || 0,
      assessmentsThisMonth: assessmentsThisMonthRow.count || 0,
      totalAppointments: appointmentsCountRow.count || 0,
      riskDistribution: normalized,
      appointmentsByStatus,
      diseaseWiseBreakdown: diseaseStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status (doctor confirms/rejects)
router.put('/appointments/:appointmentId/status', (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['booked', 'confirmed', 'cancelled', 'postponed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = db.prepare('SELECT * FROM appointments_updated WHERE id = ?').get(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Log status change
    db.prepare(`
      INSERT INTO appointment_status_logs (appointment_id, old_status, new_status, changed_by, changed_by_id, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(appointmentId, appointment.status, status, 'doctor', req.user.id, reason || null);

    // Update appointment
    db.prepare(`
      UPDATE appointments_updated 
      SET status = ?, status_changed_at = datetime('now'), doctor_confirmed_at = datetime('now')
      WHERE id = ?
    `).run(status, appointmentId);

    // Send email notification based on status
    const updatedAppointment = db.prepare('SELECT * FROM appointments_updated WHERE id = ?').get(appointmentId);
    const parent = db.prepare('SELECT * FROM users WHERE id = ?').get(appointment.parent_id);
    const child = db.prepare('SELECT * FROM users WHERE id = ?').get(appointment.child_id);

    // Email would be sent here (handled by transporter in appointments.js)
    const emailStatus = {
      booked: 'Appointment Booked',
      confirmed: 'Appointment Confirmed ✓',
      cancelled: 'Appointment Cancelled',
      postponed: 'Appointment Postponed',
      rejected: 'Appointment Request Declined'
    };

    res.json({
      success: true,
      appointment: updatedAppointment,
      message: `Appointment ${emailStatus[status]}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
