require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const clubRoutes = require("./routes/clubRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "School Club Registration API is running",
    endpoints: [
      "GET /api/clubs",
      "GET /api/clubs/:id",
      "GET /api/clubs/:id/registrations",
      "GET /api/registrations",
      "GET /api/registrations/:id",
      "GET /api/dashboard/stats"
    ]
  });
});

app.use("/api/clubs", clubRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error"
  });
});

const PORT = 6001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Create a .env file based on .env.example.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
