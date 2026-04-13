import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { RECOMMENDATIONS } from '../utils/risk.js';

const router = express.Router();

function canAccessParent(req, parentId) {
  return req.user.role === 'admin' || (req.user.role === 'parent' && Number(req.user.id) === Number(parentId));
}

router.get('/:parentId/children', (req, res) => {
  const { parentId } = req.params;
  if (!canAccessParent(req, parentId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const children = db
    .prepare(`
      SELECT c.id, c.name, c.username, c.parent_id, c.created_at
      FROM users c
      WHERE c.role = 'child' AND c.parent_id = ?
      ORDER BY c.created_at DESC
    `)
    .all(parentId);

  return res.json({
    items: children.map((child) => ({
      id: child.id,
      name: child.name,
      username: child.username,
      parentId: child.parent_id,
      createdAt: child.created_at,
    })),
  });
});

router.post('/:parentId/children', async (req, res) => {
  const { parentId } = req.params;
  const { name, username, password } = req.body || {};

  if (!canAccessParent(req, parentId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!name || !username || !password) {
    return res.status(400).json({ message: 'name, username, and password are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ message: 'Password must be at least 4 characters' });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(normalizedUsername);
  if (existing) {
    return res.status(409).json({ message: 'User ID already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const info = db
    .prepare('INSERT INTO users (role, name, username, password_hash, parent_id) VALUES (?, ?, ?, ?, ?)')
    .run('child', name.trim(), normalizedUsername, passwordHash, parentId);

  const child = db
    .prepare('SELECT id, role, name, username, parent_id, created_at FROM users WHERE id = ?')
    .get(info.lastInsertRowid);

  return res.status(201).json({
    child: {
      id: child.id,
      role: child.role,
      name: child.name,
      username: child.username,
      parentId: child.parent_id,
      createdAt: child.created_at,
    },
  });
});

router.delete('/:parentId/children/:childId', (req, res) => {
  const { parentId, childId } = req.params;
  if (!canAccessParent(req, parentId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const child = db
    .prepare('SELECT id FROM users WHERE id = ? AND role = ? AND parent_id = ?')
    .get(childId, 'child', parentId);
  if (!child) {
    return res.status(404).json({ message: 'Child not found' });
  }

  const childName = db.prepare('SELECT name FROM users WHERE id = ?').get(childId)?.name || 'Deleted child';
  db.prepare(`
    UPDATE appointments_updated
    SET child_name = ?, child_id = NULL
    WHERE child_id = ?
  `).run(childName, childId);
  db.prepare(`
    UPDATE appointments
    SET child_name = ?, child_id = NULL
    WHERE child_id = ?
  `).run(childName, childId);
  db.prepare('DELETE FROM assessments WHERE child_id = ?').run(childId);
  db.prepare('DELETE FROM alerts WHERE child_id = ?').run(childId);
  db.prepare('DELETE FROM users WHERE id = ?').run(childId);

  return res.status(204).send();
});

router.get('/:parentId/dashboard', (req, res) => {
  const { parentId } = req.params;
  if (!canAccessParent(req, parentId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const children = db
    .prepare(`
      SELECT c.id, c.name, c.username
      FROM users c
      WHERE c.role = 'child' AND c.parent_id = ?
      ORDER BY c.created_at DESC
    `)
    .all(parentId);

  const getLatestAssessment = db.prepare(`
    SELECT id, avg_score, risk_level, recommendation_json, created_at
    FROM assessments
    WHERE child_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `);

  const items = children.map((child) => {
    const latest = getLatestAssessment.get(child.id);
    return {
      id: child.id,
      name: child.name,
      username: child.username,
      latestAssessment: latest
        ? {
            id: latest.id,
            avgScore: latest.avg_score,
            riskLevel: latest.risk_level,
            recommendation: JSON.parse(latest.recommendation_json),
            date: latest.created_at.slice(0, 10),
          }
        : {
            avgScore: null,
            riskLevel: 'low',
            recommendation: RECOMMENDATIONS.low,
            date: null,
          },
    };
  });

  return res.json({ items });
});

export default router;
