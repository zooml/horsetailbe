import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
import 'mocha';
import * as db from '../dbutil';
import * as util from '../util';
import { svr } from '../hooks';
import cookie from 'cookie';
import { createOrg } from './orgs.test';
import { acctBegAt, createAcct } from './accounts.test';

const PATH = util.PATH_PREFIX + 'txndocs';
const DAY = 24*60*60*1000;

type Amt = {amt: number, acId: string, fnId: number};
type Desc = {uId: string, id?: string, note?: string, url?: string};
const validate = (o: {[k: string]: any}, uId: string, oId: string, begAt: number, amts: Amt[], desc?: Desc) => {
  o.id.should.be.a('string');
  o.id.should.have.lengthOf(24);
  o.v.should.equal(0);
  util.testAt(o.at).should.be.true;
  util.testAt(o.upAt).should.be.true;
  o.oId.should.equal(oId);
  o.begAt.should.equal(begAt);
  o.tdTId.should.equal(1);
  expect(o.dueAt).to.be.undefined;
  expect(o.adjs).to.be.an('array');
  expect(o.adjs).to.have.lengthOf(amts.length);
  o.adjs.forEach((a: {[k: string]: any}, i: number) => {
    a.fnId.should.equal(1);
    a.acId.should.equal(amts[i].acId);
    a.amt.should.equal(amts[i].amt);
  });
  o.desc.should.eql(desc ? desc : {uId, id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'});
  expect(Object.keys(o).length).to.equal(9);
};

describe('txndocs integration test', () => {
	afterEach(() => db.clear());

  it('should reject no org', async () =>  {
    const [uId, ses, oId] = await createOrg('my org');
    const assetsId = await createAcct(ses, oId, {num: 100, name: 'assets', catId: 1});
    const revenueId = await createAcct(ses, oId, {num: 400, name: 'revs', catId: 4});
    const res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send({
        begAt: acctBegAt + DAY,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 2.0}, {acId: revenueId, fnId: 1, amt: -2.0}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1106);
    expect(res.body.message).to.match(/oId/);
  })
  it('should reject user errors', async () =>  {
    const [uId, ses, oId] = await createOrg('my org');
    const assetsId = await createAcct(ses, oId, {num: 100, name: 'assets', catId: 1});
    const revenueId = await createAcct(ses, oId, {num: 400, name: 'revs', catId: 4});
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt,
        // tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 2.0}, {acId: revenueId, fnId: 1, amt: -2.0}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1106);
    expect(res.body.message).to.match(/tdTId/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + DAY,
        tdTId: 1,
        adjs: [{acId: '60fddb86918bbb364469d201', fnId: 1, amt: 2}, {acId: revenueId, fnId: 1, amt: -2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/unknown account id/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + DAY,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 0}, {acId: revenueId, fnId: 1, amt: 0}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/amt cannot be 0/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + DAY + 1,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 2}, {acId: revenueId, fnId: 1, amt: -2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1111);
    expect(res.body.message).to.match(/is not the start of a day/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + DAY,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 2, amt: 2}, {acId: revenueId, fnId: 1, amt: -2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/fund id/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + DAY,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 2, amt: 2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1108);
    expect(res.body.message).to.match(/does not meet min of 2/);
    const cashId = await createAcct(ses, oId, {num: 110, name: 'cash', sumId: assetsId});
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + DAY,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 2}, {acId: revenueId, fnId: 1, amt: -2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/cannot post to summary account/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + DAY,
        tdTId: 1,
        adjs: [{acId: cashId, fnId: 1, amt: 2}, {acId: cashId, fnId: 1, amt: -1}, {acId: revenueId, fnId: 1, amt: -1}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/cannot have duplicate account/);
  })
  it('should accept POST', async () =>  {
    const [uId, ses, oId] = await createOrg('my org');
    const assetsId = await createAcct(ses, oId, {num: 100, name: 'assets', catId: 1});
    const revenueId = await createAcct(ses, oId, {num: 400, name: 'revs', catId: 4});
    let begAt = acctBegAt + DAY;
    const amts = [{acId: assetsId, fnId: 1, amt: 2.0}, {acId: revenueId, fnId: 1, amt: -2.0}];
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt,
        tdTId: 1,
        adjs: amts,
        desc: {id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'}
      });
    res.should.have.status(200);
    validate(res.body, uId, oId, begAt, amts);
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId).send();
    res.should.have.status(200);
    let os = res.body;
    expect(os).to.be.an('array');
    expect(os).to.have.lengthOf(1);
    validate(os[0], uId, oId, begAt, amts);
  })
  it('should sort POSTs', async () =>  {
    const [uId, ses, oId] = await createOrg('my org');
    const assetsId = await createAcct(ses, oId, {num: 100, name: 'assets', catId: 1});
    const revenueId = await createAcct(ses, oId, {num: 400, name: 'revs', catId: 4});
    let begAt = acctBegAt + DAY;
    const amts = [{acId: assetsId, fnId: 1, amt: 2.0}, {acId: revenueId, fnId: 1, amt: -2.0}];
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt,
        tdTId: 1,
        adjs: amts,
        desc: {id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'}
      });
    res.should.have.status(200);
    let begAt2 = acctBegAt + 3*DAY;
    const amts2 = [{acId: assetsId, fnId: 1, amt: -1000}, {acId: revenueId, fnId: 1, amt: 1000}];
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: begAt2,
        tdTId: 1,
        adjs: amts2
      });
    res.should.have.status(200);
    let begAt3 = acctBegAt + 2*DAY;
    const amts3 = [{acId: assetsId, fnId: 1, amt: -19000}, {acId: revenueId, fnId: 1, amt: 19000}];
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: begAt3,
        tdTId: 1,
        adjs: amts3
      });
    res.should.have.status(200);
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId).send();
    const os = res.body;
    expect(os).to.be.an('array');
    expect(os).to.have.lengthOf(3);
    validate(os[0], uId, oId, begAt2, amts2, {uId: uId});
    validate(os[1], uId, oId, begAt3, amts3, {uId: uId});
    validate(os[2], uId, oId, begAt, amts);
  })
  it('should accept POSTs different accts and orgs', async () =>  {
    const [uId, ses, oId] = await createOrg('my org');
    const assetsId = await createAcct(ses, oId, {num: 100, name: 'assets', catId: 1});
    const cashId = await createAcct(ses, oId, {num: 110, name: 'cash', sumId: assetsId});
    const furnId = await createAcct(ses, oId, {num: 120, name: 'furniture', sumId: assetsId});
    const revenueId = await createAcct(ses, oId, {num: 400, name: 'revs', catId: 4});
    let begAt = acctBegAt + DAY;
    const amts = [
      {acId: cashId, fnId: 1, amt: 2.0}, 
      {acId: revenueId, fnId: 1, amt: -2.0}];
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt,
        tdTId: 1,
        adjs: amts,
        desc: {id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'}
      });
    res.should.have.status(200);
    let begAt2 = acctBegAt + 3*DAY;
    const amts2 = [{acId: furnId, fnId: 1, amt: -1000}, {acId: revenueId, fnId: 1, amt: 1000}];
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: begAt2,
        tdTId: 1,
        adjs: amts2
      });
    res.should.have.status(200);
    let begAt3 = acctBegAt + 2*DAY;
    const amts3 = [{acId: furnId, fnId: 1, amt: -19000}, {acId: revenueId, fnId: 1, amt: 19000}];
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: begAt3,
        tdTId: 1,
        adjs: amts3
      });
    res.should.have.status(200);
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId).send();
    let os = res.body;
    expect(os).to.be.an('array');
    expect(os).to.have.lengthOf(3);
    validate(os[0], uId, oId, begAt2, amts2, {uId: uId});
    validate(os[1], uId, oId, begAt3, amts3, {uId: uId});
    validate(os[2], uId, oId, begAt, amts);
    // make sure only reading oId and not  oId2
    const [,, oId2] = await createOrg('my org2', ses);
    const assetsId2 = await createAcct(ses, oId2, {num: 100, name: 'assets', catId: 1});
    const revenueId2 = await createAcct(ses, oId2, {num: 400, name: 'revs', catId: 4});
    const amts_2 = [
      {acId: assetsId2, fnId: 1, amt: 2.0}, 
      {acId: revenueId2, fnId: 1, amt: -2.0}];
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId2)
      .send({
        begAt,
        tdTId: 1,
        adjs: amts_2,
        desc: {id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'}
      });
    res.should.have.status(200);
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId).send();
    os = res.body;
    expect(os).to.be.an('array');
    expect(os).to.have.lengthOf(3);
    validate(os[0], uId, oId, begAt2, amts2, {uId: uId});
    validate(os[1], uId, oId, begAt3, amts3, {uId: uId});
    validate(os[2], uId, oId, begAt, amts);
  })
});