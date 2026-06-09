 const express = require('express');

const Billing = require('../models/Billing');
const Student = require('../models/Student');

const router = express.Router();

// List all billing records (admin)
router.get('/', async (req, res) => {
  const items = await Billing.find()
    .populate('studentId', 'name rollNo roomNo')
    .sort({ date: -1, createdAt: -1 });
  res.json(items);
});

// Student billing history
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const exists = await Student.findById(studentId);
  if (!exists) return res.status(404).json({ error: 'Student not found' });

  const items = await Billing.find({ studentId }).sort({ date: -1, createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  const { studentId, amount, date } = req.body || {};

  if (!studentId || amount === undefined || !date) {
    return res.status(400).json({ error: 'studentId, amount, and date are required' });
  }

  const billingDate = new Date(date);
  if (Number.isNaN(billingDate.getTime())) {
    return res.status(400).json({ error: 'date must be a valid date' });
  }

  const item = await Billing.create({
    studentId,
    amount: Number(amount),
    date: billingDate
  });

  const populated = await item.populate('studentId', 'name rollNo roomNo');
  res.status(201).json(populated);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { studentId, amount, date } = req.body || {};

  const update = {};
  if (studentId !== undefined) update.studentId = studentId;
  if (amount !== undefined) update.amount = Number(amount);
  if (date !== undefined) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'date must be a valid date' });
    update.date = d;
  }

  const item = await Billing.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ error: 'Billing record not found' });

  const populated = await item.populate('studentId', 'name rollNo roomNo');
  res.json(populated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await Billing.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: 'Billing record not found' });
  res.json({ ok: true });
});

module.exports = router;

