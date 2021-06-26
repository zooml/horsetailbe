import mongoose, { Schema } from 'mongoose';
import { trimOrUndef } from '../utils/util';
import * as doc from './doc';
import * as desc from './desc';
import bcrypt from 'bcrypt';
import { CredentialsError, UserNotActive } from '../controllers/errors';

export const NAME = 'User';

const SObjectId = Schema.Types.ObjectId;

export type State = {
  readonly id: number,
  readonly tag: string
};

export const STATES: {[k: string]: State} = Object.freeze({
  SIGNED_UP: {id: 1, tag: 'signedup'},
  WAIT_CONF: {id: 2, tag: 'waitconf'},
  ACTIVE: {id: 3, tag: 'active'},
  SUSPENDED: {id: 4, tag: 'suspended'},
  DELETED: {id: 5, tag: 'deleted'},
});

export type CFlds = {
  email: string;
  ePswd: string;
  fName: string;
  lName?: string;
  st: number;
  readonly opts: {[k: string]: any};
  readonly desc: desc.Flds;
};

export type Flds = doc.Flds & CFlds;

export type Doc = doc.Doc & Flds;

// export function model<T>(name: string, schema?: Schema<any>, collection?: string, skipInit?: boolean): Model<T>;
// export function model<T, U extends Model<T, TQueryHelpers, any>, TQueryHelpers = {}>(
//   name: string,
//   schema?: Schema<T, U>,
//   collection?: string,
//   skipInit?: boolean
// ): U;
// interface Model<T, TQueryHelpers = {}, TMethods = {}> extends NodeJS.EventEmitter, AcceptsDiscriminator {
//   new(doc?: T | any): EnforceDocument<T, TMethods>;
//   count(filter: FilterQuery<T>, callback?: (err: any, count: number) => void): QueryWithHelpers<number, EnforceDocument<T, TMethods>, TQueryHelpers>;
//   create(docs: (T | DocumentDefinition<T> | AnyObject)[], options?: SaveOptions): Promise<EnforceDocument<T, TMethods>[]>;
// class Document<T = any, TQueryHelpers = any> {
//   constructor(doc?: T | any);
//   /** This documents _id. */
//   _id?: T;
// class Schema<DocType = Document, M extends Model<DocType, any, any> = Model<any, any, any>, SchemaDefinitionType = undefined> extends events.EventEmitter {
//   constructor(definition?: SchemaDefinition<DocumentDefinition<SchemaDefinitionType>>, options?: SchemaOptions);

// Model: findOne(filter?: FilterQuery<T>, projection?: any | null, options?: QueryOptions | null, callback?: (err: CallbackError, doc: EnforceDocument<T, TMethods> | null) => void)
//          : QueryWithHelpers<EnforceDocument<T, TMethods> | null, EnforceDocument<T, TMethods>, TQueryHelpers>;
// type EnforceDocument<T, TMethods> = T extends Document ? T : T & Document & TMethods;
// type QueryWithHelpers<ResultType, DocType extends Document, THelpers = {}> = Query<ResultType, DocType, THelpers> & THelpers;
// class Query<ResultType, DocType extends Document, THelpers = {}> {
//   /** Executes the query */
//   exec(): Promise<ResultType>;

const schema = new Schema<Flds, mongoose.Model<Flds>>({
  email: {type: String, required: true, trim: true},
  ePswd: {type: String, required: true, trim: true},
  fName: {type: String, required: true, trim: true},
  lName: {type: String, trim: true},
  st: {type: Number, required: true},
  opts: {type: Object, required: true},
  desc: { // desc.Doc schema
    uId: {type: SObjectId, ref: NAME, required: false}, // only not required when self registering
    note: {type: String, trim: true},
    id: {type: String, trim: true},
    url: {type: String, trim: true}
  }
}, {timestamps: {createdAt: 'at', updatedAt: 'upAt'}});

schema.index({email: 1}, {unique: true});

const model = mongoose.model<Flds>(NAME, schema);

const salts = 10;

export const encryptPswd = async (pswd: string) => {
  const s = trimOrUndef(pswd);
  return await bcrypt.hash(pswd, salts); // salt is in hash
}

const isMatchingPswd = async (pswd: string, ePswd: string) => await bcrypt.compare(pswd, ePswd);

export const authn = async (email: string, pswd: string): Promise<Doc | undefined> => doc.op(async () => {
  const user = await model.findOne({email});
  if (!user || !await isMatchingPswd(pswd, user.ePswd)) throw new CredentialsError();
  if (user.st !== STATES.ACTIVE.id) throw new UserNotActive();
  return user;
});

export const create = async (f: CFlds): Promise<Doc> => doc.op(async () =>
  model.create(f));

export const findById = async (id: doc.ObjId): Promise<Doc | undefined> => doc.op(async () =>
  model.findById(id));

export const activeExists = async (id: doc.ObjId): Promise<boolean> => doc.op(async () =>
  model.exists({_id: id, st: STATES.ACTIVE.id}));