import mongoose, { Schema } from 'mongoose';

export interface Base extends mongoose.Document {
  readonly at: Date;
  readonly upAt: Date;
};

export const toObjId = (id: string) => new Schema.Types.ObjectId(id);