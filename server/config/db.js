const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("DB_URI fehlt in .env");
    }

    const conn = await mongoose.connect(uri.trim());
    console.log(`✅ MongoDB verbunden: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Verbindungsfehler:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
