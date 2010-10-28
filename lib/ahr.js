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
  var url = require('url'),
    Futures = require('futures'),
    ahr = {}, ahr_doc,
    nativeHttpClient,
    globalOptions; // TODO underExtend localOptions

  if (!Object.keys) {
    require('es5');
  }

  globalOptions = {
    port: 80,
    host: 'localhost',
    ssl: false,
    protocol: 'http',
    method: 'GET',
    headers: {
      'Accept': "*/*"
    },
    pathname: '/',
    search: '',
    params: {},
    // contentType: 'json',
    // accept: 'json',
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
    global = cloneJson(global);
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
   * About the HTTP spec and which methods allow bodies, etc:
   * http://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request
   */
  ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
    ahr[verb.toLowerCase()] = function (url, params, options) {
      options = options || {};

      options.method = verb;
      options.url = url || "";
      // TODO global params
      options.params = underExtend(params || {}, options.params || {});

      if (options.body) {
        throw new Error("The de facto standard is that '" + verb + "' should not have a body.\n" +
          "Most web servers just ignore it. Please use 'params' rather than 'body'.\n" +
          "Also, you may consider filing this as a bug - please give an explanation.");
      }

      return ahr.http(options);
    };
  });

  // Correcting an oversight of jQuery.
  // POST and PUT can have both params (in the URL) and data (in the body)
  ['POST', 'PUT'].forEach(function (verb) {
    ahr[verb.toLowerCase()] = function (url, params, body, options) {
      options = options || {};

      options.method = verb;
      options.url = url || "";
      // TODO global params
      options.params = underExtend(params || {}, options.params || {});
      options.body = body;

      return ahr.http(options);
    };
  });

  // HTTPS
  ahr.https = function (options) {
    options.ssl = true;
    options.protocol = "https";
    return ahr.http(options);
  };

  // JSONP
  ahr.jsonp = function (url, jsonp, params, options) {
    options = options || {};

    if (!jsonp) {
      throw new Error("'jsonp' is not an optional parameter.\n" +
        "If you believe that this should default to 'callback' rather" +
        "than throwing an error, please file a bug");
    }

    options.params = underExtend(params || {}, options.params || {});
    options.params[jsonp] = 'jsonp_' + (new Date()).valueOf();
    options.jsonp = options.params.jsonp;
    options.dataType = 'json';

    if (options.body) {
      throw new Error("The de facto standard is that '" + verb + "' should not have a body.\n" +
        "Most web servers just ignore it. Please use 'params' rather than 'body'.\n" +
        "Also, you may consider filing this as a bug - please give an explanation.");
    }

    // TODO determine same-domain XHR or XHR2/CORS or SSJS
    return ahr.http(options);
  };

  function nodeHttpClient(options) {
    var http = require('http'),
      base64 = require('base64'),
      p = Futures.promise(),
      client,
      request,
      timeoutToken,
      cancelled = false;
    
    underExtend(options.headers, {'User-Agent': 'Node.js'});

    // Set timeout for initial contact of server
    timeoutToken = setTimeout(function () {
      p.fulfill('timeout', undefined, xhr);
      cancelled = true;
    }, options.timeout);

    // create Connection, Request
    client = http.createClient(options.port, options.host, options.ssl);
    options.headers['Authorization'] = 'Basic ' + base64.encode(new Buffer(options.auth));
    request = client.request(options.method, options.requestPath, options.headers);
    request.end(options.body);

    if (options.syncback) {
      if ('function' === typeof options.syncback) {
        options.syncback(request);
      } else {
        throw new Error("'syncback' must be a function which accepts the immediate return value of Browser.XHR or Node.HCR");
      }
    }

    request.on('response', function (response) {
      var data = '', err = '';

      if (cancelled) {
        return;
      }

      // Set timeout for request
      clearTimeout(timeoutToken); // Clear connection timeout
      timeoutToken = setTimeout(function () {
        p.fulfill('timeout');
        cancelled = true;
      }, options.timeout);

      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('error', function (chunk) {
        err = chunk;
      });
      response.on('end', function (chunk) {
        if (cancelled) {
          return;
        }

        clearTimeout(timeoutToken); // Clear request timeout
        if (response.statusCode && response.statusCode >= 400) {
          // Error on Error
          err = err || response.statusCode;
        } else if (response.statusCode && response.statusCode >= 300) {
          // Redirect when requested
          // TODO set max redirect
          options.url = response.headers.location;
          ahr.http(options).when(p.fulfill);
          return;
        }
        if ('undefined' === typeof err && options.jsonp && data) {
          // TODO remove func exp
          global[options.jsonp] = function (data) {
            JSON.parse(JSON.stringify(data));
            p.fulfill(err, data, response);
            global[options.jsonp] = undefined;
            try {
              delete global[options.jsonp];
            } catch(e) {}
          };
          // this will be a wrapped object
          eval(data);
          return;
        }
        p.fulfill(err, data, response);
      });
    });

    return p.passable();
  }

  function browserJsonpClient(options) {
    // TODO check for Same-domain / XHR2/CORS support
    // before attempting to insert script tag
    // Those support headers and such, which are good
    var cbkey = options.jsonp,
      script = document.createElement("script"),
      head = document.getElementsByTagName("head")[0] || document.documentElement,
      promise = Futures.promise(),
      timeout,
      fulfilled; // TODO add status to Futures

    function cleanup() {
      // Cleanup
      window[cbkey] = undefined;
      try {
        delete window[cbkey];
      } catch(e) {}
      if ( head ) {
        head.removeChild(script);
      }
    }

    // onError: Set timeout if script tag fails to load
    if (options.timeout) {
      timeout = setTimeout(promise.fulfill, options.timeout, [
        "timeout", 
        undefined, 
        {readyState: 1, script: true, error: timeout}
      ]);
      fulfilled = true;
      cleanup();
    }

    // onSuccess: Sanatize data, Send, Cleanup
    window[cbkey] = function (json) {
      if (fulfilled) {
        return;
      }

      clearTimeout(timeout);
      JSON.parse(JSON.stringify(json));
      promise.fulfill(undefined, json, {readyState: 4})

      cleanup();
    };

    // Insert JSONP script into the DOM
    // set script source to the service that responds with thepadded JSON data
    script.setAttribute("type", "text/javascript");
    script.setAttribute("async", "async");
    script.setAttribute("src", options.url);
    head.insertBefore(script, head.firstChild);
    setTimeout(function() {
        // happens whether or not the user has set a timeout
        cleanup();
    }, 60000);

    options.syncback({
      readyState: 1,
      abort: function () { 
        cleanup();
      }
    });

    return promise.passable();
  }

  function browserHttpClient(options) {
    if (options.jsonp) {
      return browserJsonpClient(options);
    }
    // So far, these quirks are accounted for:
    // http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html
    // jQuery is still better
    var xhr,
      timeout,
      fulfilled,
      twocalled,
      user,
      pass,
      auth,
      promise = Futures.promise();

    if (!window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    }

    function onReadyStateChange() {
      var ct, xml, data;
      // Some browsers don't fire state 2
      if (1 !== xhr.readyState && !twocalled) {
        twocalled = true;
        // Todo when headers are ready
        // options.headers(xhr)
      } else if (4 === xhr.readyState) {
        if (fulfilled) { return; }
        clearTimeout(timeout);
        ct = xhr.getResponseHeader("content-type") || "";
        xml = /* type === "xml" || !type && */ ct.indexOf("xml") >= 0;
        data = xml ? xhr.responseXML : xhr.responseText;
        promise.fulfill(undefined, data, xhr);
      }
    }

    timeout = setTimeout(function () {
        promise.fulfill("timeout", undefined, xhr);
        fulfilled = true;
    }, options.timeout);

    xhr = new XMLHttpRequest();
    Object.keys(options.headers).forEach(function (label) {
      try {
        xhr.setRequestHeader(label, options.headers[label]);
      } catch(e) {
        // TODO log the failure
      }
    });

    options.syncback(xhr);
    if (options.username) {
      xhr.open(option.method, option.url, true, options.username, options.password);
    } else {
      xhr.open(option.method, option.url, true);
    }
    xhr.onreadystatechange = onReadyStateChange;
    xhr.send(options.body);

    return promise.passable();
  }

  function jQueryHttpClient(options) {
    var $ = require('jQuery'),
      p = Futures.promise(),
      jqOpts = {beforeSend: function (xhr) {
        Object.keys(options.headers).forEach(function (label) {
          try {
            xhr.setRequestHeader(label, options.headers[label]);
          } catch(e) {
            // TODO log the failure
          }
        });
      }},
      xhr,
      timeoutToken,
      cancelled = false;

    // For cross-site and other invalid requests, the
    // default error handler is never triggered, so it
    // will look like a timeout
    timeoutToken = setTimeout(function () {
      cancelled = true;
      p.fulfill('timeout', undefined, xhr);
    }, options.timeout);

    jqOpts.type = options.method;
    jqOpts.complete = function (xhr, data) {
      clearTimeout(timeoutToken);
    };
    jqOpts.success = function (data, textStatus, xhr) {
      promise.fulfill(undefined, data, xhr);
    };
    jqOpts.error = function (xhr, textStatus, errorThrown) {
      promise.fulfill(errorThrown, textStatus, xhr);
    };

    xhr = $.ajax(options);

    options.syncback(xhr);
    // TODO throw new Error("'syncback' must be a function which accepts the immediate return value of Browser.XHR or Node.HCR");

    return p.passable();
  }

  if ('undefined' === typeof XMLHttpRequest && 'undefined' === typeof ActiveXObject) {
      if ('undefined' === typeof require) {
        throw new Error("This doesn't appear to be a browser, nor Node.js.\n" +
          "Please write a wrapper and submit a patch or issue to github.com/coolaj86/ahr");
    }
    nativeHttpClient = nodeHttpClient;
  } else if ('undefined' != jQuery){
    nativeHttpClient = jQueryHttpClient;
  } else {
    nativeHttpClient = browserHttpClient;
  }

  function cloneJson(obj) {
    // Loses functions, but oh well
    return JSON.parse(JSON.stringify(obj));
  }

  function allowsBody(method) {
    return 'HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method;
  }

  ahr.http = function (options) {
    var presets = cloneJson(globalOptions);

    options.syncback = options.syncback || function () {};
    options.headers = options.headers || {};

    // Authorization
    if (options.username && options.password) {
      options.auth = options.username + ':' + options.password;
    } else if (options.auth) {
      options.username = options.auth.split(':')[0];
      options.password = options.auth.split(':')[1];
    }
    // TODO base64 http://www.webtoolkit.info/javascript-base64.html
    //options.headers['Authorization'] = 'Basic ' + base64(options.auth);

    // Parse URL
    options.url = extendUrl(url, params);
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
    options = underExtend(options, presets);
    options.requestPath = extendUrl(options.pathname + options.search, options.params);
    

    // Create & Send body
    options.headers["Transfer-Encoding"] = undefined; // TODO support streaming
    if (options.body && allowsBody(options.method)) {
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
      if (options.body) {
        throw new Exception('You gave a body for one of HEAD, GET, DELETE, or OPTIONS');
      }
      options.encodedBody = "";
      options.headers["Content-Type"] = undefined;
      options.headers["Content-Length"] = undefined;
      options.headers["Transfer-Encoding"] = undefined;
      delete options.headers["Content-Type"];
      delete options.headers["Content-Length"];
      delete options.headers["Transfer-Encoding"];
    }

    return nativeHttpClient(options);
  };

  module.exports = ahr;
  provide('ahr');
}());
