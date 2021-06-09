import * as doc from './doc';

export type Flds = {
  readonly uId?: doc.ObjId; // creating user (not set if self-registered)
  note?: string;
  id?: string; // external ref id
  url?: string; // external ref
};
