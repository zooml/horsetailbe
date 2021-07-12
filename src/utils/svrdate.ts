const sUtcDayBegEnd = '00:00:00.000Z';

export const toDate = (v: any): any => {
  if (!v || typeof v !== 'number') return v; // ignores type errors
  return new Date(v);
};

export const fromDate = (v: Date): number => v.getTime();

export const toDateStr = (v: Date): string => {
  // YYYY-MM-DDTHH:mm:ss.sssZ
  const s = v.toISOString();
  if (s.endsWith(sUtcDayBegEnd)) return s.substring(0, 10);
  return s.slice(0, 19).replace('T', ' ');
};

