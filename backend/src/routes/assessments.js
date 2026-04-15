import express from 'express';
import { db } from '../db.js';
import { calculateRisk } from '../utils/risk.js';
import { inferConditionsFromResponses } from '../utils/conditionDetection.js';

const router = express.Router();

function canAccessChild(reqUser, childRow) {
  if (!reqUser || !childRow) return false;
  if (reqUser.role === 'admin') return true;
  if (reqUser.role === 'child') return Number(reqUser.id) === Number(childRow.id);
  if (reqUser.role === 'parent') return Number(reqUser.id) === Number(childRow.parent_id);
  return false;
}

router.post('/children/:childId/assessments', (req, res) => {
  const { childId } = req.params;
  const { responses, identifiedConditions, conditionsJson } = req.body || {};

  const child = db
    .prepare('SELECT id, parent_id FROM users WHERE id = ? AND role = ?')
    .get(childId, 'child');
  if (!child) {
    return res.status(404).json({ message: 'Child not found' });
  }
  if (!canAccessChild(req.user, child)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!responses || typeof responses !== 'object') {
    return res.status(400).json({ message: 'responses object is required' });
  }

  const { riskLevel, avgScore, recommendation } = calculateRisk(responses);
  const inferredConditions = Array.isArray(identifiedConditions)
    ? identifiedConditions
    : Array.isArray(conditionsJson)
      ? conditionsJson
      : inferConditionsFromResponses(responses);
  const info = db
    .prepare(`
      INSERT INTO assessments (child_id, responses_json, avg_score, risk_level, recommendation_json, identified_conditions, conditions_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      childId,
      JSON.stringify(responses),
      avgScore,
      riskLevel,
      JSON.stringify(recommendation),
      JSON.stringify(inferredConditions),
      JSON.stringify(inferredConditions),
    );

  if (riskLevel !== 'low') {
    const severityMessage = riskLevel === 'moderate'
      ? 'Mood pattern change detected. Consider checking in with your child.'
      : 'High concern pattern detected. Consider counselor support.';
    db.prepare(`
      INSERT INTO alerts (parent_id, child_id, severity, message)
      VALUES (?, ?, ?, ?)
    `).run(child.parent_id, childId, riskLevel, severityMessage);
  }

  return res.status(201).json({
    assessment: {
      id: info.lastInsertRowid,
      childId: Number(childId),
      avgScore,
      riskLevel,
      recommendation,
    },
  });
});

router.get('/children/:childId/assessments', (req, res) => {
  const { childId } = req.params;
  const child = db
    .prepare('SELECT id, parent_id FROM users WHERE id = ? AND role = ?')
    .get(childId, 'child');
  if (!child) {
    return res.status(404).json({ message: 'Child not found' });
  }
  if (!canAccessChild(req.user, child)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const rows = db.prepare(`
    SELECT id, responses_json, avg_score, risk_level, recommendation_json, created_at
    FROM assessments
    WHERE child_id = ?
    ORDER BY created_at DESC, id DESC
  `).all(childId);

  return res.json({
    items: rows.map((row) => ({
      id: row.id,
      responses: JSON.parse(row.responses_json),
      avgScore: row.avg_score,
      riskLevel: row.risk_level,
      recommendation: JSON.parse(row.recommendation_json),
      date: row.created_at.slice(0, 10),
    })),
  });
});

export default router;
