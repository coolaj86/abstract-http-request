/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
    require = function () {},
    module = {},
    provide = function () {},
*/
"use strict";
(function () {
  // TODO underExtend
  var $ = require('jQuery'),
    Futures = require('futures');
  // jQuery Wrapper with more reasonable default values
  // by default handles error and times out after 10s
  module.exports = function (options) {
    var promise = Futures.promise(),
      result;

    options = options || {};
    options = underExtend(options, globalOptions);

    options.success = function (data, xhr, status) {
      promise.fulfill(undefined, data, xhr);
    };
    options.error = function (xhr, status, error) {
      promise.fulfill(status, error, xhr);
    };

    // Node.js bug? if content type is set on GET it hangs
    if ('POST' !== options.type && 'POST' !== options.type) {
      options.contentType = undefined;
      delete options.contentType;
    }

    result = $.ajax(options);

    if (options.syncback) {
      if ('function' === typeof options.syncback) {
        options.syncback(result);
      } else {
        throw new Error("'syncback' must be a function which accepts the immediate return value of xmlhttprequest");
      }
    }

    return promise;
  };

  provide('ahr-browser');
}());
