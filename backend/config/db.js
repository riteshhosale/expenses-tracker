import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || '';

export async function connectDB() {
  if (!mongoUri) {
    console.warn('⚠️ No MongoDB URI provided. Skipping DB connection.');
    return false;
  }
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
    return false;
  }
}

export function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export default mongoose;
