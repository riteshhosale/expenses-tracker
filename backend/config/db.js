import mongoose from "mongoose";
import "./env.js";

const primaryMongoUri = process.env.MONGO_URI || process.env.MONGO_URL || "";
const fallbackMongoUri =
  process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/expenses-tracker";

const connectionOptions = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
};

const isPrimaryLookupError = (err) =>
  ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "EAI_AGAIN"].includes(err?.code);

async function tryConnect(uri) {
  await mongoose.connect(uri, connectionOptions);
  return true;
}

export async function connectDB() {
  if (!primaryMongoUri && !fallbackMongoUri) {
    console.warn("⚠️ No MongoDB URI provided. Skipping DB connection.");
    return false;
  }

  try {
    if (primaryMongoUri) {
      await tryConnect(primaryMongoUri);
      console.log("✅ Connected to MongoDB");
      return true;
    }

    await tryConnect(fallbackMongoUri);
    console.log("✅ Connected to MongoDB");
    return true;
  } catch (err) {
    if (primaryMongoUri && fallbackMongoUri && isPrimaryLookupError(err)) {
      console.warn(
        `⚠️ Failed to reach primary MongoDB URI (${err.code}). Trying local fallback...`,
      );

      try {
        await tryConnect(fallbackMongoUri);
        console.log("✅ Connected to local MongoDB fallback");
        return true;
      } catch (fallbackErr) {
        console.warn(
          "⚠️ Local MongoDB fallback unavailable:",
          fallbackErr.message,
        );
        return false;
      }
    }

    console.warn("⚠️ DB Connection Error:", err.message);
    return false;
  }
}

export function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export default mongoose;
