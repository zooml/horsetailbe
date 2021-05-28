import { Schema, ObjectId } from 'mongoose';

export interface BaseDoc {
  readonly at: Date;
  readonly upAt: Date;
};

export interface Desc {
  readonly uId: ObjectId; // creating user
  note?: string;
  id?: string;
  url?: string;
};

export interface ActTgl {
  readonly at: Date;
  readonly isA: boolean;
  desc: Desc;
};

export const toOId = (id: string) => new Schema.Types.ObjectId(id);