(function () {
  "use strict";

  var fs = require('fs')
    , i
    , j
    , num = 16
    , data = ''
    , c
    , bank = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (i = 0; i < num; i += 1) {
    c = bank[i];
    for (j = 0; j < 1023; j += 1) {
      data += c;
    }
    data += '\n';
  }

  fs.writeFileSync(num + 'kb.dat', data);
}());
