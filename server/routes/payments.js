const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const db      = require('../db');

router.post('/:memberId', auth, async (req, res) => {
  try {
    const result = await db.markPaid(req.params.memberId, req.trainerId);
    if (!result) return res.status(404).json({ error: 'Member not found.' });
    res.json(result);
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
