// test against `netcat -l 4080`
(function () {
  "use strict";

  var request = require('ahr2');

  request.tcp({
      hostname: 'localhost'
    , port: '4080'
    , timeout: 10 * 1000          // optional
    , encodedBody: "Hello Friend\n" // optional
  }).when(function (err, ahr, data) {
    console.log('all done', err, ahr, data);
  });

}());
