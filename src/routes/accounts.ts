import express, {Request, Response} from 'express';
import modelRoute from '../controllers/modelroute';
import {DependentError, DupError, RefError, ValueError} from '../controllers/errors';
import {Account, accountModel, catById} from '../models/account';
import {trimOrUndef} from '../utils/util';
import {logRes} from '../controllers/logger';

const toDoc = (o: {[key: string]: any}): Account => new accountModel({
  oId: 'org', // TODO
  uId: 'joe', // TODO
  num: o.num,
  name: trimOrUndef(o.name),
  begAt: o.begAt,
  note: trimOrUndef(o.note),
  paId: trimOrUndef(o.paId),
  catId: o.catId,
  isCr: o.isCr,
});

const fromDoc = (o: Account): {[key: string]: any} => ({
  id: o._id,
  oId: 'org', // TODO
  uId: 'joe', // TODO
  num: o.num,
  name: o.name,
  begAt: o.begAt || o.at,
  note: o.note,
  paId: o.paId,
  catId: o.catId,
  isCr: o.isCr,
  closes: o.closes,
  suss: o.suss,
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

const validateNum = async (num: number, paNum?: number) => {
  if (!num) throw new ValueError('num', num, 'cannot be zero');
  if (num % 1) throw new ValueError('num', num, 'cannot contain fraction');
  const [digits, power] = digitsAndPower(num);
  if (paNum !== undefined) {
    if (num < paNum) new ValueError('num', num, `must be greater than parent account ${paNum}`);
    const [paDigits, paPower] = digitsAndPower(paNum);
    if (digits != paDigits) throw new ValueError('num', num, `should have ${paDigits} digits`)
    const diff = num - paNum; // paNum must be a prefix
    const [diffDigits,] = digitsAndPower(diff);
    if (paPower < diffDigits) throw new ValueError('num', num, `should have parent account num ${paNum} as a prefix`)
  } else { // general account
    // read 1 general acct "num" only
    if (digits < 3) throw new ValueError('num', num, 'should be at least 3 digits');
    if (power + 1 < digits) throw new ValueError('num', num, 'should be single digit followed by zeros for general accounts');
    const otherAcct = await accountModel.findOne({org: 'org'}, 'num').sort({catId: 1});
    if (otherAcct) {
      const otherNum = otherAcct.num.valueOf();
      const [otherDigits,] = digitsAndPower(otherNum);
      if (digits != otherDigits) throw new ValueError('num', num, `should have ${otherDigits}`)
    }
  }
};

const validate = async (o: Account) => {
  if ((o.catId !== undefined && o.paId !== undefined) ||
    (o.catId === undefined && o.paId === undefined)) throw new DependentError('paId', 'catId', true);
  if (o.paId) {
    const parent = await accountModel.findById(o.paId);
    if (!parent) throw new RefError('paId', 'account', o.paId);
    validateNum(o.num.valueOf(), parent.num.valueOf());
  } else { // general account
    const cat = catById(o.catId?.valueOf()); // o.catId is defined
    if (!cat) throw new RefError('catId', 'category', o.catId);
    if (await accountModel.exists({oId: o.oId, catId: o.catId})) throw new DupError('catId', o.catId);
    if (o.isCr !== undefined && o.isCr.valueOf() !== cat.isCr) throw new ValueError('isCr', o.isCr, 'must be same as category or not set');
    delete o.isCr;
    validateNum(o.num.valueOf());
  }

  // TODO begAt must be after the last close
};

const router = express.Router();

router.get('/', modelRoute(async (req: Request, res: Response) => {
  // TODO page limit
  const resDocs = await accountModel.find({org: 'org'}).sort({num: 1});
  res.send(resDocs.map(fromDoc));
  logRes(res);
}));

router.post('/', modelRoute(async (req: Request, res: Response) => {
  const reqDoc = toDoc(req.body);
  await validate(reqDoc);
  const resDoc =  await reqDoc.save();
  res.send(fromDoc(resDoc));
  logRes(res);
}));

router.patch('/:account_id', function(req: Request, res: Response) {
  res.send({id: req.params.account_id, name: 'Cash'});
  logRes(res);
});

export default router;
