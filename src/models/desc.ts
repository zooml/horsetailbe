import { Types } from 'mongoose';

export type Doc = {
  readonly uId: Types.ObjectId; // creating user
  note?: string;
  id?: string; // external ref id
  url?: string; // external ref
};
