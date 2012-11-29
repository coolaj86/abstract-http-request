/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    , forEachAsync = require('forEachAsync')
    , http = require('http')
    , https = require('https')
    , p
    ;

  function AnrRequest(prequest, wares, context) {
    var me = this
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
      if (me._fulfilled) {
        fn(me._error, me.context._response, me.context._response.body);
      }
      me._futures.push(fn);

      return me;
    };
    this.on('pipe', function () {
      throw new Error('[AREQ] TODO implement `pipe`');
    });
  }

  // TODO stream
  util.inherits(AnrRequest, events.EventEmitter);

  p = AnrRequest.prototype;
  p.abort = function () {
    return this._nodeRequest.abort();
  };
  p.setTimeout = function (t, fn) {
    return this._nodeRequest.setTimeout(t, fn);
  };
  p._prequest = function () {
    var me = this
      ;

    // TODO get some callback for other todo
    process.nextTick(function () {
      forEachAsync(me.prequestWares, me._handleHandler, me).then(function () {
        console.log('[AREQ] handled prequest headers');
        process.nextTick(function () {
          me._sendHeaders();
          console.log('[AREQ] sent headers');
          // default to built-in write method
          forEachAsync(me.wares, me._handleHandler, me).then(me._defaultWrite);
        });
      });
    });
  };
  p._handleHandler = function (next, fn) {
    fn(this, next);
  };
  p.write = function (data, encoding) {
    // TODO allow some sort of transformation before actually writing.
    this.emit('data', data);
    return this._nodeRequest.write(data, encoding);
  };
  p.end = function (data, encoding) {
    var me = this
      ;

    if (data) {
      this.write(data, encoding);
    }
    return this._nodeRequest.end();
  };
  p._sendHeaders = function () {
    if (this._requestSent) {
      console.warn('already sent request');
      return;
    }

    var me = this
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
    me._nodeRequest = httpClient.request(options);
    me._nodeRequest.on('response', function (res) {
      console.log('[AREQ] loading response wares');
      me.context._response._start(res);
    });
    me._nodeRequest.on('error', function (err) {
      me.emit('error', err);
    });
    me._nodeRequest.on('timeout', function (err) {
      me.emit('timeout', err);
    });

    me._requestSent = true;
    console.log('[AREQ] Sent Request Headers');
    // TODO make stream writable at this point, but not before
  };
  p._defaultWrite = function () {
    console.log('[AREQ] default Write');
    // TODO progress for loaded
    var me = this
      , options = this.context._options
      ;

    if (null === options.body) {
      me.end();
      return;
    }

    if (undefined === options.body) {
      console.log('[AREQ] body not handled, waiting for req.end()');
      return;
    }

    if ('string' === typeof options.body || options.body instanceof Buffer) {
      me.end(options.body);
      return;
    }

    if ('function' === typeof options.body.pipe) {
      options.body.pipe(this).on('end', function () {
        me.end();
      });
      return;
    }

    me.end(JSON.stringify(options.body));
  };

  module.exports = AnrRequest;
}());
