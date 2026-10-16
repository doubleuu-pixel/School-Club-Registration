const express = require("express");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");

const router = express.Router();

// GET /api/registrations?search=Juan&clubId=<id>&status=Approved&page=1&limit=10
router.get("/", async (req, res, next) => {
  try {
    const { search, clubId, status } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = {};

    if (clubId) {
      if (!mongoose.isValidObjectId(clubId)) {
        return res.status(400).json({ message: "Invalid clubId" });
      }
      filter.clubId = clubId;
    }
    if (status) {
      if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid registration status" });
      }
      filter.status = status;
    }
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { studentId: { $regex: safeSearch, $options: "i" } },
        { firstName: { $regex: safeSearch, $options: "i" } },
        { lastName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { section: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .populate("clubId", "clubName category status")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Registration.countDocuments(filter)
    ]);

    res.json({
      count: registrations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: registrations
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/registrations/:id
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }
    const registration = await Registration.findById(req.params.id)
      .populate("clubId", "clubName category adviser status")
      .lean();

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    res.json({ data: registration });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
