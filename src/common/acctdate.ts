const dayBegEndStr = '00:00:00.000Z';

// TODO fix beg of day!!!!!!!
export const toBegOfDay = (d: Date) => {
  const s = d.toISOString().slice(0, -dayBegEndStr.length);
  return new Date(s + dayBegEndStr);
}

// TODO cannot determine today since it depends on timezone???
export const begToday = () => toBegOfDay(new Date());

export const toDate = (v: any): any => {
  if (!v || typeof v !== 'number') return v; // ignores type errors
  return new Date(v);
};

export const fromDate = (v: Date | undefined): number | undefined => v?.getTime();

export const toDateStr = (v: Date): string => {
  // YYYY-MM-DDTHH:mm:ss.sssZ
  const s = v.toISOString();
  if (s.endsWith(dayBegEndStr)) return s.substring(0, 10);
  return s.slice(0, 19).replace('T', ' ');
};

export const toDayStr = (v: Date): string => v.toISOString().slice(0, 10);

export const validDayBeg = (v: Date) => v.toISOString().endsWith(dayBegEndStr);