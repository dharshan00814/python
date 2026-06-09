const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return res.status(500).json({ error: 'Admin credentials not configured' });
  }

  if (String(username).trim() !== adminUsername || String(password).trim() !== adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin', username: adminUsername }, process.env.JWT_SECRET, {
    expiresIn: '12h'
  });

  return res.json({ token });
});

module.exports = router;

