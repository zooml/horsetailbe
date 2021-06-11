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
const SESSIONS_PATH = util.PATH_PREFIX + 'sessions';

describe('orgs integration test', () => {
	afterEach(() => db.clear());

  it('should create org', async () =>  {
    const [uId, ses] = await signIn();
    const res = await svr.post(PATH)
      .set('Cookie', cookie.serialize('ses', ses))
      .send({
        name: 'my org',
        desc: {id: 'ext id', note: 'this is a note', url: 'https://google.com'}
      });
    res.should.have.status(200);
    const o = res.body;
    o.id.should.be.a('string');
    o.id.should.have.lengthOf(24);
    o.name.should.equal('my org');
    o.desc.uId.should.equal(uId);
    o.desc.id.should.equal('ext id');
    o.desc.note.should.equal('this is a note');
    o.desc.url.should.equal('https://google.com');

    // TODO users funds
  })
})