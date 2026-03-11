import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken } from '../middleware/auth.js';

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

export default router;
