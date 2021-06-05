import mongoose from 'mongoose';

export interface Base extends mongoose.Document {
  readonly at: Date;
  readonly upAt: Date;
};

export const toObjId = (id: string) => new mongoose.Types.ObjectId(id);