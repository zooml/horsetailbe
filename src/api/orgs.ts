import * as base from './base';
import * as desc from './desc';
import * as actt from './actt';

export const STD_ROLE_IDS = Object.freeze({
  SUPER: 1, // all access
  AUDIT: 2 // readonly
});

export const GENERAL_FUND = Object.freeze({
  id: 1,
  tag: 'general'
});

export type RoleGet = {
  id: number;
  uId: string;
  at: number;
};

export type UserGet = {
  id: string;
  roles: RoleGet[];
};

export type FundGet = {
  id: number;
  tag: string;
  begAt: number;
  at: number;
  desc: desc.Get;
  actts: actt.Get[];
};

export type CloseGet = {
  id: number;
  endAt: number;
  at: number;
  desc: desc.Get;
};

export type Core = {
  name: string;
  begAt: number;
};

export type TldrGet = base.Get & Core & {
  saId: string;
  desc: desc.Get;
  users: UserGet[];
};

export type Get = TldrGet & {
  funds: FundGet[];
  clos: CloseGet[];
};

export type Post = Core & {
  desc?: desc.Post;
}