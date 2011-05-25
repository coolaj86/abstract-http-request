(function () {
  "use strict";

  require('bufferjs');

  var http = require('http')
    , url = require('url')
    , fs = require('fs')
    , server;


  function cors(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-HTTP-Method-Override, X-Method-Override');
    next();
  }

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
      cors(request, response, function () {});
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
  console.log('http on 9000');
}());
