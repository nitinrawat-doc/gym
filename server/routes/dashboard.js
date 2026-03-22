const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const db      = require('../db');

router.get('/', auth, (req, res) => {
  res.json(db.getDashboardStats(req.trainerId));
});

module.exports = router;
