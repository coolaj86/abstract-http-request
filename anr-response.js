/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    , forEachAsync = require('forEachAsync')
    ;

  function AnrResponse(wares, context) {
    var self = this
      ;

    events.EventEmitter.call(this);

    this.context = context;
    // no modification
    this._headers = {};
    // lowercase
    this.headers = {};
    this.wares = wares;
    this.total = Infinity;
    this.loaded = 0;
    this.statusCode = null;

    self.on('_end', function () {
      self.context._request._futures.forEach(function (fn) {
        fn(this._error, this.context._request, this.body);
      }, self);
      self.context._request._fulfilled = true;
    });
  }

  // TODO stream
  util.inherits(AnrResponse, events.EventEmitter);

  AnrResponse.prototype._start = function (res) {
    var self = this
      ;
    // headers have been received
    self._nodeResponse = res;
    res.on('data', function (chunk) {
      self.loaded += chunk.length;
      self.emit('progress');
      self.emit('data', chunk);
    });
    res.on('end', function () {
      self.emit('end');
    });
    res.on('close', function () {
      self.emit('close');
    });
    self.statusCode = res.statusCode;
    self.headers = res.headers;
    forEachAsync(self.wares, self._handleHandler, self).then(function () {
      // i dunno
      console.log('[ARES] it happened...');
    });
  };
  AnrResponse.prototype.pause = function () {
    return this._nodeResponse.pause();
  };
  AnrResponse.prototype.resume = function () {
    return this._nodeResponse.resume();
  };
  AnrResponse.prototype._handleHandler = function (next, fn) {
    console.log('[ARES] handling a response handler...');
    fn(this, next);
  };

  module.exports = AnrResponse;
}());
