import { Types } from 'mongoose';

export type Doc = {
  readonly uId?: Types.ObjectId; // creating user (not set if self-registered)
  note?: string;
  id?: string; // external ref id
  url?: string; // external ref
};

export type Flds = {
  readonly uId?: Types.ObjectId; // creating user (not set if self-registered)
  note?: string;
  id?: string; // external ref id
  url?: string; // external ref
};