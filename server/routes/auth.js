const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { findTrainerByEmail } = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const trainer = await findTrainerByEmail(email);
    if (!trainer) return res.status(401).json({ error: 'Invalid email or password.' });
    const isValid = bcrypt.compareSync(password, trainer.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ id: trainer._id, email: trainer.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, name: trainer.name, email: trainer.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
