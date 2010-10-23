/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
    Purposeful JSLint exceptions
    require = function () {}, 
    module = {},
    provide = function () {},
    XMLHttpRequest,
    ActiveXObject,
*/
"use strict";
(function () {
  var ahr = {}, ahr_doc,
    globalOptions; // TODO underExtend localOptions

  require('es5');
  globalOptions = {
    contentType: 'application/json; charset=utf-8',
    timeout: 10000
  };

  ahr_doc = [
    {
      keyname: 'secure',
      type: 'boolean',
      enum: [true, false],
      validation: function (item) {
        // TODO move to default validator
        return true === item || false === item;
      }
    },
    {
      keyname: 'type',
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      validation: function (item) {
        var result = false;
        ahr_doc.enum.forEach(function (verb) {
          // TODO move to default validator
          if (verb === item) {
            result = true;
          }
        });
        return result;
      }
    }
  ];

  function extendUrl(url, params) {
    var query = '';

    Object.keys(params).forEach(function (key) {
      // assume that the user meant to delete this element
      if ('undefined' === typeof params[key]) {
        return;
      }

      var param, value;
      param = encodeURIComponent(key);
      value = encodeURIComponent(params[key]);
      query += '&' + param;
      // assume that the user wants just the param name sent
      if (null !== params[key]) {
        query += '=' + value;
      }
    });

    // cut the leading '&' if no other params have been written
    if (!url.match(/\?/) && query.length > 0) {
      url += '?';
      query = query.substring(1);
    }
    url += query;
    return url;
  }
  extendUrl.test = function () {
    return ('' === extendUrl("",{}) &&
      'http://example.com' === extendUrl("http://example.com", {}) &&
      // some sites use this notation for boolean values
      // should undefind be counted as a user-mistake? and null do the 'right thing' ?
      'http://example.com' === extendUrl("http://example.com", {foo: undefined}) &&
      'http://example.com?foo' === extendUrl("http://example.com", {foo: null}) &&
      'http://example.com?foo=bar' === extendUrl("http://example.com", {foo: 'bar'}) &&
      'http://example.com?foo=bar&bar=baz' === extendUrl("http://example.com?foo=bar", {bar: 'baz'}) &&
      'http://example.com?fo%26%25o=ba%3Fr' === extendUrl("http://example.com", {'fo&%o': 'ba?r'})
    );
  };

  // useful for extending global options onto a local variable
  function underExtend(local, global) {
    // TODO recurse / deep copy
    Object.keys(global).forEach(function (key) {
      if ('undefined' === typeof local[key]) {
        local[key] = global[key];
      }
    });
    return local;
  }

  // Allow access without screwing up internal state
  ahr.globalOptionKeys = function () {
    return Object.keys(globalOptions);
  };
  ahr.globalOption = function (key, val) {
    if ('undefined' === typeof val) {
      return globalOptions[key];
    }
    if (null === val) {
      val = undefined;
    }
    globalOptions[key] = val;
  };
  ahr.setGlobalOptions = function (bag) {
    Object.keys(bag).forEach(function (key) {
      globalOptions[key] = bag[key];
    });
  };

  /*
   * The meat and potatoes right here
   */
  ['GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
    ahr[verb.toLowerCase()] = function (url, params, options) {
      var result;
      options = options || {};

      options.url = url;
      options.type = verb;
      options.data = params;

      result = ahr.http(options);
      return result;
    };
  });

  // Correcting an oversight of jQuery.
  // POST and PUT can have both params (in the URL) and data (in the body)
  ['POST', 'PUT'].forEach(function (verb) {
    ahr[verb.toLowerCase()] = function (url, params, data, options) {
      var result, query='';
      options = options || {};

      options.url = extendUrl(url, params);
      options.type = verb;
      options.data = data;

      result = ahr.http(options);
      return result;
    };
  });

  ahr.jsonp = function (url, jsonp, params, options) {
    var result;
    options = options || {};

    params[jsonp] = '?';
    options.url = extendUrl(url, params);
    options.dataType = 'json';

    result = ahr.http(options);
    return result;
  };

  if ('undefined' === typeof XMLHttpRequest && 'undefined' === typeof ActiveXObject) {
      if ('undefined' === typeof require) {
        throw new Error("This doesn't appear to be a browser, nor Node.js.\n" +
          "Please write a wrapper and submit a patch or issue to github.com/coolaj86/ahr");
    }
    ahr.http = require('./lib/node');
  } else {
    ahr.http = require('ahr-browser');
  }

  module.exports = ahr;
  provide('ahr');
}());
