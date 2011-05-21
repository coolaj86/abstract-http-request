/*jslint white: false, onevar: true, undef: true, node: true, nomen: true, regexp: false, plusplus: true, bitwise: true, es5: true, newcap: true, maxerr: 5 */
(function () {
  "use strict";

  var utils = exports
    , jsonpRegEx = /\s*([\$\w]+)\s*\(\s*(.*)\s*\)\s*/;

  utils.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  // useful for extending global options onto a local variable
  utils.extend = function (global, local) {
    //global = utils.clone(global);
    Object.keys(local).forEach(function (key) {
      global[key] = local[key] || global[key];
    });
    return global;
  };

  // useful for extending global options onto a local variable
  utils.preset = function (local, global) {
    // TODO copy functions
    // TODO recurse / deep copy
    global = utils.clone(global);
    Object.keys(global).forEach(function (key) {
      if ('undefined' === typeof local[key]) {
        local[key] = global[key];
      }
    });
    return local;
  };

  utils.objectToLowerCase = function (obj, recurse) {
    // Make headers all lower-case
    Object.keys(obj).forEach(function (key) {
      var value;

      value = obj[key];
      delete obj[key];
      if ('string' === typeof value) {
        obj[key.toLowerCase()] = value.toLowerCase();
      }
    });
    return obj;
  };

  utils.parseJsonp = function (jsonpCallback, jsonp) {
    var match = jsonp.match(jsonpRegEx)
      , data
      , json;

    if (!match || !match[1] || !match[2]) {
      throw new Error('No JSONP matched');
    }
    if (jsonpCallback !== match[1]) {
      throw new Error('JSONP callback doesn\'t match');
    }
    json = match[2];

    data = JSON.parse(json);
    return data;
  };

  // exports done via util
}());
