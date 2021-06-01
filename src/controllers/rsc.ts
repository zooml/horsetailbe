import { isObj } from "../common/validator";
import { CastError, ExtraFldsError } from "../common/apperrs";

export type Def = {
  [key: string]: (v: any) => void;
}

export const validator = (rsc: Def, path: string | undefined, o: {[key: string]: any}) => {
  // go through all possible keys
  if (!isObj(o)) throw new CastError(path ?? '', '<not object>');
  let found = 0;
  for (const [key, vtor] of Object.entries(rsc)) {
    const v = o[key];
    vtor(v);
    if (v) ++found; // if v undefined then v was not required
  }
  // check if any extra keys in input
  const oKeys = Object.keys(o);
  if (found != oKeys.length) { // extra fld, find out which one
    for (const key of oKeys) {
      if (!(key in rsc)) throw new ExtraFldsError(key);
    }
  }
}

