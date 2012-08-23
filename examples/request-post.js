(function () {
  "use strict";
  
  var request = require('ahr2')
    ;

  // request.get(href || pathname, query, body, options).when(callback)
  request.post("http://foobar3000.com/echo?rawBody=true", null, {
      message: 'Hello World'
  }).when(function (err, ahr, data) {
    console.log(err, data);
  });

}());
