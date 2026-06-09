const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true, unique: true },
    roomNo: { type: String, default: '' },
    messPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MessPlan', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);

