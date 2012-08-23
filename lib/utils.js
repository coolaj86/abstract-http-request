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
      key = key.toLowerCase();
      /*
      if ('string' === typeof value) {
        obj[key] = value.toLowerCase();
      } else {
        obj[key] = value;
      }
      */
      obj[key] = value;
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

  utils.uriEncodeObject = function(json) {
    var query = '';

    try {
      JSON.parse(JSON.stringify(json));
    } catch(e) {
      return 'ERR_CYCLIC_DATA_STRUCTURE';
    }

    if ('object' !== typeof json) {
      return 'ERR_NOT_AN_OBJECT';
    }

    Object.keys(json).forEach(function (key) {
      var param, value;

      // assume that the user meant to delete this element
      if ('undefined' === typeof json[key]) {
        return;
      }

      param = encodeURIComponent(key);
      value = encodeURIComponent(json[key]);
      query += '&' + param;

      // assume that the user wants just the param name sent
      if (null !== json[key]) {
        query += '=' + value;
      }
    });

    // remove first '&'
    return query.substring(1);
  };

  utils.addParamsToUri = function(uri, params) {
    var query
      , anchor = ''
      , anchorpos;

    uri = uri || "";
    anchor = '';
    params = params || {};

    // just in case this gets used client-side
    if (-1 !== (anchorpos = uri.indexOf('#'))) {
      anchor = uri.substr(anchorpos);
      uri = uri.substr(0, anchorpos);
    }

    query = utils.uriEncodeObject(params);

    // cut the leading '&' if no other params have been written
    if (query.length > 0) {
      if (!uri.match(/\?/)) {
        uri += '?' + query;
      } else {
        uri += '&' + query;
      }
    }

    return uri + anchor;
  };
}());
