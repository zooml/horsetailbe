import { FIELDS } from "../common/limits";
import { toObjId } from '../models/doc';
import * as desc from '../models/desc';
import * as bases from './rsc';

export type Get = {
  uId?: string;
  note?: string;
  id?: string;
  url?: string;
};

export const POST_DEF: bases.Def = [FIELDS.note, FIELDS.id, FIELDS.url];

export const toDoc = (o: {[k: string]: any}, uId: string | undefined): desc.Doc => {
  return uId ? {...o, uId: toObjId(uId)} : {...o};
};

export const toFlds = (o: {[k: string]: any}, uId: string | undefined): desc.Flds => {
  return uId ? {...o, uId: toObjId(uId)} : {...o};
};

export const fromDoc = (d: desc.Doc): Get => {
  const g: Get = {};
  if (d.uId) g.uId = d.uId.toString();
  if (d.note) g.note = d.note;
  if (d.id) g.id = d.id;
  if (d.url) g.url = d.url;
  return g;
};
