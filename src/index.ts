 import app from './app';
 import http from 'http';
 import logger from './controllers/logger';

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

 const onError = (error: {[key: string]: any}) => {
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
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  logger.info('listening on ' + bind);
}

const port = normalizePort(process.env.PORT || '5000'); // TODO port???
 app.set('port', port);

 const server = http.createServer(app);

 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);