import { ObjectId } from 'mongoose';

export interface Doc {
  readonly uId: ObjectId; // creating user
  note?: string;
  id?: string; // external ref id
  url?: string; // external ref
};
