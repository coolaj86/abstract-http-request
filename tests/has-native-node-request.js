(function () {
  "use strict";

  var request = require('../lib')
    , assert = require('assert')
    , emitter
    , calledLoadStart
    ;

  emitter = request.get('http://google.com');
  emitter.when(function (err, ahr, data) {
    //console.log(ahr);
    assert.ok(calledLoadStart, 'Expected loadstart to be called');
  });

  emitter.request.on('loadstart', function () {
    calledLoadStart = true;
    assert.ok(emitter.request, 'Expected a reference to the abstract request object on the response object');
    assert.ok(emitter.request.nodeRequest, 'Expected a reference to the actual node request on the abstract one');
    assert.ok(emitter.request.nodeRequest.abort, 'Expected the abort method to be exposed natively');
    assert.ok(emitter.abort, 'Expected the abort method to be exposed abstractly');
  });
}());
