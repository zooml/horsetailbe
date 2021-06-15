export const PATH_PREFIX = '/api/v1/';

export const testAt = (v: number) => {
  const at = Date.now();
  const past = at - 10000;
  return past < v && v < at;
};

export const testAts = (v: {at: number, upAt: number}) => {
  return testAt(v.at) && testAt(v.upAt);
};
