(function () {
  "use strict";
  
  var request = require('ahr2')
    , File = require('File')
    , file
    ;

  file = new File(__dirname + '/1k.txt'); // can also use Buffer or EventEmitter with `data` and `end` events
  // wget http://foobar3000.com/assets/1k.txt
  // In the browser this would look something like
  /*
    file = $('input[type=file]')[0].FileList[0]
  */

  // request.get(href || pathname, query, body, options).when(callback)
  request.post("http://foobar3000.com/echo?rawBody=true", null, {
      message: 'Hello World'
    , attachment: file
    //, chunked: true // node-only
  }).when(function (err, ahr, data) {
    console.log('\n\nGot Response\n');
    console.log(data.toString());
  });

}());
