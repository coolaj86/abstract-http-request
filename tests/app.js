(function () {
  "use strict";

  var request = require('ahr2')
    ;

  request.get('http://foobar3000.com/echo.json?cors=true').when(function (err, ahr, data) {
    console.log('echo.json:');
    console.log(data);
  });

  // for browser this needs cors setup... 
  // perhaps creating cors.foobar3000.com or foobar3000.com/cors/
  // would be a viable solution
  // require('./test-suite')
}());
