// =======================================================
//   IMPORTS
// =======================================================
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const tournamentRoutes = require("./routes/tournaments");
const matchRoutes = require("./routes/matches");

const { Team } = require("./models/Team");

// =======================================================
//   EXPRESS APP
// =======================================================
const app = express();

// DB connect
connectDB();

// =======================================================
//   CORS KONFIGURATION (WICHTIG!)
// =======================================================
const allowedOrigins = [
  "http://localhost:3000", // Vercel Dev
  "http://localhost:5173", // optional (Vite)
  "https://forchampions.vercel.app", // ⬅ dein Vercel Frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// =======================================================
//   BODY PARSER
// =======================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =======================================================
//   LOGGER
// =======================================================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// =======================================================
//   ROUTES
// =======================================================
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/tournaments", matchRoutes);

// =======================================================
//   HEALTH ENDPOINT
// =======================================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// =======================================================
//   KEIN FRONTEND SERVEN!!! (Vercel übernimmt das)
// =======================================================
// Entfernt: express.static("../client")
// Entfernt: SPA Fallback

// =======================================================
//   SERVER START
// =======================================================
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server läuft auf PORT ${PORT}`);
});

// =======================================================
//   INDEX MIGRATION (MongoDB)
// =======================================================
mongoose.connection.once("open", async () => {
  try {
    const collection = mongoose.connection.db.collection("teams");

    const indexes = await collection.indexes();
    if (indexes.find((i) => i.name === "name_1")) {
      console.log("⚠️ Alter Index 'name_1' wird gelöscht...");
      await collection.dropIndex("name_1");
      console.log("✅ Alter Index gelöscht.");
    } else {
      console.log("ℹ️ Kein alter Index vorhanden.");
    }

    await Team.init();
    console.log("✅ Neuer Compound-Index aktiv.");
  } catch (err) {
    console.error("❌ Fehler beim Index-Migration:", err);
  }
});
