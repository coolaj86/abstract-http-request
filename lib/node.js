/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
    require = function () {},
    module = {},
*/
"use strict";
// TODO extendURL
(function () {
  var http = require('http'),
    url = require('url'),
    Futures = require('futures');

  // TODO wrap streaming
  module.exports  = function (options) {
    var opts, client, request,
      p = Futures.promise();
    opts.secure = false;
    opts.default_protocol = 'http';
    opts.default_port = '80';
    opts.default_host = 'localhost';
    opts.default_header = {"Content-Type": options.contentType};
    

    // Parse URL
    opts = url.parse(options.url);
    if ('https' === opts.protocol || '443' === opts.port || true === options.secure) {
      opts.secure = true;
      opts.default_protocol = 'https';
      opts.default_port = '443';
    }
    opts.protocol = opts.protocol || opts.default_protocol;
    opts.port = opts.port || opts.default_port;
    opts.host = opts.host || opts.default_host;
    opts.default_header['Host'] = opts.host;
    // underextend


    // Create Connection
    client = http.createClient(opts.port, opts.host, opts.secure);


    // Create Request
    options.url = opts.pathname + opts.search;
    options.url = extendUrl(options.url, options.params);
    request = client.request(options.type, options.path, options.headers || options.default_header);
    // Transfer-Encoding: chunked.
    // Content-Length: N
    request.end(options.data);

    request.on('response', function (response) {
      var data = '', err = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('error', function (chunk) {
        err = chunk;
        console.log('ERR: ' + chunk);
      });
      response.on('end', function (chunk) {
        if (response.statusCode && response.statusCode >= 400) {
          err = err || response.statusCode;
        }
        p.fulfill(err, data, response);
      });
    });
    return p;
  };
  //provide('ahr-node');
}());
