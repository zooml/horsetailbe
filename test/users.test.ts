import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from '../src/server';
const should = chai.should();
const expect = chai.expect;
import 'mocha';
import * as db from './dbutil';
import * as util from './util';

describe('users integration test', () => {
	before(() => db.connect());
	after(() => db.disconnect());
	afterEach(() => db.clear());

  it('should reject invalid email fmt', done =>  {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'abc', pswd: 'aa11AA..'})
      .end((err, res) => {
        res.should.have.status(400);
        // res.body.should.have.code(1109);
        done();});
	})
	it('should reject invalid pswd fmt', done => {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'a@b.co', pswd: 'a11AA..'})
      .end((err, res) => {
        res.should.have.status(400);
        // res.body.should.have.code(1109);
        done();});
	})
})