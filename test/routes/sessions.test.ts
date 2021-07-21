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

const PATH = util.PATH_PREFIX + 'sessions';
const USERS_PATH = util.PATH_PREFIX + 'users';

// https://www.chaijs.com/plugins/chai-http/: chai.request.agent(app)

describe('sessions integration test', () => {
	afterEach(async () => await db.clear());

  it('should reject not registered', async () =>  {
    const res = await svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AA..'});
    res.should.have.status(401);
    res.should.have.header('content-type', 'application/json; charset=utf-8');
    res.body.code.should.equal(1201);
	})
  it('should sign in', async () =>  {
    const email = 'a@b.co';
    const pswd = 'aa11AA..';
    let res = await svr.post(USERS_PATH).send({email, pswd, fName: 'joe'});
    res.should.have.status(204);
    res = await svr.post(PATH).send({email, pswd});
    res.should.have.status(204);
    const setCookies = res.header['set-cookie'];
    expect(setCookies.length).to.eq(1);
    const c = cookie.parse(setCookies[0]);
    expect(c.ses).to.be.a('string');
	})
  it('should sign in and out', async () =>  {
    const email = 'a@b.co';
    const pswd = 'aa11AA..';
    let res = await svr.post(USERS_PATH).send({email, pswd, fName: 'joe'});
    res.should.have.status(204);
    res = await svr.post(PATH).send({email, pswd});
    res.should.have.status(204);
    const ses = cookie.parse(res.header['set-cookie'][0]).ses;
    res = await svr.delete(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send();
    res.should.have.status(204);
    const setCookies = res.header['set-cookie'];
    expect(setCookies.length).to.eq(1);
    const c = cookie.parse(setCookies[0]);
    expect(c).to.have.property('ses');
    expect(c.ses).to.equal('');
  })
})