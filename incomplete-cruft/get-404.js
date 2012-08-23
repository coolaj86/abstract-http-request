(function () {
  "use strict";

  var request = require('ahr2')
    , assert = require('assert')
    , get
    ;

  get = request("http://foobar3000.com/?status=404");

  get.when(function (err, response, data) {
    console.log(response);
    //assert.ok(/404/.test(data.toString('utf8')));
    //console.log('[pass] Found 404 page');
  });
}());
