// ============================================================
//  auth.js — JWT Middleware
//  Protects Endpoints that require the user to be logged in
// ============================================================

const jwt    = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'trendora_secret_key_2026';


// ── Protect regular user routes ────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}


// ── Protect admin-only routes ──────────────────────────────
function adminMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Admin access only' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}


module.exports = { authMiddleware, adminMiddleware, SECRET };
