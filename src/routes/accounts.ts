import express, {Request, Response} from 'express';
import ctchEx from '../controllers/ctchex';
import {DependentError, DupError, LimitError, RefError, ValueError} from '../common/apperrs';
import { Doc, CFlds, CloseFlds, findOneGANum, findById, exists, countPerOrg, findByOrg, create } from '../models/account';
import { findAcctCatById } from '../common/acctcat';
import * as descs from './descs';
import * as actts from './actts';
import * as authz from './authz';
import * as rsc from './rsc';
import { FIELDS, RESOURCES } from '../common/limits';
import * as doc from '../models/doc';
import { fromDate, toDateStr } from '../utils/svrdate';
import { lastCloseEndAtFromCachedOrg } from './orgs';
import { CloseGet, Get } from '../api/accounts';

export const SEGMENT = 'accounts';
export const router = express.Router();

const fromCloseFlds = (f: CloseFlds): CloseGet => ({
  id: f.id,
  fnId: f.fnId,
  bal: f.bal
});

const fromDoc = (d: Doc): Get => {
  const g: Get = {
    ...rsc.fromDoc(d),
    oId: d.oId.toHexString(),
    num: d.num,
    name: d.name,
    begAt: fromDate(d.begAt),
    desc: descs.fromFlds(d.desc),
    clos: d.clos.map(fromCloseFlds),
    actts: d.actts.map(actts.fromDoc),
  };
  if (d.sumId) g.sumId = d.sumId.toHexString();
  if (d.catId) g.catId = d.catId;
  if (d.isCr) g.isCr = d.isCr;
  return g;
};

const POST_DEF: rsc.Def = [FIELDS.oId, FIELDS.num, FIELDS.name, FIELDS.begAt, FIELDS.desc, FIELDS.sumId, FIELDS.catId, FIELDS.isCr, FIELDS.clos, FIELDS.actts];

const toCFlds = (o: {[k: string]: any}, uId: doc.ObjId, oId: doc.ObjId): CFlds => {
  const f: CFlds = {
    oId,
    num: o.num,
    name: o.name,
    begAt: o.begAt ,
    desc: descs.toFlds(o.desc, uId),
    clos: [],
    actts: []
  };
  if (o.sumId) f.sumId = doc.toObjId(o.sumId, 'sumId');
  if (o.catId) f.catId = o.catId;
  if (o.isCr !== undefined) f.isCr = o.isCr;
  return f;
};

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

const acctIsActiveAt = (d: Doc, at: Date) => {
  if (at < d.begAt) return false;
  let isAct = true;
  for (const actt of d.actts) {
    if (at < actt.at) return isAct;
    isAct = !isAct;
  }
  return isAct;
}

const validateNum = async (f: CFlds, sumNum?: number) => {
  const num = f.num;
  if (!num) throw new ValueError('num', num, 'cannot be zero');
  if (num % 1) throw new ValueError('num', num, 'cannot contain fraction');
  const [digits, power] = digitsAndPower(num);
  if (sumNum !== undefined) {
    if (num < sumNum) throw new ValueError('num', num, `must be greater than summary account ${sumNum}`);
    const [paDigits, paPower] = digitsAndPower(sumNum);
    if (digits !== paDigits) throw new ValueError('num', num, `should have ${paDigits} digits`)
    const diff = num - sumNum; // must be a prefix
    const [diffDigits,] = digitsAndPower(diff);
    if (paPower < diffDigits) throw new ValueError('num', num, `should have summary account num ${sumNum} as a prefix`)
  } else { // general account
    // done already: if (digits < 3) throw new ValueError('num', num, 'should be at least 3 digits');
    if (power + 1 < digits) throw new ValueError('num', num, 'should be single digit followed by zeros for general accounts');
    // read 1 general acct "num" only
    const otherNum = await findOneGANum(f.oId);
    if (otherNum) {
      const [otherDigits,] = digitsAndPower(otherNum);
      if (digits !== otherDigits) throw new ValueError('num', num, `should have ${otherDigits} digits`)
    }
  }
};

const validate = async (f: CFlds, lastCloseEndAt: Date) => {
  if ((f.catId !== undefined && f.sumId !== undefined) ||
    (f.catId === undefined && f.sumId === undefined)) throw new DependentError('paId', 'catId', true);
  if (f.sumId) { // non-general account
    const sum = await findById(f.sumId, {num: 1, begAt: 1, actts: 1});
    if (!sum || !acctIsActiveAt(sum, f.begAt)) throw new RefError('sumId', 'account', f.sumId);
    await validateNum(f, sum.num);
  } else { // general account
    const cat = findAcctCatById(f.catId); // f.catId is defined
    if (!cat) throw new RefError('catId', 'category', f.catId);
    if (await exists({oId: f.oId, catId: f.catId})) throw new DupError('catId', f.catId);
    if (f.isCr !== undefined && f.isCr !== cat.isCr) throw new ValueError('isCr', f.isCr, 'must be same as category or not set');
    delete f.isCr;
    await validateNum(f);
  }
  if (f.begAt < lastCloseEndAt) throw new ValueError('begAt', f.begAt, `must be after last close and org start (${toDateStr(lastCloseEndAt)})`);
};

const toValidCFlds = async (o: {[k: string]: any}, uId: doc.ObjId, oId: doc.ObjId, lastCloseEndAt: Date) => {
  const f = toCFlds(o, uId, oId);
  rsc.normAndValid(POST_DEF, f, {desc: descs.POST_DEF});
  await validate(f, lastCloseEndAt);
  return f;
};

const validPostLimits = async (f: CFlds) => {
  const forOrg = await countPerOrg(f.oId);
  const max = RESOURCES.accounts.perOrg.max;
  if (max <= forOrg) throw new LimitError('accounts per organization', max);
};

router.get('/', ctchEx(async (req: Request, res: Response) => {
  await authz.isAllowed(req, res, SEGMENT);
  // TODO page limit
  const oId: doc.ObjId = res.locals.oId;
  const resDocs = await findByOrg(oId);
  res.json(resDocs.map(fromDoc));
}));

router.post('/', ctchEx(async (req: Request, res: Response) => {
  await authz.isAllowed(req, res, SEGMENT);
  const uId: doc.ObjId = res.locals.uId;
  const oId: doc.ObjId = res.locals.oId;
  const lastCloseEndAt = lastCloseEndAtFromCachedOrg(res);
  const f = await toValidCFlds(req.body, uId, oId, lastCloseEndAt);
  await validPostLimits(f);
  const resDoc = await create(f);
  res.json(fromDoc(resDoc));
}));

router.patch('/:id', ctchEx(async (req: Request, res: Response) => {
  await authz.isAllowed(req, res, SEGMENT);

  // TODO
  // TODO only 1 actt per close!!!!

  res.json({id: req.params.account_id, name: 'Cash'});
}));
