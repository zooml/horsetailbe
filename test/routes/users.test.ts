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

const PATH = util.PATH_PREFIX + 'users';
const SESSIONS_PATH = util.PATH_PREFIX + 'sessions';

export const signIn = async (creds?: {email: string, pswd: string}) => {
  const email = creds?.email ?? 'a@b.co';
  const pswd = creds?.pswd ?? 'aa11AA..';
  if (!creds) {
    const res = await svr.post(PATH).send({email, pswd, fName: 'joe'});
    res.should.have.status(204);
  }
  let res = await svr.post(SESSIONS_PATH).send({email, pswd});
  res.should.have.status(204);
  const ses = cookie.parse(res.header['set-cookie'][0]).ses;
  if (creds) return [undefined, ses];
  res = await svr.get(PATH)
    .set('Cookie', cookie.serialize('ses', ses))
    .send();
  res.should.have.status(200);
  return [res.body[0].id, ses];
}

describe('users integration test', () => {
	afterEach(() => db.clear());

  it('should reject invalid email fmt', async () =>  {
    const res = await svr.post(PATH)
      .send({email: 'abc', pswd: 'aa11AA..', fName: 'hi'});
    res.should.have.status(400);
    res.should.have.header('content-type', 'application/json; charset=utf-8');
    res.body.code.should.equal(1109);
	})
	it('should reject invalid pswd len', async () => {
    const res = await svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'a11AA..', fName: 'hi'});
    res.should.have.status(400);
    res.body.code.should.equal(1108);
	})
	it('should reject invalid pswd fmt', async () => {
    const res = await svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AABB', fName: 'hi'});
    res.should.have.status(400);
    res.body.code.should.equal(1109);
	})
	it('should reject missing fName', async () => {
    const res = await svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.'});
    res.should.have.status(400);
    res.body.code.should.equal(1106);
	})
	it('should reject long fName', async () => {
    const res = await svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'aaaaaaaaaaaaaaaaaaabc'});
    res.should.have.status(400);
    res.body.code.should.equal(1107);
	})
	// it('should reject extra fld', done => {
  //   svr.post(PATH)
  //     .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'hi', x: 'x'})
  //     .end((_err, res) => {
  //       res.should.have.status(400);
  //       res.body.code.should.equal(1110);
  //       done();});
	// })
	it('should POST user', async () => {
    const fName = '    aaaaaaaaaaaaaaaaaaab   ';
    let res = await svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName});
    res.should.have.status(204);
    const [, ses] = await signIn({email: 'a@b.co', pswd: 'aa11AAB.'});
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send();
    res.should.have.status(200);
    const o = res.body[0];
    o.should.deep.include({email: 'a@b.co', fName: fName.trim(), st: 3, v: 0});
    util.testAts(o).should.be.true;
    o.id.length.should.be.equal(24);
    o.desc.should.deep.equal({});
    o.opts.should.deep.equal({});
    Object.keys(o).length.should.be.equal(9);
	})
	it('should POST user with optional lName', async () => {
    let res = await svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'fn', lName: 'lname'});
    res.should.have.status(204);
    const [, ses] = await signIn({email: 'a@b.co', pswd: 'aa11AAB.'});
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send();
    res.should.have.status(200);
    const o = res.body[0];
    o.should.deep.include({email: 'a@b.co', fName: 'fn', lName: 'lname', st: 3, v: 0});
    util.testAts(o).should.be.true;
    o.id.length.should.be.equal(24);
    o.desc.should.deep.equal({});
    o.opts.should.deep.equal({});
    Object.keys(o).length.should.be.equal(10);
	})
	it('should reject dup', async () => {
    const user0 = {email: 'a@b.co', pswd: 'aa11AAB.', fName: 'hi'};
    const user1 = {email: 'a@b.co', pswd: 'aa11AAB;', fName: 'bye'};
    let res = await svr.post(PATH).send(user0);
    res.should.have.status(204);
    res = await svr.post(PATH).send(user1);
    res.should.have.status(400);
    res.body.code.should.equal(1105);
    res.body.message.should.be.equal("field <index> value 'a@b.co' is not unique");
  })
  it('should reject GET w/o session', async () => {
    const res = await svr.get(PATH);
    res.should.have.status(401);
    res.body.code.should.equal(1202);
  })
  it('should sign in and GET user', async () =>  {
    const email = 'a@b.co';
    const pswd = 'aa11AA..';
    let res = await svr.post(PATH).send({email, pswd, fName: 'joe'});
    res.should.have.status(204);
    res = await svr.post(SESSIONS_PATH).send({email, pswd});
    res.should.have.status(204);
    const ses = cookie.parse(res.header['set-cookie'][0]).ses;
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send();
    res.should.have.status(200);
    res.body.length.should.equal(1);
    const o = res.body[0];
    o.id.should.be.a('string');
    o.id.should.have.lengthOf(24);
    o.email.should.equal(email);
    o.fName.should.equal('joe');
    o.desc.should.be.empty;
    o.opts.should.be.empty;
    expect(o.lName).to.be.an('undefined');
    o.st.should.equal(3);
    o.v.should.equal(0);
    util.testAts(o).should.be.true;
    Object.keys(o).should.have.lengthOf(9);
  })
  it('should reject bad cookie', async () =>  {
    const email = 'a@b.co';
    const pswd = 'aa11AA..';
    let res = await svr.post(PATH).send({email, pswd, fName: 'joe'});
    res.should.have.status(204);
    res = await svr.post(SESSIONS_PATH).send({email, pswd});
    res.should.have.status(204);
    const ses = cookie.parse(res.header['set-cookie'][0]).ses;
    res = await svr.get(PATH)
      .set('Cookie', cookie.serialize('ses', ses + 'a'))
      .send();
    res.should.have.status(401);
    res.body.code.should.equal(1202);
  })
})