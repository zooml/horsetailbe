type Core = {
  note?: string;
  id?: string;
  url?: string;
};

export type Get = Core & {
  uId?: string;
};

export type Post = Core;