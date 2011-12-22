(function () {
  "use strict";

  var request = require('./node_modules/ahr2')
    ;

  request.get('http://www.google.com').when(function (err, ahr, data) {
    console.log(data.toString('utf8').length > 100);
  });
}());
