/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true unused:true undef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    , forEachAsync = require('forEachAsync')
    , p
    ;

  function AnrResponse(wares, context) {
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
    this._chunks = [];
  }

  // TODO stream
  util.inherits(AnrResponse, events.EventEmitter);

  p = AnrResponse.prototype;
  p._fulfill = function () {
    var me = this
      ;

    me.context._request._futures.forEach(function (fn) {
      fn(this._error, this.context._request, this.body);
    }, me);
    me.context._request._fulfilled = true;
  };
  p._start = function (res) {
    var me = this
      ;
    // headers have been received
    me._nodeResponse = res;
    res.on('data', function (chunk) {
      me.loaded += chunk.length;
      me.emit('progress');
      me.emit('data', chunk);
    });
    res.on('end', function () {
      me.completed = true;
      me.emit('end');
    });
    res.on('close', function () {
      me.emit('close');
    });
    me.statusCode = res.statusCode;
    me.headers = res.headers;

    forEachAsync(me.wares, me._handleHandler, me).then(function () {
      console.log('[ARES] not handled by any of the wares, giving way to `response` handler.');
      me.context._request.emit('response', me.context._response);
      if (me.completed) {
        me._fulfill();
      } else {
        me.on('data', function (chunk) {
          me._chunks.push(chunk);
        });
        me.on('end', function () {
          me.body = Buffer.concat(me.chunks);
          me.fulfill();
        });
      }
    });
  };
  p.pause = function () {
    return this._nodeResponse.pause();
  };
  p.resume = function () {
    return this._nodeResponse.resume();
  };
  p._handleHandler = function (next, fn) {
    console.log('[ARES] handling a response handler...');
    fn(this, next);
  };

  module.exports = AnrResponse;
}());
