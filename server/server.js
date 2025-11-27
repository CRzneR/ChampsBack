const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const tournamentRoutes = require("./routes/tournaments");
const matchRoutes = require("./routes/matches");
const { Team } = require("./models/Team");

// Express App
const app = express();

// Database connect (Atlas)
connectDB();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://forchampions.vercel.app", // ⬅ dein Frontend
    ],
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/tournaments", matchRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", time: new Date().toISOString() });
});

// SERVER START
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend läuft auf Port ${PORT}`);
});

// Index migration
mongoose.connection.once("open", async () => {
  try {
    const collection = mongoose.connection.db.collection("teams");
    const indexes = await collection.indexes();
    if (indexes.find((i) => i.name === "name_1")) {
      await collection.dropIndex("name_1");
      console.log("Alter Index gelöscht.");
    }
    await Team.init();
    console.log("Neuer Compound-Index aktiv.");
  } catch (err) {
    console.error("Index-Migration Fehler:", err);
  }
});
