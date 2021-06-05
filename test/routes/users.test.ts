import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from '../../src/server';
const should = chai.should();
const expect = chai.expect;
import 'mocha';
import * as db from '../dbutil';
import * as util from '../util';

describe('users integration test', () => {
	before(() => db.connect());
	after(() => db.disconnect());
	afterEach(() => db.clear());

  it('should reject invalid email fmt', done =>  {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'abc', pswd: 'aa11AA..', fName: 'hi'})
      .end((err, res) => {
        res.should.have.status(400);
        res.should.have.header('content-type', 'application/json; charset=utf-8');
        res.body.code.should.equal(1109);
        done();});
	})
	it('should reject invalid pswd len', done => {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'a@b.co', pswd: 'a11AA..', fName: 'hi'})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1108);
        done();});
	})
	it('should reject invalid pswd fmt', done => {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'a@b.co', pswd: 'aa11AABB', fName: 'hi'})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1109);
        done();});
	})
	it('should reject missing fName', done => {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'a@b.co', pswd: 'aa11AAB.'})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1106);
        done();});
	})
	it('should reject extra fld', done => {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'hi', x: 'x'})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1110);
        done();});
	})
	it('should accept', done => {
    chai.request(server).post(util.pathPrefix + 'users')
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'hi'})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.deep.include({email: 'a@b.co', fName: 'hi', st: 3, v: 0});
        const at = Date.now();
        const past = at - 60000;
        res.body.at.should.be.within(past, at);
        res.body.upAt.should.be.within(past, at);
        done();});
	})
	it('should reject dup', done => {
    const user0 = {email: 'a@b.co', pswd: 'aa11AAB.', fName: 'hi'};
    const user1 = {email: 'a@b.co', pswd: 'aa11AAB;', fName: 'bye'};
    chai.request(server).post(util.pathPrefix + 'users')
      .send(user0)
      .end((err, res) => {
        res.should.have.status(200);
        chai.request(server).post(util.pathPrefix + 'users')
        .send(user1)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.code.should.equal(1105);
          res.body.message.should.be.equal("field '<index>' value 'a@b.co' is not unique")
          done();});
      });
  })
})