import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      await mongoose.connect(mongoUri);
      console.log('Successfully connected to MongoDB.');
      return;
    }

    console.log('No MONGODB_URI provided. Initializing local in-memory MongoDB server...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`Successfully connected to in-memory MongoDB at ${uri}`);
    console.log('Tip: You can specify MONGODB_URI in backend/.env to use MongoDB Atlas or local MongoDB.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
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
