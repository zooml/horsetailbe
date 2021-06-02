import winston, {LogEntry} from 'winston';
import rTracer from 'cls-rtracer';
import {Request, Response, NextFunction} from 'express';
// TODO import requestStats from 'request-stats'; or 'npm r'

const logger = winston.createLogger({
  format: winston.format.json(),
  exitOnError: false,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

if (process.env.NODE_ENV === 'production') {
  // new winston.transports.File({ filename: 'combined.log' }),
  logger.add(new winston.transports.Console()); // TODO file???
} else {
  logger.add(new winston.transports.Console());
}

const log = (msg: string | {[k: string]: any}, level: string, res?: Response) => {
  const params: {[k: string]: any} = typeof(msg) === 'string' ? {message: msg, level} : {...msg, level};
  if (res) {
    res.locals.logger.log(params);
  } else {
    const rId = rTracer.id();
    if (rId) params.rId = rId;
    logger.log(params as LogEntry);
  }
};

export const logError = (msg: string | {[k: string]: any}, res?: Response) => log(msg, 'error', res);
export const logWarn = (msg: string | {[k: string]: any}, res?: Response) => log(msg, 'warn', res);
export const logInfo = (msg: string | {[k: string]: any}, res?: Response) => log(msg, 'info', res);
export const logDebug = (msg: string | {[k: string]: any}, res?: Response) => log(msg, 'debug', res);
export const logRes = (res: Response) => {
  const meta = {status: res.status, ms: Date.now() - res.locals.date};
  // TODO size
  logInfo(meta, res);
}

export const middleware = [
  rTracer.expressMiddleware(),
  (req: Request, res: Response, next: NextFunction) => {
    const rId = rTracer.id()
    const rlog = logger.child({rId});
    let baseUrl = req.baseUrl;
    if (!baseUrl || baseUrl === '/') baseUrl = '';
    logInfo({method: req.method, path: `${baseUrl}${req.path}`, params: req.params, ip: req.ip});
    res.locals.logger = rlog;
    res.locals.date = Date.now();
    res.set('X-Request-Id', `${rId}`);
    next();
  }
];

export default logger;