import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const SECRET = process.env.JWT_SECRET || 'opease-dev-secret-2024';

export function signPortalToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

export function authenticatePortal(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, SECRET);
    if (!decoded.portalUser) {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    req.portalUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (!req.portalUser?.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}
