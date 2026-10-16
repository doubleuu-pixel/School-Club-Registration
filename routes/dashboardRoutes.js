const express = require("express");
const Club = require("../models/Club");
const Registration = require("../models/Registration");

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", async (_req, res, next) => {
  try {
    const [
      totalClubs,
      activeClubs,
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations
    ] = await Promise.all([
      Club.countDocuments(),
      Club.countDocuments({ status: "Active" }),
      Registration.countDocuments(),
      Registration.countDocuments({ status: "Pending" }),
      Registration.countDocuments({ status: "Approved" }),
      Registration.countDocuments({ status: "Rejected" })
    ]);

    const registrationsByClub = await Registration.aggregate([
      {
        $group: {
          _id: "$clubId",
          registeredMembers: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "clubs",
          localField: "_id",
          foreignField: "_id",
          as: "club"
        }
      },
      { $unwind: { path: "$club", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          clubId: "$_id",
          clubName: { $ifNull: ["$club.clubName", "Deleted club"] },
          registeredMembers: 1
        }
      },
      { $sort: { registeredMembers: -1, clubName: 1 } }
    ]);

    res.json({
      data: {
        totalClubs,
        activeClubs,
        totalRegistrations,
        pendingRegistrations,
        approvedRegistrations,
        rejectedRegistrations,
        registrationsByClub
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
