import app from './app';
import http from 'http';
import logger, { logInfo } from './controllers/logger';
import requestStats from 'request-stats';

const normalizePort = (val: any) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) { // named pipe
    return val;
  }
  if (port >= 0) { // port number
    return port;
  }
  return false;
}

const port = normalizePort(process.env.PORT || '5000'); // TODO port???
app.set('port', port);

const server = http.createServer(app).listen(port);
server.on('error', (error: {[key: string]: any}) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
     logger.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  logger.info('listening on ' + bind);
});
requestStats(server).on('complete', (o: requestStats.Stats) => 
  logInfo({status: o.res.status, ms: o.time, reqSz: o.req.bytes, resSz: o.res.bytes}));

export default server;