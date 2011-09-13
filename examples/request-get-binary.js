(function () {
  "use strict";

  var request = require('ahr2')
    ;

  request.get('http://foobar3000.com/assets/reference.rgb565', {}, {
    overrideResponseType: 'binary' 
  }).when(function (err, request, data) {
    console.log(err, data && (data.length || data.byteLength));
  });

}());
