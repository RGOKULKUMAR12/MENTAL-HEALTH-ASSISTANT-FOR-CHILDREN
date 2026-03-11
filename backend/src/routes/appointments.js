import express from 'express';
import { db } from '../db.js';

const router = express.Router();

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

  if (!(req.user.role === 'admin' || (req.user.role === 'parent' && Number(req.user.id) === Number(parentId)))) {
    return res.status(403).json({ message: 'Forbidden' });
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

router.get('/parent/:parentId', (req, res) => {
  const { parentId } = req.params;
  if (!(req.user.role === 'admin' || (req.user.role === 'parent' && Number(req.user.id) === Number(parentId)))) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const rows = db.prepare(`
    SELECT a.id, a.parent_id, a.child_id, a.preferred_date, a.preferred_time, a.reason, a.status, a.created_at, c.name as child_name
    FROM appointments a
    JOIN users c ON c.id = a.child_id
    WHERE a.parent_id = ?
    ORDER BY a.created_at DESC, a.id DESC
  `).all(parentId);

  return res.json({
    items: rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      childId: row.child_id,
      childName: row.child_name,
      preferredDate: row.preferred_date,
      preferredTime: row.preferred_time,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
    })),
  });
});

export default router;
