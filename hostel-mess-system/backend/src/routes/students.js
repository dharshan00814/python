const express = require('express');

const Student = require('../models/Student');
const MessPlan = require('../models/MessPlan');

const router = express.Router();

router.get('/', async (req, res) => {
  const students = await Student.find().populate('messPlan').sort({ createdAt: -1 });
  res.json(students);
});

router.post('/', async (req, res) => {
  const { name, rollNo, roomNo, messPlan } = req.body || {};

  if (!name || !rollNo) return res.status(400).json({ error: 'name and rollNo are required' });

  const student = await Student.create({
    name: String(name).trim(),
    rollNo: String(rollNo).trim(),
    roomNo: roomNo ? String(roomNo).trim() : '',
    messPlan: messPlan || null
  });

  const populated = await student.populate('messPlan');
  res.status(201).json(populated);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, rollNo, roomNo, messPlan } = req.body || {};

  const update = {
    ...(name !== undefined ? { name: String(name).trim() } : {}),
    ...(rollNo !== undefined ? { rollNo: String(rollNo).trim() } : {}),
    ...(roomNo !== undefined ? { roomNo: String(roomNo).trim() } : {}),
    ...(messPlan !== undefined ? { messPlan: messPlan || null } : {})
  };

  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No fields provided' });

  const student = await Student.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const populated = await student.populate('messPlan');
  res.json(populated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await Student.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: 'Student not found' });
  res.json({ ok: true });
});

module.exports = router;

