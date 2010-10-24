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
    timeout: 20000
  };

  ahr_doc = [
    {
      keyname: 'ssl',
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
      enum: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

  function jsonUriEncode(json) {
    var query = '';
    Object.keys(json).forEach(function (key) {
      // assume that the user meant to delete this element
      if ('undefined' === typeof json[key]) {
        return;
      }

      var param, value;
      param = encodeURIComponent(key);
      value = encodeURIComponent(json[key]);
      query += '&' + param;
      // assume that the user wants just the param name sent
      if (null !== json[key]) {
        query += '=' + value;
      }
    });
    return query.substring(1);
  }

  function extendUrl(url, params) {
    var query,
      url = url || '';
      params = params || {};

    query = jsonUriEncode(params);

    // cut the leading '&' if no other params have been written
    if (query.length > 0) {
      if (!url.match(/\?/)) {
        url += '?' + query;
      } else {
        url += '&' + query;
      }
    }
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
  ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
    ahr[verb.toLowerCase()] = function (url, params, options) {
      var result;
      options = options || {};

      options.url = extendUrl(url, params);
      options.url = extendUrl(options.url, options.params);
      options.type = verb;

      if (options.data) {
        throw new Error("'" + verb + "' should not have a body. Please use 'params' rather than 'data'");
      }

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

  // HTTPS
  ahr.https = function (options) {
    options.ssl = true;
    options.protocol = "https";
    ahr.http(options);
  };

  // JSONP
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
        var presets,
          client,
          request,
          p = Futures.promise();

        presets = {
          port: 80,
          host: 'localhost',
          ssl: false,
          protocol: 'http',
          method: 'GET',
          headers: {
            "User-Agent": "node.js",
            "Accept": "*/*"
          },
          pathname: '/',
          search: ''
        }

        // Parse URL
        options = underExtend(url.parse(options.url), options);
        if ('https' === options.protocol || '443' === options.port || true === options.ssl) {
          presets.ssl = true;
          presets.port = '443';
          presets.protocol = 'https';
          options.protocol = 'https';
        }

        // Set options according to URL
        options.headers = options.headers || {};
        options.headers = underExtend(options.headers, presets.headers);
        options.headers['Host'] = options.hostname;
        options = underExtend(options, presets); // TODO only do 'method'

        //console.log("OPTIONS:");
        //console.dir(options);

        // Create Connection
        client = http.createClient(options.port, options.host, options.ssl);

        // Create Request
        options.requestPath = extendUrl(options.pathname + options.search, options.params);
        request = client.request(options.method, options.requestPath, options.headers);

        // Create & Send body
        options.headers["Transfer-Encoding"] = undefined; // TODO support streaming
        if (options.body) {
          if (!options.headers["Content-Type"]) {
            options.headers["Content-Type"] = "application/x-www-form-urlencoded";
          }
          if (options.headers["Content-Type"].match(/application\/json/) || options.headers["Content-Type"].match(/text\/javascript/)) {
            options.encodedBody = JSON.stringify(options.body);
          } else if (options.headers["Content-Type"].match(/application\/x-www-form-urlencoded/)) {
            options.encodedBody = jsonUriEncode(options.body);
          } else if (!options.encodedBody) {
            throw new Error("'" + options.headers["Content-Type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
          }
          options.headers["Content-Length"] = options.encodedBody.length;
        } else {
          options.headers["Content-Type"] = undefined;
          options.headers["Content-Length"] = undefined;
          options.headers["Transfer-Encoding"] = undefined;
          delete options.headers["Content-Type"];
          delete options.headers["Content-Length"];
          delete options.headers["Transfer-Encoding"];
        }
        request.end(options.body);

        request.on('response', function (response) {
          // TODO max redirect
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
            } else if (response.statusCode && response.statusCode >= 300) {
              // Redirect when requested
              options.url = response.headers.location;
              ahr.http(options).when(p.fulfill);
              return;
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
          result, jqOpts;

        options = options || {};
        options = underExtend(options, globalOptions);
        options.type = options.method;

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
