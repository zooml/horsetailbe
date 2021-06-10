import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../src/server';
chai.use(chaiHttp);
import * as db from './dbutil';

export let svr: ChaiHttp.Agent;

export const mochaHooks = {
  // await db.connect();
  // svr = chai.request('http://localhost:5000/api/v1').keepOpen();
  // console.log('hook created svr!!!!!!!!! ' + JSON.stringify(svr));
  // return {
  //   afterAll: async () => {
  //     svr.close();
  //     await db.disconnect();
  //   }
  // };
  beforeAll: async () => {
    await db.connect();
    svr = chai.request(server).keepOpen();
    console.log('hook created svr!!!!!!!!! ' + JSON.stringify(svr));
  },
  afterAll: async () => {
    svr.close();
    await db.disconnect();
  }
};