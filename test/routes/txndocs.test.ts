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

describe('txndocs integration test', () => {
	afterEach(() => db.clear());

  it('should reject no org', async () =>  {
    const [uId, ses, oId] = await createOrg('my org');
    const assetsId = await createAcct(ses, oId);
    const revenueId = await createAcct(ses, oId, true);
    const res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send({
        begAt: acctBegAt + 24*60*60*1000,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 2.0}, {acId: revenueId, fnId: 1, amt: -2.0}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1106);
    expect(res.body.message).to.match(/oId/);
  })
  it('should reject user errors', async () =>  {
    const [uId, ses, oId] = await createOrg('my org');
    const assetsId = await createAcct(ses, oId);
    const revenueId = await createAcct(ses, oId, true);
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
        begAt: acctBegAt + 24*60*60*1000,
        tdTId: 1,
        adjs: [{acId: '60fddb86918bbb364469d201', fnId: 1, amt: 2}, {acId: revenueId, fnId: 1, amt: -2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/unknown account id/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + 24*60*60*1000,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 0}, {acId: revenueId, fnId: 1, amt: 0}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/amt cannot be 0/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + 24*60*60*1000 + 1,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 1, amt: 2}, {acId: revenueId, fnId: 1, amt: -2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1111);
    expect(res.body.message).to.match(/is not the start of a day/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        begAt: acctBegAt + 24*60*60*1000,
        tdTId: 1,
        adjs: [{acId: assetsId, fnId: 2, amt: 2}, {acId: revenueId, fnId: 1, amt: -2}]
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104);
    expect(res.body.message).to.match(/fund id/);

  })

});