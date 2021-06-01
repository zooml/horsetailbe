import { trimOrUndef } from "../utils/util";
import { toObjId } from '../models/basedoc';
import * as desc from '../models/desc';
import LIMITS from "../common/limits";
import { validStr } from "../common/validator";
import { Def } from "../controllers/rsc";

export type PostRsc = {
  note?: string;
  id?: string;
  url?: string;
};

export type GetRsc = PostRsc & {
  uId: string;
};

export const POST_RSC_DEF: Def = {
  note: validStr.bind(LIMITS.fields.note, true),
  id: validStr.bind(LIMITS.fields.id, true),
  url: validStr.bind(LIMITS.fields.url, true)
};

export const toDoc = (o: PostRsc, uId: string): desc.Doc => ({
  uId: toObjId(uId),
  id: trimOrUndef(o.id),
  url: trimOrUndef(o.url),
  note: trimOrUndef(o.note)
});

export const fromDoc = (o: desc.Doc): GetRsc => ({
  uId: o.uId.toString(),
  id: o.id,
  url: o.url,
  note: o.note
});