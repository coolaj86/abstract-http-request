/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var util = require('util')
    , events = require('events')
    ;

  function AnrResponse() {
    this.headers = {};
    events.EventEmitter.call(this);
  }

  util.inherits(AnrResponse, events.EventEmitter);

  module.exports = AnrResponse;
}());
