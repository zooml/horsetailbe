

// TODO dates

export const today = () => new Date(); // TODO fix this to start at day begin UTC

export const toDate = (vSecs: number): Date => {
  // TODO fix
  return new Date(vSecs * 1000);
};

export const toNumSecs = (v: Date): number => {
  return v.getTime() / 1000;
};

export const toStr = (v: Date): string => {
// TODO fix
// YYYY-MM-DDTHH:mm:ss.sssZ
  return v.toISOString().replace(/T/, ' ').slice(0, 18); 
};

export const toStrDay = (v: Date): string => {
  // TODO fix
  return v.toISOString().slice(0, 10); 
};

export const validDayBeg = (v: Date) => {

  // TODO validate that v is start of a day

  return true;
};