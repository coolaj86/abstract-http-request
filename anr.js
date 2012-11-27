/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true unused:true undef:true*/
(function () {
  "use strict";

  var util = require("util")
    , url = require('url')
    , events = require("events")
    , AnrRequest = require('./anr-request')
    , AnrResponse = require('./anr-response')
    , forEachAsync = require('forEachAsync')
    , anr
    , key
    ;

  function request(a, b, c, d, e) {
    var req = new Anr()
      ;

    return req.http(a, b, c, d, e);
  }

  function Anr() {
    var self = this
      ;

    if (!(this instanceof Anr)) {
      return request.appy(null, arguments);
    }

    events.EventEmitter.call(this);
    this._anr_proto_ = Anr.prototype;
    this._wares = [];
    this._request = new AnrRequest();
    this._response = new AnrResponse();
    this._futures = [];

    this._request.context = this._response.context = {};

    this.when = function (fn) {
      if (self._fulfilled) {
        fn(self._error, self._response, self._response.body);
      }
      self._futures.push(fn);

      return self;
    };

    self._response.on('_end', function () {
      self._futures.forEach(function (fn) {
        fn(this._error, this._response, this._response.body);
      }, self);
      self._fulfilled = true;
    });
  }

  util.inherits(Anr, events.EventEmitter);

  Anr.prototype.extend = function (fn) {
    if ('function' !== typeof fn) {
      console.error('extend fn:', fn);
      throw new Error('extend must receive a function');
    }
    fn(Anr);
    return this;
  };
  Anr.prototype.use = function () {
    var args = Array.prototype.slice.call(arguments)
      , fn
      , mount
      , host
      ;

    args.forEach(function (arg) {
      if ('function' === typeof arg) {
        fn = arg;
      } else if (/^\//.test(arg)) {
        mount = arg;
      } else if (/^\w+:/i.test(arg)) {
        host = arg;
      } else {
        throw new Error('Bad Argument ' + arg);
      }
    });

    // on('request', fn)
    this._wares.push([host, mount, fn]);
    return this;
  };
  Anr.prototype.for = function (type, fn) {
    if ('request' === type) {
      this._request.wares.push(fn);
    } else if ('response' === type) {
      this._response.wares.push(fn);
    } else {
      throw new Error('`for` can only accept functions for `request` and `response`.');
    }
  };
  // Unlike previous versions of AHR, this does not modify the original options
  Anr.prototype._parse = function (urlStr, options) {
    var self = this
      , urlObj
      , query
      ;

    options = options || {};
    if ('string' !== typeof urlStr) {
      options = urlStr;
    }

    urlStr = options.url || options.uri || urlStr;
    query = options.query || {};

    urlObj = url.parse(urlStr, true, true);
    urlObj.search = null;

    if (options.user || options.username || options.pass || options.password) {
      urlObj.auth = urlObj.auth || (options.user || options.username || '') + ':' + (options.pass || options.password || '');
    }

    Object.keys(query).forEach(function (key) {
      urlObj.query[key] = options.query[key];
    });
    options.query = null;

    Object.keys(urlObj).forEach(function (key) {
      var val = options[key]
        ;

      // don't replace something with '', undefined, null
      // but do replace for 0, false
      if (null === val || 'undefined' === typeof val || '' === val) {
        return;
      }

      urlObj[key] = options[key];
    });

    urlObj.body = options.body;
    urlObj.method = urlObj.method || 'get';

    self._options = urlObj;
  };
  Anr.prototype.http = function (urlStr, options) {
    console.log('[CORE] http');
    var self = this
      ;

    this._parse(urlStr, options);
    
    console.log('[CORE] wares');
    this._wares.forEach(function (ware) {
      var fn = ware[2]
        , mount = ware[1]
        , host = ware[0]
        , urlObj
        ;

      if (host) {
        urlObj = url.parse(host);
        host = urlObj.host || host;
        if (!(this._options.host||"").match(host)) {
          console.log('[WARE] host skip', host, this._options.host);
          return;
        }
      }

      if (mount && !(this._options.pathname||"").match(mount)) {
        console.log('[WARE] mount skip', mount, this._options.pathname);
        return;
      }

      console.log('[WARE] matched for ', host, mount, JSON.stringify(fn.toString().substr(0, 30)));
      fn(this);
    }, this);

    this._request.on('_start', function () {
      forEachAsync(self._request.wares, self._request._handleHandler, self._request).then(self._request._sendRequest);
    });

    this._request.on('_end', function () {
      console.log('loading request wares', self._response.wares);
      //self._response.headers['content-type'] = 'text/plain;charset=utf-8,';
      //this._response.emit('_start');
      forEachAsync(self._response.wares, self._response._handleHandler, self._response).then(self._response._endResponse);
    });

    this._request.emit('_start');
    return this;
  };
  Anr.prototype.send = function () {
    this._sendRequest();
  };
  Anr.prototype.end = function () {
    this._endResponse();
  };

  Anr.create = function (a, b, c) {
    return new Anr(a, b, c);
  };

  // Backwards compat trickery
  anr = Anr.create();
  anr.create = Anr.create;
  anr.Http = require('./http-shortcuts');
  anr.json = require('./http-json');
  anr.text = require('./http-text');
  anr.extend(anr.Http());

  function ahr(a, b, c, d, e) {
    return anr.http(a, b, c, d, e);
  }

  // copy over the prototype methods as well
  for (key in anr) {
    ahr[key] = anr[key];
  }

  module.exports = ahr;
}());
