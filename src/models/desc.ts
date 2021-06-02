import { ObjectId } from 'mongoose';

export type Doc = {
  readonly uId: ObjectId; // creating user
  note?: string;
  id?: string; // external ref id
  url?: string; // external ref
};
