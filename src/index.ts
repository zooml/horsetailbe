 import app from './app';
 import debugFn from 'debug';
 import http from 'http';
 import logger from './utils/logger';

 const debug = debugFn('horsetailbe:server');
 /**
  * Get port from environment and store in Express.
  */

 const port = normalizePort(process.env.PORT || '5000'); // TODO port???
 app.set('port', port);

 /**
  * Create HTTP server.
  */

 const server = http.createServer(app);

 /**
  * Listen on provided port, on all network interfaces.
  */

 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);

 /**
  * Normalize a port into a number, string, or false.
  */

 function normalizePort(val: any) {
   const port = parseInt(val, 10);

   if (isNaN(port)) {
     // named pipe
     return val;
   }

   if (port >= 0) {
     // port number
     return port;
   }

   return false;
 }

 /**
  * Event listener for HTTP server "error" event.
  */

 function onError(error: {[key: string]: any}) {
   if (error.syscall !== 'listen') {
     throw error;
   }

   const bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;

   // handle specific listen errors with friendly messages
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

 /**
  * Event listener for HTTP server "listening" event.
  */

 function onListening() {
   const addr = server.address();
   const bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr.port;
   debug('listening on ' + bind);
 }
