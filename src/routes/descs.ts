import { FIELDS } from "../common/limits";
import { toObjId } from '../models/doc';
import * as desc from '../models/desc';
import * as bases from './rsc';

export type Get = {
  uId: string;
  note?: string;
  id?: string;
  url?: string;
};

export const POST_DEF: bases.Def = [FIELDS.note, FIELDS.id, FIELDS.url];

export const toDoc = (o: {[k: string]: any}, uId: string): desc.Doc => ({...o, uId: toObjId(uId)});

export const fromDoc = (doc: desc.Doc): Get => ({
  uId: doc.uId.toString(),
  note: doc.note,
  id: doc.id,
  url: doc.url
});
