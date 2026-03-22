const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const db      = require('../db');

router.get('/', auth, (req, res) => {
  const { search, status } = req.query;
  res.json(db.getMembers(req.trainerId, { search, status }));
});

router.get('/:id', auth, (req, res) => {
  const member = db.getMemberById(req.params.id, req.trainerId);
  if (!member) return res.status(404).json({ error: 'Member not found.' });
  res.json(member);
});

router.post('/', auth, (req, res) => {
  const { name, phone, plan, fee_amount, joining_date } = req.body;
  if (!name || !phone || !plan || !fee_amount || !joining_date)
    return res.status(400).json({ error: 'All fields are required.' });
  if (!['monthly','quarterly','yearly'].includes(plan))
    return res.status(400).json({ error: 'Plan must be monthly, quarterly, or yearly.' });
  res.status(201).json(db.createMember(req.trainerId, req.body));
});

router.put('/:id', auth, (req, res) => {
  const updated = db.updateMember(req.params.id, req.trainerId, req.body);
  if (!updated) return res.status(404).json({ error: 'Member not found.' });
  res.json(updated);
});

router.delete('/:id', auth, (req, res) => {
  const ok = db.deleteMember(req.params.id, req.trainerId);
  if (!ok) return res.status(404).json({ error: 'Member not found.' });
  res.json({ message: 'Member removed successfully.' });
});

module.exports = router;
