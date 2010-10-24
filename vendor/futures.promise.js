/*jslint browser: true, devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
"use strict";
var Futures = {};
// This snippet doesn't pass JSLint, but is necessary for CommonJS SSJS
try {
  // CommonJS
  Futures = exports;
} catch(ignore) {
  // Browsers
  Futures = window.Futures;
}
(function () {
  // logger utility
  function log(e) {
    var args = Array.prototype.slice.call(arguments);
    if ('undefined' !== typeof console && 'undefined' !== console.log) {
      try { // Firefox
        console.log.apply(console.log, args);
      }
      catch (ignore) {
        try { // WebKit Quirk/BUG fix
          console.log.apply(console, args);
        }
        catch (ignore_again) {
          console.log(e);
        }
      }
    }
  }

  // Exception Class
  function FuturesException(msg) {
    this.name = "FuturesException";
    this.message = msg;
  }

  /**
   * Create a chainable promise
   */
  Futures.promise = function (guarantee) {
    var status = 'unresolved',
      outcome, waiting = [],
      dreading = [],
      passable, result;

    function vouch(deed, callback) {
      switch (status) {
      case 'unresolved':
        (deed === 'fulfilled' ? waiting : dreading).push(callback);
        break;
      case deed:
        callback.apply(callback, outcome);
        break;
      }
    }

    function resolve(deed, value) {
      if (status !== 'unresolved') {
        throw new FuturesException('The promise has already been resolved:' + status);
      }
      status = deed;
      outcome = value;
      (deed === 'fulfilled' ? waiting : dreading).forEach(function (func) {
        try {
          func.apply(func, outcome);
        } catch (e) {
          // TODO do we really want 3rd parties ruining it for everyone?
          if (!(e instanceof FuturesException)) {
            throw e;
          }
        }
      });
      waiting = null;
      dreading = null;
    }
    passable = {
      when: function (f) {
        result.when(f);

        return this;
      },
      fail: function (f) {
        result.fail(f);
        return this;
      }
    };
    result = {
      when: function (func) {
        vouch('fulfilled', func);

        return this;
      },
      fail: function (func) {
        vouch('smashed', func);

        Futures.log("'fail' is deprecated, please use `when(err, data)` instead");
        return this;
      },
      fulfill: function () {
        var args = Array.prototype.slice.call(arguments);
        resolve('fulfilled', args);

        return passable;
      },
      smash: function () {
        var args = Array.prototype.slice.call(arguments);
        resolve('smashed', args);

        Futures.log("'smash' is deprecated, please use `fulfill(err, data)` instead");
        return passable;
      },
      status: function () {
        return status;
      },
      passable: function () {
        return passable;
      }
    };
    if (undefined !== guarantee) {
      return result.fulfill(guarantee);
    }
    return result;
  }
  module.exports = Futures;
  provide('futures');
}());
