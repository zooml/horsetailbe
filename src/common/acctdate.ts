

// TODO dates

// note cannot determine today since it depends on timezone???
export const begToday = () => new Date(); // TODO fix this to start at day begin UTC

// TODO fix beg of day!!!!!!!
export const begOfDay = (d: Date) => d;

export const toDate = (v: any): any => {
  if (!v || typeof v !== 'number') return v;
  return new Date(v);
};

export const fromDate = (v: Date | undefined): number | undefined => v?.getTime();

export const toDateStr = (v: Date): string => {
// TODO fix
// YYYY-MM-DDTHH:mm:ss.sssZ
  return v.toISOString().replace(/T/, ' ').slice(0, 18);
};

export const toDayStr = (v: Date): string => {
  // TODO fix
  return v.toISOString().slice(0, 10);
};

export const validDayBeg = (v: Date) => {

  // TODO validate that v is start of a day

  return true;
};