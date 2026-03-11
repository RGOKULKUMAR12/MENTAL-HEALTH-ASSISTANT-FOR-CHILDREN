import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/analytics', (req, res) => {
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

  const normalized = [
    { category: 'low', label: 'Low Risk', color: '#22c55e' },
    { category: 'moderate', label: 'Moderate', color: '#f59e0b' },
    { category: 'high', label: 'High Risk', color: '#ef4444' },
  ].map((item) => ({
    category: item.label,
    key: item.category,
    color: item.color,
    count: riskCounts.find((r) => r.category === item.category)?.count || 0,
  }));

  return res.json({
    totalParticipants: totalParticipantsRow.count || 0,
    assessmentsThisMonth: assessmentsThisMonthRow.count || 0,
    riskDistribution: normalized,
  });
});

export default router;
