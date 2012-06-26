/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    ;

  function AnrRequest() {
    this.headers = {};
    events.EventEmitter.call(this);
  }
  AnrRequest.prototype.send = function () {
    if (this._requestSent) {
      console.warn('already sent request');
      return;
    }

    this._requestSent = true;
    console.log('sent, or so they say');
  };

  util.inherits(AnrRequest, events.EventEmitter);

  module.exports = AnrRequest;
}());
