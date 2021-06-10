import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
import 'mocha';
import * as db from '../dbutil';
import * as util from '../util';
import { svr } from '../hooks';

const PATH = util.PATH_PREFIX + 'users';

describe('users integration test', () => {
	afterEach(() => db.clear());

  it('should reject invalid email fmt', done =>  {
    svr.post(PATH)
      .send({email: 'abc', pswd: 'aa11AA..', fName: 'hi'})
      .end((_err, res) => {
        res.should.have.status(400);
        res.should.have.header('content-type', 'application/json; charset=utf-8');
        res.body.code.should.equal(1109);
        done();});
	})
	it('should reject invalid pswd len', done => {
    svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'a11AA..', fName: 'hi'})
      .end((_err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1108);
        done();});
	})
	it('should reject invalid pswd fmt', done => {
    svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AABB', fName: 'hi'})
      .end((_err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1109);
        done();});
	})
	it('should reject missing fName', done => {
    svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.'})
      .end((_err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1106);
        done();});
	})
	it('should reject long fName', done => {
    svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'aaaaaaaaaaaaaaaaaaabc'})
      .end((_err, res) => {
        res.should.have.status(400);
        res.body.code.should.equal(1107);
        done();});
	})
	// it('should reject extra fld', done => {
  //   svr.post(PATH)
  //     .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'hi', x: 'x'})
  //     .end((_err, res) => {
  //       res.should.have.status(400);
  //       res.body.code.should.equal(1110);
  //       done();});
	// })
	it('should accept', done => {
    const fName = '    aaaaaaaaaaaaaaaaaaab   ';
    svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName})
      .end((_err, res) => {
        res.should.have.status(200);
        res.body.should.deep.include({email: 'a@b.co', fName: fName.trim(), st: 3, v: 0});
        const at = Date.now();
        const past = at - 10000;
        res.body.at.should.be.within(past, at);
        res.body.upAt.should.be.within(past, at);
        res.body.id.length.should.be.equal(24);
        res.body.desc.should.deep.equal({});
        res.body.opts.should.deep.equal({});
        Object.keys(res.body).length.should.be.equal(9);
        done();});
	})
	it('should accept optional lName', done => {
    svr.post(PATH)
      .send({email: 'a@b.co', pswd: 'aa11AAB.', fName: 'fn', lName: 'lname'})
      .end((_err, res) => {
        res.should.have.status(200);
        res.body.should.deep.include({email: 'a@b.co', fName: 'fn', lName: 'lname', st: 3, v: 0});
        const at = Date.now();
        const past = at - 10000;
        res.body.at.should.be.within(past, at);
        res.body.upAt.should.be.within(past, at);
        res.body.id.length.should.be.equal(24);
        res.body.desc.should.deep.equal({});
        res.body.opts.should.deep.equal({});
        Object.keys(res.body).length.should.be.equal(10);
        done();});
	})
	it('should reject dup', done => {
    const user0 = {email: 'a@b.co', pswd: 'aa11AAB.', fName: 'hi'};
    const user1 = {email: 'a@b.co', pswd: 'aa11AAB;', fName: 'bye'};
    svr.post(PATH).send(user0)
      .end((_err, res) => {
        res.should.have.status(200);
        svr.post(PATH).send(user1)
          .end((_err, res) => {
            res.should.have.status(400);
            res.body.code.should.equal(1105);
            res.body.message.should.be.equal("field <index> value 'a@b.co' is not unique")
            done();});});
  })
  it('should reject GET w/o session', done => {
    svr.get(PATH)
      .end((_err, res) => {
        res.should.have.status(401);
        done();});
  })
})