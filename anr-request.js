/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    ;

  function AnrRequest() {
    this.headers = {};
    this.wares = [];
    events.EventEmitter.call(this);
  }
  util.inherits(AnrRequest, events.EventEmitter);

  AnrRequest.prototype.send = function () {
    if (this._requestSent) {
      console.warn('already sent request');
      return;
    }

    this._requestSent = true;
    console.log('sent, or so they say');
  };
  AnrRequest.prototype._handleHandler = function (next, fn) {
    fn(this, next);
  };
  AnrRequest.prototype._sendRequest = function () {
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
