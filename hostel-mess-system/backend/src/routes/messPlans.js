const express = require('express');

const MessPlan = require('../models/MessPlan');

const router = express.Router();

router.get('/', async (req, res) => {
  const plans = await MessPlan.find().sort({ createdAt: -1 });
  res.json(plans);
});

router.post('/', async (req, res) => {
  const { planName, cost, meals } = req.body || {};

  if (!planName || cost === undefined) {
    return res.status(400).json({ error: 'planName and cost are required' });
  }

  const plan = await MessPlan.create({
    planName: String(planName).trim(),
    cost: Number(cost),
    meals: Array.isArray(meals) ? meals : (meals ? [String(meals)] : [])
  });

  res.status(201).json(plan);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { planName, cost, meals } = req.body || {};

  const update = {
    ...(planName !== undefined ? { planName: String(planName).trim() } : {}),
    ...(cost !== undefined ? { cost: Number(cost) } : {}),
    ...(meals !== undefined
      ? { meals: Array.isArray(meals) ? meals : (meals ? [String(meals)] : []) }
      : {})
  };

  const plan = await MessPlan.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!plan) return res.status(404).json({ error: 'Mess plan not found' });
  res.json(plan);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await MessPlan.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: 'Mess plan not found' });
  res.json({ ok: true });
});

module.exports = router;

