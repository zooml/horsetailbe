import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const mongoServer = new MongoMemoryServer();

export const connect = async () => {
  const uri = await mongoServer.getUri();
  await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, autoCreate: true, useCreateIndex: true});
}

export const disconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export const clear = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
}
