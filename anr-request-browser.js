/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true unused:true undef:true*/
(function () {
  "use strict";

  var inherits = require('./inherits')
    , url = require('url')
    , events = require('events')
    , forEachAsync = require('forEachAsync')
    , XMLHttpRequest = require('XMLHttpRequest')
    //, FormData = require('FormData')
    , p
      // only show error once per instantiation
    , headerExceptions = {}
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
    this.total = Infinity;
    this.loaded = 0;
    this._futures = [];
    this._requestCreated = false;
    this._requestSent = false;
    this._xhrData = "";

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
  inherits(AnrRequest, events.EventEmitter);

  p = AnrRequest.prototype;
  p.abort = function () {
    // NOTE: again, it's the response object that makes the request
    return this._xhrResponse.abort();
  };
  p.setTimeout = function (t, fn) {
    // http://www.w3.org/TR/XMLHttpRequest/#the-timeout-attribute
    this._xhrResponse.timeout = t;
    this._xhrResponse.on('timeout', fn);
  };
  p._prequest = function () {
    var me = this
      ;

    // TODO get some callback for other todo
    forEachAsync(me.prequestWares, me._handleHandler, me).then(function () {
      console.log('[AREQ] handled prequest headers');
      process.nextTick(function () {
        me._sendHeaders();
        console.log('[AREQ] sent headers');
        // default to built-in write method
        forEachAsync(me.wares, me._handleHandler, me).then(me._defaultWrite);
      });
    });
  };
  p._handleHandler = function (next, fn) {
    console.log('[AREQ] handling a request handler...');
    fn(this, next);
  };
  p.write = function (data, encoding) {
    // NOTE: If a module wants to do some sort of transformation before actually
    // writing the data, it can overload this write function:
    // var origWrite = req.write;
    // req.write = function (chunk) { origWrite.apply(req, chunk); }
    // TODO handle binary buffers
    this._xhrData += data;

    // NOTE: technically this should return false
    // However, since it all buffers until send and then buffers out
    // it returns true to prevent pipe / drain / pause / resume hangups
    return true;
  };
  p.end = function (data, encoding) {
    var me = this
      ;

    if (me._requestSent) {
      console.error('Request already sent');
      return;
    }

    if (data) {
      this.write(data, encoding);
    }

    // TODO do any binary buffer concatonation
    me._requestSent = true;
    me._xhrResponse.send(me._xhrData);
  };
  // TODO rename this to createRequest or something.
  // XHR sends headers and data all at once (abstracted by the browser)
  p._sendHeaders = function () {
    var me = this
      , options = this.context._options
      ;

    if (this._requestCreated) {
      console.warn('already sent request');
      return;
    } else {
      this._requestCreated = true;
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

    // http://w3.org/TR/XMLHttpRequest/#event-handlers
    // http://w3.org/TR/XMLHttpRequest/#events
    /*
     * readystatechange
     *
     * loadstart
     * progress
     * abort
     * error
     * load
     * timeout
     * loadend
     */
    // html5rocks.com/en/tutorials/file/xhr2/

    // NOTE: xhrResponse is the request object for historical reasons.
    me._xhrResponse = new XMLHttpRequest();
    me._xhrResponse.on = me._xhrResponse.addEventListener;
    me._xhrResponse.on('progress', function () {
      if (!me.context.loadstarted) {
        me.context.loadstarted = true;
        me.context._response._start(me._xhrResponse);
      }
    });

    me._xhrRequest = me._xhrResponse.upload;
    me._xhrRequest.on = me._xhrRequest.addEventListener;
    me._xhrRequest.on('loadstart', function (err) {
      me.emit('error', err);
    });
    me._xhrRequest.on('progress', function (ev) {
      me.lengthComputable = ev.lengthComputable;
      me.loaded = ev.loaded;
      me.total = ev.total;
      me.emit('progress', ev);
    });
    me._xhrRequest.on('abort', function () {
      me.emit('abort');
    });
    me._xhrRequest.on('error', function (ev) {
      // TODO abstract error into a real error
      me.emit('error', ev);
    });
    me._xhrRequest.on('load', function () {
      me.emit('load');
      me.emit('end');
    });
    me._xhrRequest.on('timeout', function () {
      me.emit('timeout');
    });
    me._xhrRequest.on('loadend', function () {
      me.emit('loadend');
    });

    options.href = url.format(options);
    // NOTE: just in case href was added but the host is the current host
    if (options.protocol && (!options.host && !options.hostname)) {
      options.href = options.href.replace(/^[\w\-]*:/, '');
    }

    if (options.auth) {
      options.authArr = options.auth.substr(':');
      me._xhrResponse.open(options.method, options.href, true, options.authArr[0], options.authArr[1]);
    } else {
      me._xhrResponse.open(options.method, options.href, true);
    }
    // TODO settable withcredentials
    //me._xhrResponse.withCredentials = true;
    Object.keys(options.headers).forEach(function (key) {
      try {
        me._xhrResponse.setRequestHeader(key, options.headers[key]);
      } catch(e) {
        if (headerExceptions[key]) {
          return;
        }

        console.error("Could not set header '" + key + "' to '" + options.headers[key] + "'");
        console.error(e);
        headerExceptions[key] = true;
      }
    });
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

    if ('function' === typeof options.body.pipe) {
      options.body.pipe(this).on('end', function () {
        me.end();
      });
      return;
    }

    if (('string' === typeof options.body)) { // || (options.body instanceof Buffer)) {
      me.end(options.body);
      return;
    }

    // takes care of Object, Array, Boolean, and Number
    me.end(JSON.stringify(options.body));
  };

  module.exports = AnrRequest;
}());
