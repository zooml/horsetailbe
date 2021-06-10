import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
import 'mocha';
import * as db from '../dbutil';
import * as util from '../util';
import { svr } from '../hooks';

const PATH = util.PATH_PREFIX + 'sessions';

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
})