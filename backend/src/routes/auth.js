import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register-parent', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const info = db
    .prepare('INSERT INTO users (role, name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run('parent', name.trim(), email.trim().toLowerCase(), passwordHash);

  const user = db.prepare('SELECT id, role, name, email, parent_id FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user);
  return res.status(201).json({ token, user });
});

router.post('/login', async (req, res) => {
  const { role, identifier, password } = req.body || {};
  if (!role || !identifier || !password) {
    return res.status(400).json({ message: 'role, identifier, and password are required' });
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  let user;
  if (role === 'child') {
    user = db
      .prepare('SELECT id, role, name, username, parent_id, password_hash FROM users WHERE role = ? AND username = ?')
      .get('child', normalizedIdentifier);
  } else {
    user = db
      .prepare('SELECT id, role, name, email, parent_id, password_hash FROM users WHERE role = ? AND email = ?')
      .get(role, normalizedIdentifier);
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  const responseUser = {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email || null,
    username: user.username || null,
    parentId: user.parent_id || null,
  };
  return res.json({ token, user: responseUser });
});

// Admin: Get all users by role
router.get('/users', requireAuth, (req, res) => {
  const { role } = req.query;

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  let query = 'SELECT id, role, name, email, username, parent_id, created_at FROM users';
  const params = [];

  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }

  try {
    const users = db.prepare(query).all(...params);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Admin: Create parent account
router.post('/admin/create-parent', requireAuth, async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const info = db
      .prepare('INSERT INTO users (role, name, email, password_hash) VALUES (?, ?, ?, ?)')
      .run('parent', name.trim(), email.trim().toLowerCase(), passwordHash);

    const user = db.prepare('SELECT id, role, name, email, created_at FROM users WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ message: 'Parent created successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating parent', error: error.message });
  }
});

// Admin: Delete user
router.delete('/admin/users/:userId', requireAuth, (req, res) => {
  const { userId } = req.params;

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  try {
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;
