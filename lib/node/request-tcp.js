(function () {
  "use strict";

  var net = require('net');

  // TODO AHR2 style options parsing
  function create(req, res) {
    var options = req.userOptions
      , socket
      ;

    function onRequestError(err) {
      req.emit('error', err);
    }

    function onResponseError(err) {
      res.emit('error', err);
    }

    function onRequestDrain() {
      socket.removeListener('error', onRequestError);
      socket.on('error', onResponseError);
      req.emit('load');
      req.isComplete = true;
    }

    function onConnect() {
      req.emit('progress', {});

      socket.end(options.encodedBody);
      socket.on('drain', onRequestDrain);

      // same default timeout as http
      socket.setTimeout(options.timeout || 120 * 1000, function () {
        socket.destroy();

        if (!req.isComplete) {
          req.emit('timeout');
        } else {
          res.emit('timeout');
        }
      });
    }


    socket = new net.Socket({
        allowHalfOpen: true
    //  , fd: null
    //  , type: null
    });

    socket.on('error', onRequestError);

    socket.on('data', function (chunk) {
      res.emit('progress', { target: { result: chunk } });
    });

    socket.on('end', function () {
      res.status = 200;
      res.emit('load', {});
    });


    // makes a request as a client
    socket.connect(options.port, options.hostname, onConnect);
  }

  module.exports = create;
}());
