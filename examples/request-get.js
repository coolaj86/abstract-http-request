(function () {
  "use strict";
  
  var request = require('ahr2')
    ;

  // request.get(href || pathname, query, options).when(callback)
  request.get("http://foobar3000.com/echo?foo=bar&baz=qux&baz=quux&corge").when(function (err, ahr, data) {
    console.log(arguments);
  });
}());
