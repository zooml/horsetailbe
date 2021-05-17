import express, {Request, Response, NextFunction} from 'express';
import createError from 'http-errors';
import path from 'path';
import logger, {loggerMiddleware} from './controllers/logger';
import mongoose from 'mongoose';
import {AppError, ServerError, NotFound} from './controllers/errors';
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import orgsRouter from './routes/orgs';
import accountsRouter from './routes/accounts';
import sessionsRouter from './routes/sessions';
import cors from 'cors';
import { sessionMiddleware } from './controllers/session';

const app = express();

const pathPrefix = '/api/v1/'

// view engine setup TODO needed?????
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.enable('trust proxy');

app.use(loggerMiddleware);

if (process.env.NODE_ENV !== 'production') app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware(pathPrefix));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.use(pathPrefix, indexRouter);
app.use(pathPrefix + 'sessions', sessionsRouter);
app.use(pathPrefix + 'users', usersRouter);
app.use(pathPrefix + 'orgs', orgsRouter);
app.use(pathPrefix + 'accounts', accountsRouter);

// default: 'no api' 404 and forward to error handler
app.use((req, res, next) => next(new NotFound(req.path)));

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
    if (!(err instanceof AppError)) error = new ServerError(err); // not ours so it's unknown
    res.status(error.statusCode);
    res.json({
      code: error.code,
      message: error.message
    });
    }
});

// TODO use debug() https://github.com/visionmedia/debug#readme

// TODO config
mongoose
	.connect("mongodb://localhost:27017/horsetaildb", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
	.then(() => logger.info('mongoose initialized'));

export default app;
