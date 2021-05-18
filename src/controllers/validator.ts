import { MaxError, ValueError } from './errors';
import limits from './limits';

const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;

export default (o: {[key: string]: any}) => {
  if (o.email && !emailRegex.test(o.email.toString())) throw new ValueError('email', o.email, 'invalid format');
  if (o.note && limits.fields.note.max < o.note.length) throw new MaxError('note', limits.fields.note.max);  

  // TODO name, fName, lName, email len
};