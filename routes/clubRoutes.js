const express = require("express");
const mongoose = require("mongoose");
const Club = require("../models/Club");
const Registration = require("../models/Registration");

const router = express.Router();

// GET /api/clubs?search=Science&status=Active&category=Academic
router.get("/", async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { clubName: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { adviser: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const clubs = await Club.find(filter).sort({ clubName: 1 }).lean();
    const counts = await Registration.aggregate([
      { $match: { clubId: { $in: clubs.map((club) => club._id) } } },
      { $group: { _id: "$clubId", registeredMembers: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.registeredMembers]));

    res.json({
      count: clubs.length,
      data: clubs.map((club) => ({
        ...club,
        registeredMembers: countMap.get(String(club._id)) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/clubs/:id
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid club ID" });
    }
    const club = await Club.findById(req.params.id).lean();
    if (!club) return res.status(404).json({ message: "Club not found" });

    const registeredMembers = await Registration.countDocuments({ clubId: club._id });
    res.json({ data: { ...club, registeredMembers } });
  } catch (error) {
    next(error);
  }
});

// GET /api/clubs/:id/registrations?status=Approved&search=Juan
router.get("/:id/registrations", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid club ID" });
    }

    const club = await Club.findById(id).select("_id clubName");
    if (!club) return res.status(404).json({ message: "Club not found" });

    const filter = { clubId: id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const safeSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { studentId: { $regex: safeSearch, $options: "i" } },
        { firstName: { $regex: safeSearch, $options: "i" } },
        { lastName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const registrations = await Registration.find(filter)
      .populate("clubId", "clubName category")
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    res.json({ club, count: registrations.length, data: registrations });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
