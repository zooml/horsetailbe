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

const PATH = util.PATH_PREFIX + 'orgs';

export const createOrg = async (name: string, credSes?: string) => {
  const [uId, ses] = credSes ? [undefined, credSes] : await signIn();
  const res = await svr.post(PATH)
    .set('Cookie', cookie.serialize('ses', ses))
    .send({
      name,
      begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
      desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
    });
  res.should.have.status(200);
  return [uId, ses, res.body.id];
}

describe('orgs integration test', () => {
	afterEach(() => db.clear());

  it('should POST org', async () =>  {
    const [uId, ses] = await signIn();
    const res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send({
        name: 'my org',
        begAt: new Date('2021-06-15T00:00:00.000Z').getTime(),
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(200);
    const o = res.body;
    o.id.should.be.a('string');
    o.id.should.have.lengthOf(24);
    o.v.should.equal(0);
    o.name.should.equal('my org');
    o.desc.should.eql({uId, id: 'ext id', note: 'this is a note', url: 'https://google.com'});
    util.testAts(o).should.be.true;
    o.users.should.be.an('array');
    o.users.should.have.lengthOf(1);
    const u = o.users[0];
    u.id.should.equal(uId);
    u.roles.should.be.an('array');
    u.roles.should.have.lengthOf(1);
    const r = u.roles[0];
    r.id.should.equal(1);
    o.funds.should.be.an('array');
    o.funds.should.have.lengthOf(1);
    const f = o.funds[0];
    f.id.should.equal(1);
    f.tag.should.equal('general');
    f.begAt.should.be.a('number');
    util.testAt(f.at).should.be.true;
    // new Date(f.begAt).toISOString().should.match(/T00:00:00\.000Z$/); TODO
    f.desc.uId.should.equal(uId);
    o.clos.should.be.an('array');
    o.clos.should.have.lengthOf(0);
    Object.keys(o).should.have.lengthOf(11);
  })
  it('should GET org', async () =>  {
    const [uId, ses] = await signIn();
    const begAt = new Date('2021-06-13T00:00:00.000Z').getTime();
    let res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send({
        name: 'my org',
        begAt,
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(200);
    const oId = res.body.id;
    res = await svr.get(PATH + `/${oId}`)
      .set('Cookie', cookie.serialize('ses', ses))
      .send();
    res.should.have.status(200);
    let o = res.body;
    o.id.should.equal(oId);
    o.v.should.equal(0);
    o.name.should.equal('my org');
    o.begAt.should.equal(begAt);
    o.desc.should.eql({uId, id: 'ext id', note: 'this is a note', url: 'https://google.com'});
    let u = o.users[0];
    u.id.should.equal(uId);
    u.roles.should.be.an('array');
    u.roles.should.have.lengthOf(1);
    let r = u.roles[0];
    r.id.should.equal(1);
    o.funds.should.be.an('array');
    o.funds.should.have.lengthOf(1);
    const f = o.funds[0];
    f.id.should.equal(1);
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send();
    res.should.have.status(200);
    res.body.should.be.a('array');
    res.body.should.have.lengthOf(1);
    o = res.body[0];
    o.id.should.equal(oId);
    o.name.should.equal('my org');
    o.begAt.should.equal(begAt);
    o.users.should.be.an('array');
    o.users.should.have.lengthOf(1);
    u = o.users[0];
    u.id.should.equal(uId);
    u.roles.should.be.an('array');
    u.roles.should.have.lengthOf(1);
    r = u.roles[0];
    r.id.should.equal(1);
    o.desc.should.eql({uId, id: 'ext id', note: 'this is a note', url: 'https://google.com'});
    should.not.exist(o.funds);
    should.not.exist(o.clos);
  })
})