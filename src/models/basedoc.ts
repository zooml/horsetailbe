import { Schema } from 'mongoose';

export interface BaseDoc {
  readonly at: Date;
  readonly upAt: Date;
};

export const toObjId = (id: string) => new Schema.Types.ObjectId(id);