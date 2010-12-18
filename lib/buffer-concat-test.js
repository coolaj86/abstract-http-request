(function () {
  "use strict";

  require('./buffer-concat');

  var abc = new Buffer('abc'),
    def = new Buffer('def'),
    ghi = new Buffer('ghi'),
    data = Buffer.concat(abc, def, ghi); 

  console.log(data);

  data = Buffer.concat([abc, def, ghi]);
  console.log(data);
}());
