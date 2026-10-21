const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  clubName: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  category: {
    type: String,
    enum: ["Academic", "Sports", "Arts", "Service", "Technology", "Other"],
    default: "Other"
  },
  adviser: { type: String, default: "", trim: true },
  maxMembers: { type: Number, min: 1, default: 30 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

clubSchema.index({ clubName: 1 }, { unique: true });

module.exports = mongoose.model("Club", clubSchema);
