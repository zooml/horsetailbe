import express, {Request, Response, NextFunction} from 'express';
import createError from 'http-errors';
import path from 'path';
import { logInfo} from './platform/logger';
import * as logger from './platform/logger';
import mongoose from 'mongoose';
import { InternalError, AppError } from './common/apperrs';
import * as users from './routes/users';
import * as orgs from './routes/orgs';
import * as accounts from './routes/accounts';
import * as sessions from './routes/sessions';
import * as siteaccts from './routes/siteaccts';
import cors from 'cors';
import * as session from './routes/session';
import * as authz from './routes/authz';

const app = express();

const pathPrefix = '/api/v1/'

// view engine setup TODO needed?????
// app.set('views', path.join(__dirname, 'views')); 
// app.set('view engine', 'pug');
app.enable('trust proxy');
app.disable('etag');
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV !== 'production') app.use(cors());

app.use(logger.middleware);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.use(session.middleware(pathPrefix));
app.use(authz.preMiddleware(pathPrefix));
app.use(pathPrefix + sessions.SEGMENT, sessions.router);
app.use(pathPrefix + users.SEGMENT, users.router);
app.use(pathPrefix + siteaccts.SEGMENT, siteaccts.router);
app.use(pathPrefix + orgs.SEGMENT, orgs.router);
app.use(pathPrefix + accounts.SEGMENT, accounts.router);
app.use(authz.postMiddleware(pathPrefix));

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) { // delegate to express
    return next(err);
  }
  if (err instanceof createError.HttpError) { // may be set by express
    res.status(err.statusCode);
    res.json({}); // TODO
  } else {
    let error = err;
    if (!(err instanceof AppError)) error = new InternalError(err); // not ours so it's unknown
    res.status(error.statusCode);
    if (error.statusCode != 403) { // don't send details of why forbidden
      res.json({
        code: error.code,
        message: error.message
      });
    }
  }
});

if (process.env.NODE_ENV !== 'test') {
  const dbUri = 'mongodb://localhost:27017/horsetaildb'; // TODO config
  mongoose
    .connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => logInfo('mongoose initialized'));
}

export default app;
