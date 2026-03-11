import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { parentId } = req.query;
  if (!parentId) {
    return res.status(400).json({ message: 'parentId query param is required' });
  }

  if (!(req.user.role === 'admin' || (req.user.role === 'parent' && Number(req.user.id) === Number(parentId)))) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const rows = db.prepare(`
    SELECT a.id, a.parent_id, a.child_id, a.severity, a.message, a.created_at, c.name as child_name
    FROM alerts a
    LEFT JOIN users c ON c.id = a.child_id
    WHERE a.parent_id = ?
    ORDER BY a.created_at DESC, a.id DESC
  `).all(parentId);

  return res.json({
    items: rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      childId: row.child_id,
      childName: row.child_name || null,
      severity: row.severity,
      message: row.message,
      date: row.created_at.slice(0, 10),
    })),
  });
});

export default router;
