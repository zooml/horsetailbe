import { Request } from 'express';
import { CastError, MissingError } from '../common/apperrs';

const qryext = (req: Request, k: string): string | undefined => {
  const v = req.query[k];
  if (v === undefined) return undefined;
  if (typeof v !== 'string') {
    // string | ParsedQs | string[] | ParsedQs[]
    throw new CastError(`${k} query param`);
  }
  return v;
};

export default qryext;