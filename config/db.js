const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.DB_URI;

  if (!uri) {
    console.error("❌ DB_URI ist nicht gesetzt (.env fehlt?)");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Atlas verbunden");
  } catch (error) {
    console.error("❌ MongoDB Verbindungsfehler:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
