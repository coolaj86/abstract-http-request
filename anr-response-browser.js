/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true unused:true undef:true*/
(function () {
  "use strict";

  var inherits = require('./inherits')
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
  inherits(AnrResponse, events.EventEmitter);

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
    // headers have been received
    me._xhrResponse = res;

    // this event is already representative of loadstart
    //res.addEventListener('loadstart', function () {
      me.emit('loadstart');
    //});
    res.on = res.addEventListener;
    res.on('progress', function (ev) {
      me.lengthComputable = ev.lengthComputable;
      me.loaded = ev.loaded;
      me.total = ev.total;
    });
    res.on('abort', function () {
      me.emit('abort');
    });
    res.on('error', function (ev) {
      me.completed = true;
      me.emit('error', ev);
    });
    res.on('load', function () {
      var body = res.response
        ;
      // "", "arraybuffer", "blob", "document", "json", "text"
      me.resultType = res.responseType;
      // response responseText responseXML

      me.completed = true;
      me.emit('data', body);
      me.emit('end');
      me.body = res.body || res.response;
      me.emit('load');
      me.emit('close');
    });
    res.on('timeout', function () {
      me.emit('timeout');
    });
    res.on('loadend', function () {
      me.emit('loadend');
    });
    // XHR doesn't have data and end events
    //res.on('data', function (chunk) {});
    //res.on('end', function () {});
    //res.on('close', function () {});

    //me.status = res.status;
    me.statusCode = res.status;
    me.statusText = res.statusText;
    me.rawHeaders = res.getAllResponseHeaders().trim();
    me.rawHeaders.split(/[\r\n]+/g).forEach(function (str) {
      var pair = str.split(/:/)
        ;

      me.headers[pair.shift().trim().toLowerCase()] = pair.join(':').trim();
    });

    forEachAsync(me.wares, me._handleHandler, me).then(function () {
      console.log('[ARES] not handled by any of the wares, giving way to `response` handler.');
      me.context._request.emit('response', me.context._response);
      if (me.completed) {
        me._fulfill();
      } else {
        /*
        me.on('data', function (chunk) {
          me._chunks.push(chunk);
        });
        */
        me.on('end', function () {
          //me.body = Buffer.concat(me.chunks);
          me.fulfill();
        });
      }
    });
  };
  p.pause = function () {
    // This is already abstracted by the browser for XHR
    return;
  };
  p.resume = function () {
    // This is already abstracted by the browser for XHR
    return;
  };
  p._handleHandler = function (next, fn) {
    console.log('[ARES] handling a response handler...');
    fn(this, next);
  };

  module.exports = AnrResponse;
}());
