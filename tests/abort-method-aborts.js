(function () {
  "use strict";

  var request = require('../lib')
    , assert = require('assert')
    , emitter
    , calledLoadStart
    , calledError
    ;

  emitter = request.get('http://google.com');
  emitter.when(function (err, ahr, data) {
    assert.ok(err, 'Expected aborted error');
    assert.ok(calledLoadStart, 'Expected loadstart to be called');
    assert.ok(calledError, 'Expected error to be called');
  });

  emitter.request.on('loadstart', function () {
    calledLoadStart = true;
    assert.ok(emitter.abort, 'Expected the abort method to be exposed abstractly');
    emitter.abort();
  });

  emitter.request.on('error', function () {
    calledError = true;
  });
}());
