/*jslint white: false, devel: true, onevar: true, undef: true, node: true, nomen: true, regexp: true, plusplus: true, bitwise: true, es5: true, newcap: true, strict: true, maxerr: 5 */
(function (undefined) {
  "use strict";

  require('bufferjs');

  var url = require('url')
    , http = require('http')
    , https = require('https')
    , FormData = require('file-api').FormData
    , FormContent = require('./form-content').FormContent
    , addParamsToUri = require('./uri-encoder').addParamsToUri
    , nodeFileClient = require('./node-file-client')
    , nodeHttpResponse = require('./node-response')
    , utils = require('./utils')
    , parseJsonp = utils.parseJsonp
    , preset = utils.preset
    , extend = utils.extend
    , globalHeaders
    , globalOptions;


  globalOptions = {
    redirectCountMax: 3
  };

  globalHeaders = {
    'user-agent': 'Node.js (AbstractHttpRequest v2)'
  };

  function nodeHttpClient(req, res) {
    var requestOptions
      , options = req.userOptions
      , ev
      , size = 0
      , request
      , httpClient;

    // ECONNECT, EPARSE
    function onRequestError(err) {
      clearTimeout(req.timeoutToken); // Clear connection timeout
      req.cancelled = true;
      req.emit('error', err);
    }

    // Set timeout for initial contact of server
    function onRequestTimeout() {
      req.cancelled = true;
      req.emit('error', new Error('timeout'));
    }

    function makeRequest() {
      var encodedBody = options.encodedBody
        , bodyStream;

      function clientRequest() {
        // TODO handle at `send` entrypoint
        requestOptions = {
          host: options.hostname,
          port: options.port,
          path: options.requestPath,
          method: options.method,
          headers: options.headers
        };

        // TODO might this be better elsewhere?
        requestOptions.headers.host = requestOptions.host
        if (80 !== parseInt(requestOptions.port) && 443 !== parseInt(requestOptions.port)) {
          requestOptions.headers.host += ':' + requestOptions.port
        }

        // TODO move options.ssl setting to options handler
        // create Connection, Request
        httpClient = (options.ssl || 'https:' === options.protocol) ? https : http;
        request = httpClient.request(requestOptions, function (response) {
          var ev = {};
          if (req.nodeData) {
            ev.lengthComputable = true;
            ev.loaded = req.nodeData.length;
            ev.total = req.nodeData.length;
          }
          req.emit('load', ev);
          clearTimeout(req.timeoutToken);
          req.nodeHttpRequest = nodeHttpClient;
          res.nodeResponse = response;
          nodeHttpResponse(req, res);
        });
        request.on('error', onRequestError);

        req.nodeRequest = request;
        req.headers = request.headers;
        req.emit('loadstart', {});
      }

      function sendBody() {
        // TODO stream
        clientRequest();
        bodyStream.on('progress', function (ev) {
          req.emit('progress', ev);
        });
        bodyStream.on('load', function (ev) {
          var data;
          if (ev && ev.target) {
            data = ev.target.result;
          } else {
            data = ev;
          }
          request.end(data);
          req.nodeData = data;
          req.emit('progress', {
              lengthComputable: true
            , loaded: data.length
            , total: data.length
            , target: {
              result: data
            }
          });
        });
      }

      if (!encodedBody) {
        clientRequest();
        request.end();
        return;
      }

      if (encodedBody instanceof FormData) {
        // Chunked encoding is off by default because:
        //   * If the body is a stream, we can't compute the length
        //   * Many (prehaps most) webservers don't support client-side chunked encoding
        encodedBody.setNodeChunkedEncoding(options.chunked);
           // TODO .nodeSetChunkedEncoding(options.chunked);
        // TODO pass in headers instead of nodeGetContentType?
        bodyStream = encodedBody.serialize();
        // must get boundary, etc
        options.headers["Content-Type"] = encodedBody.getContentType();
                                              // TODO .nodeGetContentType();
      } else {
        bodyStream = new FormContent(encodedBody).serialize();
                                         // TODO .nodeSerialize();
      }

      // TODO document and use forceChunked
      if (options.chunked) {
        // Node sets this by default
        options.headers['Transfer-Encoding'] = 'chunked';
        delete options.headers["Content-Length"];
        sendBody();
      } else {
        bodyStream.on('size', function (size) {
          options.headers["Content-Length"] = size;
          delete options.headers['Transfer-Encoding'];
          sendBody();
        }); 
      }
    }

    req.timeoutToken = setTimeout(onRequestTimeout, options.timeout);
    
    makeRequest();

    return res;
  }

  function send(req, res) {
    var options = req.userOptions;

    if ('file:' === options.protocol) {
      return nodeFileClient(req, res);
    }

    if (options.jsonp) {
      options.stream = undefined;
      delete options.stream;
    }

    options.requestPath = addParamsToUri(options.pathname + (options.search || ''), options.params || {});

    preset(options.headers, globalHeaders);
    if (options.auth) {
      options.headers.authorization = 'Basic ' + (new Buffer(options.auth, 'utf8')).toString('base64');
    }

    // TODO json stream parser
    // TODO json streaming stringifier
    return nodeHttpClient(req, res);
  }

  module.exports = send;
}());
