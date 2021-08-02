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
import { signIn } from './users.test';
import { createOrg } from './orgs.test';

const PATH = util.PATH_PREFIX + 'accounts';

export const ACC_BEGAT = new Date('2021-06-15T00:00:00.000Z').getTime();

export const createAcct = async (ses: string, oId: string, f: {num: number, name: string, catId?: number, sumId?: string}) => {
  const res = await svr.post(PATH)
    .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
    .send({
      num: f.num,
      name: f.name,
      begAt: ACC_BEGAT,
      catId: f.catId,
      sumId: f.sumId,
      desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
    });
  res.should.have.status(200);
  return res.body.id;
};

describe('accounts integration test', () => {
	afterEach(() => db.clear());

  it('should reject no org', async () =>  {
    const [uId, ses] = await signIn();
    const res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send({
        num: 100,
        name: 'My Assets',
        catId: 1,
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(400);
    res.body.code.should.equal(1106);
    expect(res.body.message).to.match(/oId/);
  })
  it('should reject field errors', async () =>  {
    const [uId, ses, oId] = await createOrg('My Org');
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 100,
        name: 'My Assets',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        // catId: 1,
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(400);
    res.body.code.should.equal(1103)
    expect(res.body.message).to.match(/catId/);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 10,
        name: 'My Assets',
        catId: 1,
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(400);
    res.body.code.should.equal(1108)
    expect(res.body.message).to.match(/num/);
  })
  it('should accept POST and subacct POST', async () =>  {
    const [uId, ses, oId] = await createOrg('My Org');
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 100,
        name: 'My Assets',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        catId: 1,
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(200);
    let o = res.body;
    o.id.should.be.a('string');
    o.id.should.have.lengthOf(24);
    const acId = o.id;
    o.v.should.equal(0);
    util.testAts(o).should.be.true;
    o.num.should.equal(100);
    o.name.should.equal('My Assets');
    o.catId.should.equal(1);
    should.not.exist(o.sumId);
    o.desc.should.eql({uId, id: 'ext id', note: 'this is a note', url: 'https://google.com'});
    o.actts.should.be.an('array');;
    o.actts.should.have.lengthOf(0);
    o.clos.should.be.an('array');;
    o.clos.should.have.lengthOf(0);
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 210,
        name: 'Cash',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        sumId: acId,
        desc: {id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'}
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104)
    expect(res.body.message).to.match(/value 210 should have summary account num 100 as a prefix/);
    // test sub acct
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 110,
        name: 'Cash',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        sumId: acId,
        desc: {id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'}
      });
    res.should.have.status(200);
    o = res.body;
    o.id.should.be.a('string');
    o.id.should.have.lengthOf(24);
    const acId2 = o.id;
    o.v.should.equal(0);
    o.num.should.equal(110);
    o.name.should.equal('Cash');
    should.not.exist(o.catId);
    o.sumId.should.equal(acId);
    o.desc.should.eql({uId, id: 'sub ext id', note: 'this is a sub note', url: 'https://google.com/sub'});
    o.subCnt.should.equal(0);
    // test GET all
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).query({oId}).send();
    res.should.have.status(200);
    res.body.should.be.a('array');
    res.body.should.have.lengthOf(2);
    o = res.body[0];
    o.id.should.equal(acId);
    o.num.should.equal(100);
    o.name.should.equal('My Assets');
    o.subCnt.should.equal(1);
    o = res.body[1];
    o.id.should.equal(acId2);
    o.num.should.equal(110);
    o.name.should.equal('Cash');
    o.subCnt.should.equal(0);
  })
  it('should accept POST and subacct POST', async () =>  {
    const [uId, ses, oId] = await createOrg('My Org');
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 100,
        name: 'My Assets',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        catId: 1,
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(200);
    // same number
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 100,
        name: 'My Liabilities',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        catId: 2,
      });
    res.should.have.status(400);
    res.body.code.should.equal(1105)
    expect(res.body.message).to.match(/100/);
    // higher cat number
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 2000,
        name: 'My Liabilities',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        catId: 2,
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104)
    expect(res.body.message).to.match(/num/);
    // wrong power cat number
    res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses)).set('X-OId', oId)
      .send({
        num: 210,
        name: 'My Liabilities',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        catId: 2,
      });
    res.should.have.status(400);
    res.body.code.should.equal(1104)
    expect(res.body.message).to.match(/num/);
  })
})