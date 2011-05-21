(function () {
  "use strict";

  require('bufferjs');

  var net = require('net')
    , fs = require('fs')
    , server;

  function acceptClient(client) {
    var data = [];
    client.on('data', function (chunk) {
      data.push(chunk);
      console.log(chunk.toString('utf8'));
    });
    client.on('end', function () {
      var alldata = Buffer.concat(data);
      fs.writeFileSync('log.bin', alldata);
    });
  }

  server = net.createServer(acceptClient);
  server.listen(9000);
}());
