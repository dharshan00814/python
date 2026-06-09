const mongoose = require('mongoose');

const MessPlanSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true, trim: true, unique: true },
    cost: { type: Number, required: true, min: 0 },
    meals: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MessPlan', MessPlanSchema);

