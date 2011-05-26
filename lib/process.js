(function () {
  "use strict";

  window.process = window.process || function () {};
  window.process.nextTick = function (fn) {
    setTimeout(fn, 0);
  };
}());
