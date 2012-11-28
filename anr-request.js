/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    , forEachAsync = require('forEachAsync')
    , http = require('http')
    , https = require('https')
    ;

  function AnrRequest(prequest, wares, context) {
    var self = this
      ;

    events.EventEmitter.call(this);

    this.context = context;
    this.accept = [];
    this.headers = {};
    this.prequestWares = prequest;
    this.wares = wares;
    this._futures = [];
    this.total = Infinity;
    this.loaded = 0;
    this.when = function (fn) {
      if (self._fulfilled) {
        fn(self._error, self.context._response, self.context._response.body);
      }
      self._futures.push(fn);

      return self;
    };
    this.on('pipe', function () {
      throw new Error('[AREQ] TODO implement `pipe`');
    });
  }

  // TODO stream
  util.inherits(AnrRequest, events.EventEmitter);

  AnrRequest.prototype.abort = function () {
    return this._nodeRequest.abort();
  };
  AnrRequest.prototype.setTimeout = function (t, fn) {
    return this._nodeRequest.setTimeout(t, fn);
  };
  AnrRequest.prototype._prequest = function () {
    var self = this
      ;

    // TODO get some callback for other todo
    process.nextTick(function () {
      forEachAsync(self.prequestWares, self._handleHandler, self).then(function () {
        console.log('[AREQ] handled prequest headers');
        process.nextTick(function () {
          self._sendHeaders();
          console.log('[AREQ] sent headers');
          // default to built-in write method
          forEachAsync(self.wares, self._handleHandler, self).then(self._defaultWrite);
        });
      });
    });
  };
  AnrRequest.prototype._handleHandler = function (next, fn) {
    fn(this, next);
  };
  AnrRequest.prototype.write = function (data, encoding) {
    // TODO allow some sort of transformation before actually writing.
    this.emit('data', data);
    return this._nodeRequest.write(data, encoding);
  };
  AnrRequest.prototype.end = function (data, encoding) {
    var self = this
      ;

    if (data) {
      this.write(data, encoding);
    }
    return this._nodeRequest.end();
  };
  AnrRequest.prototype._sendHeaders = function () {
    if (this._requestSent) {
      console.warn('already sent request');
      return;
    }

    var self = this
      , httpClient
      , options = this.context._options
      ;

    // TODO handle accept headers
    if (options.secure) {
      httpClient = https;
    } else {
      httpClient = http;
    }

    /*
     * host
     * hostname
     * port
     * localAddress
     * socketPath
     * method
     * path
     * headers
     * auth
     * agent
     */
    self._nodeRequest = httpClient.request(options);
    self._nodeRequest.on('response', function (res) {
      console.log('[AREQ] loading response wares');
      self.emit('response', self.context._response);
      self.context._response._start(res);
    });
    self._nodeRequest.on('error', function (err) {
      self.emit('error', err);
    });
    self._nodeRequest.on('timeout', function (err) {
      self.emit('timeout', err);
    });

    self._requestSent = true;
    console.log('[AREQ] Sent Request Headers');
    // TODO make stream writable at this point, but not before
  };
  AnrRequest.prototype._defaultWrite = function () {
    console.log('[AREQ] default Write');
    // TODO progress for loaded
    var self = this
      , options = this.context._options
      ;

    if (null === options.body) {
      self.end();
      return;
    }

    if (undefined === options.body) {
      console.log('[AREQ] body not handled, waiting for req.end()');
      return;
    }

    if ('string' === typeof options.body || options.body instanceof Buffer) {
      self.end(options.body);
      return;
    }

    if ('function' === typeof options.body.pipe) {
      options.body.pipe(this).on('end', function () {
        self.end();
      });
      return;
    }

    self.end(JSON.stringify(options.body));
  };

  module.exports = AnrRequest;
}());
