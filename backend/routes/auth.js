// ============================================================
//  routes/auth.js
//  يمثل: User.Save() → register
//        User.login() → login
//        User.logout() → logout
//        Admin login
// ============================================================

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { users, admins, nextId } = require('../db');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/register ─────────────────────────────
// يمثل: User.Save() من الـ UML
// ينشئ User Object جديد ويحفظه في الـ users array
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (users.find(u => u.email === email))
      return res.status(400).json({ error: 'Email already registered' });

    // تشفير الباسورد قبل الحفظ (UML: passwordHash)
    const passwordHash = await bcrypt.hash(password, 10);

    // إنشاء User Object (يطابق UML attributes)
    const user = {
      userId:       nextId('user'),   // int userId
      name,                           // String name
      email,                          // String email
      passwordHash                    // String passwordHash
    };

    users.push(user); // User.Save() → حفظ في "قاعدة البيانات"

    // إنشاء JWT Token
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


// ── POST /api/auth/login ────────────────────────────────
// يمثل: User.login() من الـ UML
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم (User object)
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'User not found' });

    // مقارنة الباسورد مع الـ passwordHash
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


// ── POST /api/auth/admin/login ──────────────────────────
// يمثل: Admin class من الـ UML
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن Admin object
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
