const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const db      = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    res.json(await db.getMembers(req.trainerId, { search, status }));
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const member = await db.getMemberById(req.params.id, req.trainerId);
    if (!member) return res.status(404).json({ error: 'Member not found.' });
    res.json(member);
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, plan, fee_amount, joining_date } = req.body;
    if (!name || !phone || !plan || !fee_amount || !joining_date)
      return res.status(400).json({ error: 'All fields are required.' });
    if (!['monthly','quarterly','yearly'].includes(plan))
      return res.status(400).json({ error: 'Plan must be monthly, quarterly, or yearly.' });
    res.status(201).json(await db.createMember(req.trainerId, req.body));
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await db.updateMember(req.params.id, req.trainerId, req.body);
    if (!updated) return res.status(404).json({ error: 'Member not found.' });
    res.json(updated);
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const ok = await db.deleteMember(req.params.id, req.trainerId);
    if (!ok) return res.status(404).json({ error: 'Member not found.' });
    res.json({ message: 'Member removed successfully.' });
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
