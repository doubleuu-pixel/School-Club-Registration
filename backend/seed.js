
const mongoose = require("mongoose");
const Club = require("./models/Club");
const Registration = require("./models/Registration");

const MONGO_URI =
  "mongodb://127.0.0.1:27017/school_club_registration";

const clubsData = [
  {
    clubName: "Art Club",
    departmentName: "Information Technology",
    description: "A place to create, connect, and inspire through art.",
    category: "Arts",
    adviser: "Mrs. Rica Jane Paurillo",
    maxMembers: 30,
    status: "Active"
  },
  {
    clubName: "Music Club",
    departmentName: "Information Technology",
    description: "Open to beginners and experienced musicians alike—just bring your passion for sound.",
    category: "Music and Performing Arts",
    adviser: "Mr. Revin Adobas",
    maxMembers: 30,
    status: "Active"
  },
  {
    clubName: "Coding Club",
    departmentName: "Information Technology",
    description: "Work on websites, mobile apps, and video game development.",
    category: "Academic",
    adviser: "Mr. Dexter Amper",
    maxMembers: 30,
    status: "Active"
  },
  {
    clubName: "Web Club",
    description: " Launch live websites and personal projects to showcase your skills to the world.",
    category: "Arts",
    adviser: "Mr. Lein Tiro",
    maxMembers: 30,
    status: "Active"
  },
  {
    clubName: "Sports Club",
    description: "Encourages physical fitness and sports activities.",
    category: "Sports",
    adviser: "Mr. Kinrich Gantala",
    maxMembers: 30,
    status: "Active"
  },
  {
    clubName: "Environmental Club",
    description: "Organizes environmental awareness and clean-up drives.",
    category: "Service",
    adviser: "Mrs. Flores",
    maxMembers: 30,
    status: "Active"
  }
];

const registrationsData = [
  {
    studentId: "2026-0001",
    firstName: "Juan",
    lastName: "Dela Cruz",
    yearLevel: "First Year",
    section: "BSIT 1-A",
    email: "juan.delacruz@example.com",
    contactNumber: "09171230001",
    clubName: "IT Club",
    status: "Approved"
  },
  {
    studentId: "2026-0002",
    firstName: "Maria",
    lastName: "Santos",
    yearLevel: "Second Year",
    section: "BSIT 2-A",
    email: "maria.santos@example.com",
    contactNumber: "09171230002",
    clubName: "Science Club",
    status: "Pending"
  },
  {
    studentId: "2026-0003",
    firstName: "Pedro",
    lastName: "Reyes",
    yearLevel: "Third Year",
    section: "BSIT 3-A",
    email: "pedro.reyes@example.com",
    contactNumber: "09171230003",
    clubName: "IT Club",
    status: "Approved"
  },
  {
    studentId: "2026-0004",
    firstName: "Ana",
    lastName: "Garcia",
    yearLevel: "First Year",
    section: "BSIT 1-B",
    email: "ana.garcia@example.com",
    contactNumber: "09171230004",
    clubName: "Dance Club",
    status: "Pending"
  },
  {
    studentId: "2026-0005",
    firstName: "Mark",
    lastName: "Ramos",
    yearLevel: "Fourth Year",
    section: "BSIT 4-A",
    email: "mark.ramos@example.com",
    contactNumber: "09171230005",
    clubName: "Sports Club",
    status: "Approved"
  },
  {
    studentId: "2026-0006",
    firstName: "Sofia",
    lastName: "Mendoza",
    yearLevel: "Second Year",
    section: "BSIT 2-B",
    email: "sofia.mendoza@example.com",
    contactNumber: "09171230006",
    clubName: "English Club",
    status: "Rejected"
  },
  {
    studentId: "2026-0007",
    firstName: "Gabriel",
    lastName: "Flores",
    yearLevel: "Third Year",
    section: "BSIT 3-B",
    email: "gabriel.flores@example.com",
    contactNumber: "09171230007",
    clubName: "Environmental Club",
    status: "Pending"
  },
  {
    studentId: "2026-0008",
    firstName: "Isabella",
    lastName: "Torres",
    yearLevel: "First Year",
    section: "BSIT 1-A",
    email: "isabella.torres@example.com",
    contactNumber: "09171230008",
    clubName: "IT Club",
    status: "Pending"
  },
  {
    studentId: "2026-0009",
    firstName: "Daniel",
    lastName: "Villanueva",
    yearLevel: "Second Year",
    section: "BSIT 2-A",
    email: "daniel.villanueva@example.com",
    contactNumber: "09171230009",
    clubName: "Science Club",
    status: "Approved"
  },
  {
    studentId: "2026-0010",
    firstName: "Angela",
    lastName: "Bautista",
    yearLevel: "Fourth Year",
    section: "BSIT 4-B",
    email: "angela.bautista@example.com",
    contactNumber: "09171230010",
    clubName: "English Club",
    status: "Pending"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Create or update clubs without deleting existing records.
    const clubMap = new Map();

    for (const clubData of clubsData) {
      const club = await Club.findOneAndUpdate(
        { clubName: clubData.clubName },
        { $set: clubData },
        { upsert: true, new: true, runValidators: true }
      );

      clubMap.set(club.clubName, club._id);
    }

    // Create or update sample registrations.
    for (const registrationData of registrationsData) {
      const { clubName, ...studentData } = registrationData;
      const clubId = clubMap.get(clubName);

      await Registration.findOneAndUpdate(
        { studentId: studentData.studentId, clubId },
        {
          $set: {
            ...studentData,
            clubId
          }
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log(`Successfully seeded ${clubsData.length} clubs.`);
    console.log(
      `Successfully seeded ${registrationsData.length} registrations.`
    );
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
