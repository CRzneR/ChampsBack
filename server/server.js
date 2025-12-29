const path = require("path");

/**
 * ⬇️ GANZ WICHTIG ⬇️
 * Lädt die .env aus dem Projekt-Root (eine Ebene über /server)
 */
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const tournamentRoutes = require("./routes/tournaments");
const matchRoutes = require("./routes/matches");
const { Team } = require("./models/Team");

const app = express();

/**
 * ⬇️ DB CONNECT (mit hartem Fehler, falls falsch)
 */
connectDB().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

// CORS
app.use(
  cors({
    origin: ["http://localhost:5001", "https://champs-front.vercel.app"],
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

// Health
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Server
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
    }

    await Team.init();
    console.log("✅ Compound Index erstellt");
  } catch (err) {
    console.error(err);
  }
});
