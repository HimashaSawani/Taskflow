import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI?.trim();

  if (mongoUri) {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Successfully connected to MongoDB Atlas.');
    return;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI environment variable is not configured in Vercel project settings.');
  }

  console.log('No MONGODB_URI provided. Initializing local in-memory MongoDB server...');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`Successfully connected to in-memory MongoDB at ${uri}`);
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};
