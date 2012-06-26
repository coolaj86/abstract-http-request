/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require("util")
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
    this._requestWares = [];
    this._responseWares = [];
    this._futures = [];
    this._request = new AnrRequest();
    this._response = new AnrResponse();

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
      this._requestWares.push(fn);
    } else if ('response' === type) {
      this._responseWares.push(fn);
    } else {
      throw new Error('`for` can only accept functions for `request` and `response`.');
    }
  };
  Anr.prototype.http = function (options) {
    var self = this
      ;

    console.log('http');
    
    console.log(this._wares);
    this._wares.forEach(function (ware) {
      var fn = ware[2]
        , mount = ware[1]
        , host = ware[0]
        ;

      if (host && /*!this._options.match*/ false) {
        return;
      }

      if (mount && /*!this._options.match*/ false) {
        return;
      }

      fn(this);
    }, this);

    this._request.on('_start', function () {
      forEachAsync(self._requestWares, self._handleRequestHandler, self).then(self._sendRequest);
    });
    this._request.on('_end', function () {
      console.log('loading request wares', self._responseWares);
      self._response.headers['content-type'] = 'text/plain;charset=utf-8,';
      forEachAsync(self._responseWares, self._handleResponseHandler, self).then(self._endResponse);
      //this._request.emit('_start');
      process.nextTick(function () {
        self._response.emit('data', "hello world");
        process.nextTick(function () {
          self._response.emit('end');
        });
      });
    });

    this._request.emit('_start');
  };
  Anr.prototype._endResponse = function () {
    // TODO actually handle response
    console.log('endResponse', this._response);
    this._response.emit('_end');
  };
  Anr.prototype._sendRequest = function () {
    // TODO actually handle request
    console.log('request sending [fake]');
    this._request.emit('_end');
  };
  Anr.prototype.send = function () {
    this._sendRequest();
  };
  Anr.prototype.end = function () {
    this._endResponse();
  };
  Anr.prototype._handleRequestHandler = function (next, fn) {
    fn(this._request, next);
  };
  Anr.prototype._handleResponseHandler = function (next, fn) {
    console.log('handling a response handler...');
    fn(this._response, next);
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
