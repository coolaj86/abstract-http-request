/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    , forEachAsync = require('forEachAsync')
    ;

  function AnrRequest(wares) {
    var self = this
      ;

    events.EventEmitter.call(this);

    this.headers = {};
    this.wares = wares;
    this._futures = [];
    this.when = function (fn) {
      if (self._fulfilled) {
        fn(self._error, self.context._response, self.context._response.body);
      }
      self._futures.push(fn);

      return self;
    };

    this.on('_start', function () {
      forEachAsync(self.wares, self._handleHandler, self).then(self._send);
    });

    this.on('_end', function () {
      console.log('loading response wares', self.context._response.wares);
      //self._response.headers['content-type'] = 'text/plain;charset=utf-8,';
      //this._response.emit('_start');
      console.log(self);
      process.nextTick(function () {
        self.emit('response', self.context._response);
        self.context._response.emit('_start');
      });
    });
  }

  // TODO stream
  util.inherits(AnrRequest, events.EventEmitter);

  AnrRequest.prototype._handleHandler = function (next, fn) {
    fn(this, next);
  };
  AnrRequest.prototype._send = function () {
    if (this._requestSent) {
      console.warn('already sent request');
      return;
    }

    this._requestSent = true;
    console.log('sent, or so they say');

    // TODO actually handle request
    var self = this
      ;
    console.log('request sending [fake]');
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
    // TODO handle accept headers
    self.emit('_end');
  };

  module.exports = AnrRequest;
}());
