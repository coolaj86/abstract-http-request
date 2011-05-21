(function () {
  "use strict";

  require('bufferjs');

  var http = require('http')
    , fs = require('fs')
    , server;

  function requestListener(request, response) {
    var data = [];
    request.on('data', function (chunk) {
      data.push(chunk);
      console.log(chunk.toString('utf8'));
    });
    request.on('end', function () {
      var str = Buffer.concat(data).toString('utf8');
      response.write("Upload in progress...err... done");
      fs.writeFileSync('http.body.dat', str);
      response.end();
    });
  }

  server = http.createServer(requestListener);
  server.listen(9000);
}());
