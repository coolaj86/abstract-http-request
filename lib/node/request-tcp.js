/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var net = require('net');

  // TODO AHR2 style options parsing
  function create(req, res) {
    var options = req.userOptions
      , socket
      ;

    function onRequestError(err) {
      req.isComplete = true;
      req.emit('error', err);
      socket.destroy();
    }

    function onResponseError(err) {
      req.isComplete = true;
      res.emit('error', err);
      socket.destroy();
    }

    function onRequestDrain() {
      socket.removeListener('error', onRequestError);
      socket.on('error', onResponseError);
      req.isComplete = true;
      req.emit('load', {});
    }

    function onConnect() {
      req.emit('progress', {});

      socket.end(options.encodedBody);
      socket.on('drain', onRequestDrain);
    }


    socket = new net.Socket({
        allowHalfOpen: false
    //  , fd: null
    //  , type: null
    });

    socket.on('error', onRequestError);

    socket.on('data', function (chunk) {
      res.emit('progress', { target: { result: chunk } });
    });

    socket.on('close', function () {
      res.status = 200;
      if (!res.isComplete) {
        res.isComplete = true;
        res.emit('load', {});
      }
    });
    socket.on('end', function () {
      res.status = 200;
      if (!res.isComplete) {
        res.isComplete = true;
        res.emit('load', {});
      }
    });


    // makes a request as a client
    socket.setTimeout(10 * 1000, function () {
      if (!req.isComplete) {
        req.emit('timeout', {});
      } else {
        res.emit('timeout', {});
      }
      socket.destroy();
    });
    socket.connect(options.port, options.hostname, onConnect);

    return res;
  }

  module.exports = create;
}());
