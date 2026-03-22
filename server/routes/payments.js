const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const db      = require('../db');

router.post('/:memberId', auth, (req, res) => {
  const result = db.markPaid(req.params.memberId, req.trainerId);
  if (!result) return res.status(404).json({ error: 'Member not found.' });
  res.json(result);
});

module.exports = router;
