(function () {
  "use strict";

  var dgram = require('dgram');

  function create(req, res) {
    var options = req.userOptions
      , udpWait = options.udpWait || 0
      , client = dgram.createSocket("udp4")
      , buffer = new Buffer(options.encodedBody)
      ;

    // TODO
    if (udpWait) {
      // startListener
    }

    function handleSent(err) {
      client.close();

      if (err) {
        req.emit('error', err);
        return;
      }

      req.emit('load');
      res.emit('load');
      /*
      req.status = 0;
      res.status = 0;
      */
    }

    client.send(
        buffer
      , 0
      , buffer.length
      , options.port
      , options.hostname
      , handleSent
    );
  }

  module.exports = create;
}());
