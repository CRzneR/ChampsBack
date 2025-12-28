const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.DB_URI;

  console.log("DB_URI USED =", JSON.stringify(uri));

  if (!uri) {
    throw new Error("❌ DB_URI fehlt (.env wird nicht geladen)");
  }

  const trimmed = uri.trim();

  // ❌ harte Sperre gegen localhost
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1") || trimmed.includes("27017")) {
    throw new Error("❌ Lokale MongoDB-URI entdeckt! Bitte Atlas-URI verwenden.");
  }

  if (!trimmed.startsWith("mongodb+srv://")) {
    throw new Error("❌ DB_URI hat kein gültiges mongodb+srv:// Schema");
  }

  await mongoose.connect(trimmed, { serverSelectionTimeoutMS: 5000 });
  console.log("✅ MongoDB Atlas verbunden");
}

module.exports = connectDB;
