/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    ;

  function AnrResponse() {
    this.headers = {};
    this.wares = [];
    events.EventEmitter.call(this);
  }

  util.inherits(AnrResponse, events.EventEmitter);

  AnrResponse.prototype._endResponse = function () {
    // TODO atually handle response
    var self = this
      ;

    // Right now we're just mocking the data in
    // the _end event, so it is fired immediately
    process.nextTick(function () {
      self.emit('data', "hello ");
      self.emit('data', "world!");
      self.emit('end');
    });
  };
  AnrResponse.prototype._handleHandler = function (next, fn) {
    console.log('handling a response handler...');
    fn(this, next);
  };

  module.exports = AnrResponse;
}());
