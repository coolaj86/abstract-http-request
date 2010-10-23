// Implementation of require(), modules, exports, and provide to the browser
"use strict";
(function () {
    if ('undefined' !== typeof window && 'undefined' !== typeof alert) {
    (function () {
      var global = window;
      function resetModule() {
        global.module = {};
        global.exports = {};
        global.module.exports = exports;
      }
      global._PLUGIN_EXPORTS = global._PLUGIN_EXPORTS || {};
      global.require = function (name) {
        var plugin = global._PLUGIN_EXPORTS[name] || global[name],
          msg = "One of the included scripts requires '" + 
            name + "', which is not loaded. " +
            "\nTry including '<script src=\"" + name + ".js\"></script>'.\n";
        if ('undefined' === typeof plugin) {
          alert(msg);
          throw new Error(msg);
        }
        return plugin;
      };
      global.provide = function (name) {
        global._PLUGIN_EXPORTS[name] = module.exports;
        resetModule();
      };
      resetModule();
    }());
    } else {
      global.provide = function () {};
    }
}());
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

  if (!Object.keys) {
    require('es5');
  }
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
    ahr.http = (function () {
      var http = require('http'),
        url = require('url'),
        Futures = require('futures');

      // TODO wrap streaming
      return function (options) {
        var opts, client, request,
          p = Futures.promise();
        opts.secure = false;
        opts.default_protocol = 'http';
        opts.default_port = '80';
        opts.default_host = 'localhost';
        opts.default_header = {"Content-Type": options.contentType};
        

        // Parse URL
        opts = url.parse(options.url);
        if ('https' === opts.protocol || '443' === opts.port || true === options.secure) {
          opts.secure = true;
          opts.default_protocol = 'https';
          opts.default_port = '443';
        }
        opts.protocol = opts.protocol || opts.default_protocol;
        opts.port = opts.port || opts.default_port;
        opts.host = opts.host || opts.default_host;
        opts.default_header['Host'] = opts.host;
        // underextend


        // Create Connection
        client = http.createClient(opts.port, opts.host, opts.secure);


        // Create Request
        options.url = opts.pathname + opts.search;
        options.url = extendUrl(options.url, options.params);
        request = client.request(options.type, options.path, options.headers || options.default_header);
        // Transfer-Encoding: chunked.
        // Content-Length: N
        request.end(options.data);

        request.on('response', function (response) {
          var data = '', err = '';
          response.on('data', function (chunk) {
            data += chunk;
          });
          response.on('error', function (chunk) {
            err = chunk;
            console.log('ERR: ' + chunk);
          });
          response.on('end', function (chunk) {
            if (response.statusCode && response.statusCode >= 400) {
              err = err || response.statusCode;
            }
            p.fulfill(err, data, response);
          });
        });
        return p;
      };
    }());
  } else {
    ahr.http = (function () {
      var $ = require('jQuery'),
        Futures = require('futures');

      // TODO underExtend
      // jQuery Wrapper with more reasonable default values
      // by default handles error and times out after 10s
      return function (options) {
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
    }());
  }

  module.exports = ahr;
  provide('ahr');
}());
