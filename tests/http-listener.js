(function () {
  "use strict";

  require('bufferjs');

  var http = require('http')
    , url = require('url')
    , fs = require('fs')
    , server;


  function jsonp(req, res) {
    var urlObj = url.parse(req.url, true)
      , jsonpCallback = urlObj.query.jsonp;

    res.end(jsonpCallback + '(' + JSON.stringify(urlObj.query) + ')');
  }

  function echoTests(request, response) {
  }

  function uploadTests(request, response) {
    response.write("Upload in progress...err... done");
    fs.writeFileSync('http.body.dat', request.body);
    response.end();
  }

  function requestListener(request, response) {
    var data = [];

    function concat(chunk) {
      data.push(chunk);
    }

    function route() {
      if (data.length) {
        request.body = Buffer.concat(data).toString('utf8');
      }

      if (request.url.match(/jsonp=/)) {
        return jsonp(request, response);
      }

      if (request.url.match('/echo-tests')) {
        return echoTests(request, response);
      }

      return uploadTests(request, response);
    }

    request.on('data', concat);
    request.on('end', route);
  }

  server = http.createServer(requestListener);
  server.listen(9000);
}());
