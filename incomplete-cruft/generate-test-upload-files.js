(function () {
  "use strict";

  var fs = require('fs')
    , bank = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function writeFile(name, num) {
    var i, j, c, bindex, data = '';

    for (i = 0; i < num; i += 1) {
      bindex = i % bank.length;
      c = bank[bindex];
      for (j = 0; j < 1023; j += 1) {
        data += c;
      }
      data += '\n';
    }

    fs.writeFileSync(name, data);
  }

  writeFile('256kb.dat', 256);
  writeFile('16kb.dat', 16);
  writeFile('2k_b.dat', 2);
  writeFile('1k_a.dat', 1);
}());
