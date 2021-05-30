import { trimOrUndef } from "../utils/util";
import { ObjectId } from 'mongoose';
import { toOId } from '../models/basedoc';

type Api = {
  uId?: string; // TODO remove if no fromDoc
  note?: string;
  id?: string;
  url?: string;
};

type Doc = {
  uId: ObjectId;
  note?: string;
  id?: string;
  url?: string;
};

export const toDoc = (o: Api, uId: string): Doc => ({
  uId: toOId(uId),
  id: trimOrUndef(o.id),
  url: trimOrUndef(o.url),
  note: trimOrUndef(o.note)
});

// TODO is this needed??????
export const fromDoc = (o: Doc): Api => ({
  uId: o.uId.toString(),
  id: o.id,
  url: o.url,
  note: o.note
});