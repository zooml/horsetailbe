import express, {Request, Response} from 'express';
import modelRoute from '../controllers/modelroute';
import {DependentError, DupError, RefError, ValueError} from '../common/apperrs';
import { Doc, Model, catById } from '../models/account';
import {trimOrUndef} from '../utils/util';
import * as descs from './descs';
import * as authz from './authz';
import * as rsc from './rsc';
import { FIELDS } from '../common/limits';

export const SEGMENT = 'accounts';
export const router = express.Router();

type Get = rsc.GetBase & {
  oId: string;
  num: number;
  name: string;
  begAt?: number;
  desc: descs.Get;
};

const POST_DEF: rsc.Def = [FIELDS.oId, FIELDS.num, FIELDS.name, FIELDS.begAt, FIELDS.desc];

const toDoc = (o: {[k: string]: any}, uId: string, oId: string): Doc => new Model({
  oId,
  num: o.num,
  name: trimOrUndef(o.name),
  begAt: o.begAt,
  desc: descs.toDoc(o.desc, uId),
  sumId: trimOrUndef(o.sumId),
  catId: o.catId,
  isCr: o.isCr,
});

const fromDoc = (o: Doc): {[k: string]: any} => ({
  id: o._id,
  oId: o.oId,
  num: o.num,
  name: o.name,
  begAt: o.begAt || o.at,
  desc: descs.fromDoc(o.desc),
  sumId: o.sumId,
  catId: o.catId,
  isCr: o.isCr,
  closes: o.clos,
  actts: o.actts,
  at: o.at,
  upAt: o.upAt,
  v: o.__v
});

const digitsAndPower = (n: number): number[] => {
  let digits = 1;
  let power = 0;
  let isPower = true;
  for (; 10 <= n; ++digits) {
    if (isPower) {
      if (n % 10) {
        isPower = false;
      } else {
        ++power;
      }
    }
    n = n / 10;
  }
  return [digits, power];
};

const validateNum = async (o: Doc, sumNum?: number) => {

  const num = o.num;
  if (!num) throw new ValueError('num', num, 'cannot be zero');
  if (num % 1) throw new ValueError('num', num, 'cannot contain fraction');
  const [digits, power] = digitsAndPower(num);
  if (sumNum !== undefined) {
    if (num < sumNum) new ValueError('num', num, `must be greater than summary account ${sumNum}`);
    const [paDigits, paPower] = digitsAndPower(sumNum);
    if (digits !== paDigits) throw new ValueError('num', num, `should have ${paDigits} digits`)
    const diff = num - sumNum; // must be a prefix
    const [diffDigits,] = digitsAndPower(diff);
    if (paPower < diffDigits) throw new ValueError('num', num, `should have summary account num ${sumNum} as a prefix`)
  } else { // general account
    // read 1 general acct "num" only
    if (digits < 3) throw new ValueError('num', num, 'should be at least 3 digits');
    if (power + 1 < digits) throw new ValueError('num', num, 'should be single digit followed by zeros for general accounts');
    const otherAcct = await Model.findOne({oId: o.oId}, 'num').sort({catId: 1});
    if (otherAcct) {
      const otherNum = otherAcct.num;
      const [otherDigits,] = digitsAndPower(otherNum);
      if (digits !== otherDigits) throw new ValueError('num', num, `should have ${otherDigits}`)
    }
  }
};

const validate = async (o: Doc) => {
  if ((o.catId !== undefined && o.sumId !== undefined) ||
    (o.catId === undefined && o.sumId === undefined)) throw new DependentError('paId', 'catId', true);
  if (o.sumId) {
    const sum = await Model.findById(o.sumId);
    if (!sum) throw new RefError('sumId', 'account', o.sumId);
    validateNum(o, sum.num);
  } else { // general account
    const cat = catById(o.catId); // o.catId is defined
    if (!cat) throw new RefError('catId', 'category', o.catId);
    if (await Model.exists({oId: o.oId, catId: o.catId})) throw new DupError('catId', o.catId);
    if (o.isCr !== undefined && o.isCr !== cat.isCr) throw new ValueError('isCr', o.isCr, 'must be same as category or not set');
    delete o.isCr;
    validateNum(o);
  }

  // TODO begAt must be after the last close
};

router.get('/', modelRoute(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  // TODO page limit
  const resDocs = await Model.find({oId: res.locals.oId}).sort({num: 1});
  res.json(resDocs.map(fromDoc));
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT);
  const reqDoc = toDoc(req.body, res.locals.uId, res.locals.oId);
  await validate(reqDoc);
  const resDoc =  await reqDoc.save();
  res.json(fromDoc(resDoc));
}));

router.patch('/:id', modelRoute(async (req: Request, res: Response) => {
  await authz.validate(req, res, SEGMENT, req.params.id);

  // TODO

  res.json({id: req.params.account_id, name: 'Cash'});
}));
