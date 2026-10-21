const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  yearLevel: {
    type: String,
    required: true,
    enum: ["First Year", "Second Year", "Third Year", "Fourth Year", "Other"]
  },
  section: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
  },
  contactNumber: { type: String, default: "", trim: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  registrationDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

registrationSchema.index({ studentId: 1, clubId: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
