import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../src/server';
chai.use(chaiHttp);
import * as db from './dbutil';

export let svr: ChaiHttp.Agent;

export const mochaHooks = {
  beforeAll: async () => {
    await db.connect();
    svr = chai.request(server).keepOpen();
  },
  afterAll: async () => {
    svr.close();
    await db.disconnect();
  }
};