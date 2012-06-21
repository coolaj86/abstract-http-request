/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var EventEmitter = require('events').EventEmitter;

  // TODO create(filters) and streamers
  // TODO for the real FormData sizes >= 3gb the length
  // should be given in kb or mb

  function FormContent(body) {
    this.body = body;
  }

  FormContent.prototype.serialize = function () {
    var emitter = new EventEmitter()
      , self = this;

    function fireAllEvents() {
      var body = self.body
        , length = body.length;

      emitter.emit('size', length);
      emitter.emit('loadstart', {
        lengthComputable: true,
        loaded: 0,
        total: length
      });
      emitter.emit('progress', {
        lengthComputable: true,
        loaded: length,
        total: length
      });
      emitter.emit('load', {
        lengthComputable: true,
        loaded: length,
        total: length,
        target: {
          result: body
        }
      });
      emitter.emit('loadend', {
        lengthComputable: true,
        loaded: length,
        total: length
      });
    }

    process.nextTick(fireAllEvents);

    return emitter;
  };

  module.exports.FormContent = FormContent;
}());
