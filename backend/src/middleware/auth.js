import jwt from 'jsonwebtoken';

function getSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me';
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, parentId: user.parent_id || null },
    getSecret(),
    { expiresIn: '7d' },
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' });
  }
  try {
    req.user = jwt.verify(token, getSecret());
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
