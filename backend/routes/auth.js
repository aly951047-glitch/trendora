// ============================================================
//  routes/auth.js
//  Represents: User.Save()  → register
//              User.login() → login
//              User.logout()→ logout
//              Admin login
// ============================================================

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { users, admins, nextId } = require('../db');
const { SECRET } = require('../middleware/auth');

const router = express.Router();


// ── POST /api/auth/register ────────────────────────────────
// Represents: User.Save() from the UML
// Creates a new User Object and saves it in the users array
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (users.find(u => u.email === email))
      return res.status(400).json({ error: 'Email already registered' });

    // Encrypt the password before saving (UML: passwordHash)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new User Object (matches UML attributes)
    const user = {
      userId:       nextId('user'),   // int userId
      name,                           // String name
      email,                          // String email
      passwordHash                    // String passwordHash
    };

    users.push(user); // User.Save() → save to the "database"

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.userId, name: user.name, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { userId: user.userId, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── POST /api/auth/login ───────────────────────────────────
// Represents: User.login() from the UML
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Search for the User object by email
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Compare the password with the stored passwordHash
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign(
      { userId: user.userId, name: user.name, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { userId: user.userId, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── POST /api/auth/admin/login ─────────────────────────────
// Represents: Admin class from the UML
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Search for the Admin object by email
    const admin = admins.find(a => a.email === email);
    if (!admin) return res.status(400).json({ error: 'Admin not found' });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign(
      { adminId: admin.adminId, name: admin.name, isAdmin: true },
      SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, admin: { adminId: admin.adminId, name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
