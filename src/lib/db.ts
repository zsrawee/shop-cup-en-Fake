import mongoose from "mongoose";

export const isMock = !process.env.MONGODB_URI;

if (isMock) {
  console.warn("⚠️ MONGODB_URI is not defined. Switching to MOCK MODE.");
}

const MONGODB_URI = process.env.MONGODB_URI || "";

export const connectToDB = async () => {
  if (isMock) return;

  // If already connected, do nothing
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};