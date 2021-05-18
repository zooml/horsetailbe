import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
// const server = require('../dist/server');
// const server = await import('../dist/server');
import server from '../dist/server';
const should = chai.should();
const expect = chai.expect;
import 'mocha';
import * as db from './dbutil';

describe("user integration test", () => {

  // TODO in case this does not work: https://stackoverflow.com/questions/38223053/ensuring-server-app-runs-before-mocha-tests-start
	before(() => db.connect());

	after(() => db.disconnect());

	// beforeEach(() => {});

	afterEach(() => db.clear());

  it("should return true for a number in between 10 and 70", done =>  {
    chai
      .request(server)
      .get('/films-list')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
	})

	it("should return false when the number is less than or equal to 10", () => {

	})

	it("should return false when the number is greater than or equal to 70", () => {

	})
})