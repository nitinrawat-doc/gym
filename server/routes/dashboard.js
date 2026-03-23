const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const db      = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    res.json(await db.getDashboardStats(req.trainerId));
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
