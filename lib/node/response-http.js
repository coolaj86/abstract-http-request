/*jslint white: false, devel: true, onevar: true, undef: true, node: true, nomen: true, regexp: true, plusplus: true, bitwise: true, es5: true, newcap: true, strict: true, maxerr: 5 */
(function (undefined) {
  "use strict";

  require('bufferjs');

  var url = require('url')
    , utils = require('../utils')
    , parseJsonp = utils.parseJsonp
    , extend = utils.extend;

  // TODO NewEvent(type, size, total, data, chunk, err)
  function onResponse(req, res) {
    var data = []
      , response = res.nodeResponse
      , options = req.userOptions;

    function onRedirect() {
      // Redirect when requested
      options.href = response.headers.location;
      extend(options, url.parse(options.href));
      options.redirectCount += 1;
      if (options.headers) {
        delete options.headers.host;
      }

      // Seems to work just fine
      // TODO
      // XXX wrap loadstart, error, load, progress
      // TODO
      req.on = function () {};
      req.emit = function () {};
      req.nodeHttpRequest(req, res);
    }

    function onTimeout() {
      var err = new Error('timeout');
      res.error = err;
      res.cancelled = true;
      res.emit('error', err);
    }

    function onData(chunk) {
      clearTimeout(res.timeoutToken);
      res.timeoutToken = setTimeout(onTimeout, options.timeout);

      res.size += chunk.length;
      data.push(chunk);
      res.emit('data', chunk);
      res.emit('progress', {
          // TODO check the content-length if available
          lengthComputable: false
        , loaded: res.size
        , total: undefined
        , nodePart: chunk
      });
    }

    function onError(err) {
      res.emit('error', err);
    }

    function onEnd() {
      if (res.cancelled) {
        return;
      }

      // TODO try/catch to use https://github.com/bnoordhuis/node-buffertools
      data = Buffer.concat(data);

      clearTimeout(res.timeoutToken); // Clear request timeout

      if ('undefined' === typeof res.error && options.jsonp && data) {
        data = data.toString('utf8');
        data = parseJsonp(options.jsonpCallback, data);
      }

      // TODO this should go into a connect-like system
      // this will handle bad json headers such as javascript/ or x-json
      // but shouldn't match headers such as foobar/rajsonite
      if (/[^a-z]json\b/i.exec(res.headers['content-type'])) {
        try {
          data = JSON.parse(data.toString('utf8'));
        } catch(e) {
          res.emit('error', e);
          return;
        }
      }

      res.emit('load', {
          lengthComputable: true
        , loaded: data.length
        , total: data.length
        , target: {
            result: data
          }
      });
    }

    res.statusCode = response.statusCode;
    res.headers = response.headers;

    if (res.statusCode >= 400) {
      // Error on Error
      res.error = res.error || new Error(res.statusCode);
    } else if (response.statusCode >= 300 && 
                response.statusCode !== 304 && 
                response.headers.location &&
                options.followRedirect && 
                options.redirectCount < options.redirectCountMax) {
      return onRedirect();
    }

    // Set timeout for request
    res.timeoutToken = setTimeout(onTimeout, options.timeout);
    res.size = 0;

    // TODO use headers to determine size
    res.emit('loadstart', {});
    response.on('data', onData);
    response.on('error', onError);
    response.on('end', onEnd);
  }

  module.exports = onResponse;
}());
