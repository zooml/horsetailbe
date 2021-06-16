import express, { Request, Response } from 'express';
import ctchEx from '../controllers/ctchex';
import { CFlds, Doc } from '../models/siteacct';
import * as descs from './descs';
import * as doc from '../models/doc';
import * as rsc from './rsc'
import * as siteacct from '../models/siteacct';
import { Get } from '../api/siteaccts';

export const SEGMENT = 'siteaccts';
export const router = express.Router();

const toCFlds = (o: {[k: string]: any}, uId: doc.ObjId): CFlds => ({
  uId,
  name: o.name,
  desc: descs.toFlds(o.desc, uId)
});

const fromDoc = (d: Doc): Get => ({
  ...rsc.fromDoc(d),
  uId: d.uId.toHexString(),
  name: d.name,
  desc: descs.fromFlds(d.desc),
});

const validate = (o: Doc) => {
  // TODO saId, uId
  // TODO limit on num orgs/user
};

export const create = async (uId: doc.ObjId, fName: string) =>
  siteacct.create({uId, name: `${fName}'s site account`, desc: {uId}});

router.get('/', ctchEx(async (req: Request, res: Response) => {
  // TODO get by uId
  const uId: doc.ObjId = res.locals.uId;
}));

// TODO needed??? router.post('/', ctchEx(async (req: Request, res: Response) => {
//   const reqDoc = toDoc(req.body, res.locals.uId);
//   validate(reqDoc);
//   const resDoc =  await reqDoc.save();
//   res.json(fromDoc(resDoc));
// }));
