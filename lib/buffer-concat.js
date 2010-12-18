(function () {
  "use strict";

  function concat(bufs) {
    var buffer, length = 0, index = 0;

    if (!Array.isArray(bufs)) {
      bufs = Array.prototype.slice.call(arguments);
    }

    bufs.forEach(function (buf) {
      length += buf.length;
    });
    buffer = new Buffer(length);

    bufs.forEach(function (buf) {
      buf.copy(buffer, index, 0, buf.length);
      index += buf.length;
      delete buf;
    });

    return buffer;
  }
  Buffer.concat = concat;

}());
