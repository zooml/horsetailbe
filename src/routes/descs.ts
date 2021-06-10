import { FIELDS } from "../common/limits";
import * as doc from '../models/doc';
import * as desc from '../models/desc';
import * as rsc from './rsc';

export type Get = {
  uId?: string;
  note?: string;
  id?: string;
  url?: string;
};

export const POST_DEF: rsc.Def = [FIELDS.uId, FIELDS.note, FIELDS.id, FIELDS.url];

export const toFlds = (o: {[k: string]: any} | undefined, uId: doc.ObjId | undefined): desc.Flds => {
  const f: desc.Flds = uId ? {uId} : {};
  if (o) {
    if (o.note) f.note = o.note;
    if (o.id) f.id = o.id;
    if (o.url) f.url = o.url;
  }
  return f;
};

export const fromFlds = (d: desc.Flds): Get => {
  const g: Get = {};
  if (d.uId) g.uId = d.uId.toHexString();
  if (d.note) g.note = d.note;
  if (d.id) g.id = d.id;
  if (d.url) g.url = d.url;
  return g;
};
