/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
    Purposeful JSLint exceptions
    require = function () {}, 
    module = {},
    provide = function () {},
    Buffer,
    global,
    window,
    jQuery,
    console = {},
    XMLHttpRequest,
    ActiveXObject,
*/
"use strict";
(function (undefined) {
  var url = require('url'),
    Futures = require('futures/promise'),
    ahr, ahr_doc,
    nativeHttpClient,
    globalOptions,
    debug = false; // TODO underExtend localOptions

  // Emulate `request`
  ahr = function (options, callback) {
    return ahr.http(options).when(callback || function () {});
  };
  ahr.join = Futures.join;

  if ('undefined' !== typeof console) {
    ahr.log = console.log || function () {};
  }
  ahr.log = (!debug) ? function () {} : (ahr.log || function () {});
  
  if (!Object.keys) {
    require('es5');
  }

  function cloneJson(obj) {
    // Loses functions, but oh well
    return JSON.parse(JSON.stringify(obj));
  }


  globalOptions = {
    port: 80,
    host: 'localhost',
    ssl: false,
    protocol: 'http',
    method: 'GET',
    headers: {
      //'accept': "application/json; charset=utf-8, */*; q=0.5"
    },
    pathname: '/',
    search: '',
    redirectCount: 0,
    redirectCountMax: 5,
    params: {},
    // contentType: 'json',
    // accept: 'json',
    followRedirect: true,
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
    if ('object' !== typeof json) {
      return json;
    }
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

  function extendUrl(uri, params) {
    var query;

    uri = uri || "";
    params = params || {};
    query = jsonUriEncode(params);

    // cut the leading '&' if no other params have been written
    if (query.length > 0) {
      if (!uri.match(/\?/)) {
        uri += '?' + query;
      } else {
        uri += '&' + query;
      }
    }
    return uri;
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
  function overExtend(global, local) {
    //global = cloneJson(global);
    Object.keys(local).forEach(function (key) {
      global[key] = local[key];
    });
    return global;
  }

  // useful for extending global options onto a local variable
  function underExtend(local, global) {
    // TODO copy functions
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
    ahr[verb.toLowerCase()] = function (uri, params, options, callback) {
      if (callback) {
        return ahr[verb.toLowerCase()](uri, params, options).when(callback);
      }
      options = options || {};

      options.method = verb;
      options.uri = uri || "";
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
    ahr[verb.toLowerCase()] = function (uri, params, body, options, callback) {
      if (callback) {
        return ahr[verb.toLowerCase()](uri, params, body, options).when(callback);
      }
      options = options || {};

      options.method = verb;
      options.uri = uri || "";
      // TODO global params
      options.params = underExtend(params || {}, options.params || {});
      options.body = body;

      return ahr.http(options);
    };
  });

  // HTTPS
  ahr.https = function (options, callback) {
    if (callback) {
      return ahr.https(options).when(callback);
    }
    options.ssl = true;
    options.protocol = "https";
    return ahr.http(options);
  };

  // JSONP
  ahr.jsonp = function (uri, jsonp, params, options, callback) {
    if (callback) {
      return ahr.jsonp(uri, jsonp, params, options).when(callback);
    }
    options = options || {};

    ahr.log("hello from jsonp");

    if (!jsonp) {
      throw new Error("'jsonp' is not an optional parameter.\n" +
        "If you believe that this should default to 'callback' rather" +
        "than throwing an error, please file a bug");
    }

    options.uri = uri || "";
    options.params = underExtend(params || {}, options.params || {});
    options.jsonp = jsonp;

    if (options.body) {
      throw new Error("The de facto standard is that 'jsonp' should not have a body.\n" +
        "If you consider filing this as a bug please give an explanation.");
    }

    // TODO determine same-domain XHR or XHR2/CORS or SSJS
    return ahr.http(options);
  };

  function nodeHttpClient(options) {
    ahr.log("nodeHttpClient");
    var http = require('http'),
      promise = Futures.promise(),
      request,
      timeoutToken,
      response,
      cancelled = false;
    
    underExtend(options.headers, {'user-agent': 'Node.js (AbstractHttpRequest)'});

    // Set timeout for initial contact of server
    timeoutToken = setTimeout(function () {
      promise.fulfill('timeout', response, undefined);
      cancelled = true;
    }, options.timeout);

    // create Connection, Request
    //console.log(options.port, options.hostname, options.ssl);
    options.client = http.createClient(options.port, options.hostname, options.ssl);
    if (options.auth) {
      options.headers['authorization'] = 'Basic ' + (new Buffer(options.auth, 'utf8')).toString('base64');
    }
    //console.log(options.method, options.requestPath, JSON.stringify(options.headers), options.encodedBody);
    request = options.client.request(options.method, options.requestPath, options.headers);
    request.end(options.encodedBody);

    options.syncback(request);

    //console.dir(request);
    request.on('response', function (p_response) {
      var data = '', err = '';
      response = p_response;
      //console.dir(p_response);

      if (cancelled) {
        return;
      }

      // Set timeout for request
      clearTimeout(timeoutToken); // Clear connection timeout
      timeoutToken = setTimeout(function () {
        promise.fulfill('timeout');
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
        } else if (response.statusCode && 
                    response.statusCode >= 300 && 
                    response.statusCode !== 304 && 
                    response.headers.location &&
                    options.followRedirect && 
                    options.redirectCount < options.redirectCountMax) {
          ahr.log("Redirect");
          // Redirect when requested
          // TODO set max redirect
          options.uri = response.headers.location;
          options.redirectCount += 1;
          delete options.client;
          if (options.headers) {
            delete options.headers.host;
          }
          ahr.log(options);
          ahr.http(options).when(promise.fulfill);
          return;
        }
        if ('undefined' === typeof err && options.jsonp && data) {
          // TODO remove func exp
          global[options.jsonpCallback] = function (data) {
            JSON.parse(JSON.stringify(data));
            promise.fulfill(err, response, data);
            global[options.jsonpCallback] = undefined;
            try {
              delete global[options.jsonpCallback];
            } catch(e) {}
          };
          // this will be a wrapped object
          eval(data);
          return;
        }
        promise.fulfill(err, response, data);
      });
    });

    return promise.passable();
  }

  function browserJsonpClient(options) {
    // TODO check for Same-domain / XHR2/CORS support
    // before attempting to insert script tag
    // Those support headers and such, which are good
    var cbkey = options.jsonpCallback,
      script = document.createElement("script"),
      head = document.getElementsByTagName("head")[0] || document.documentElement,
      promise = Futures.promise(),
      timeout,
      jsonp = {},
      fulfilled; // TODO add status to Futures

    jsonp[options.jsonp] = options.jsonpCallback;
    options.uri = extendUrl(options.uri, jsonp);

    // cleanup: cleanup window and dom
    function cleanup() {
      ahr.log('cleanup');
      window[cbkey] = undefined;
      try {
        delete window[cbkey];
        // may have already been removed
        head.removeChild(script);
      } catch(e) {}
    }

    // onError: Set timeout if script tag fails to load
    if (options.timeout) {
      timeout = setTimeout(function () {
        ahr.log("timeout-log-1");
        fulfilled = true;
        promise.fulfill.apply(null, arguments);
        cleanup();
      }, 
        options.timeout,
      [
        "timeout", 
        {readyState: 1, script: true, error: timeout},
        undefined
      ]);
    }

    // onSuccess: Sanatize data, Send, Cleanup
    window[cbkey] = function (data) {
      ahr.log('success');
      if (fulfilled) {
        return;
      }
      ahr.log(data);

      clearTimeout(timeout);
      // sanitize
      JSON.parse(JSON.stringify(data));
      promise.fulfill(undefined, {readyState: 4}, data);

      cleanup();
    };

    // Insert JSONP script into the DOM
    // set script source to the service that responds with thepadded JSON data
    script.setAttribute("type", "text/javascript");
    script.setAttribute("async", "async");
    script.setAttribute("src", options.uri);
    head.insertBefore(script, head.firstChild);
    setTimeout(function() {
      ahr.log('post-jsonp window and dom cleanup');
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
    ahr.log("hello from browserHttp");
    ahr.log(options);
    if (options.jsonpCallback) {
      return browserJsonpClient(options);
    }
    // So far, these quirks are accounted for:
    // http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html
    // jQuery is still better
    var xhr,
      timeout,
      fulfilled,
      twocalled,
      promise = Futures.promise();

    if (!window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
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
        promise.fulfill(undefined, xhr, data);
      }
    }

    timeout = setTimeout(function () {
        ahr.log('timeout-log browserHttpClient-2');
        promise.fulfill("timeout", xhr, undefined);
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
      xhr.open(options.method, options.uri, true, options.username, options.password);
    } else {
      xhr.open(options.method, options.uri, true);
    }
    xhr.onreadystatechange = onReadyStateChange;
    xhr.send(options.encodedBody);

    return promise.passable();
  }

  function jQueryHttpClient(options) {
    ahr.log("hello from jQuery");
    var $ = require('jQuery'),
      promise = Futures.promise(),
      jqOpts,
      xhr,
      timeoutToken;

    // For cross-site and other invalid requests, the
    // default error handler is never triggered, so it
    // will look like a timeout
    timeoutToken = setTimeout(function () {
      // rumor has it that sometimes jQuery's timeout doesn't fire (jsonp, for example)
      try {
        promise.fulfill('timeout', xhr, undefined);
      } catch(e) {}
    }, options.timeout + 100);

    jqOpts = {
      async: true,
      beforeSend: function (xhr) {
        // TODO options.beforeSend
        // Add Headers
        Object.keys(options.headers).forEach(function (label) {
          try {
            xhr.setRequestHeader(label, options.headers[label]);
          } catch(e) {
            // TODO log the failure
          }
        });
      },
      // cache: false, // default true
      complete: function (xhr, data) {
        clearTimeout(timeoutToken);
      },
      contentType: options.headers["content-type"],
      // context: this,
      data: options.body,
      // dataFilter : function (data, type) {},
      // dataType: 'xml', 'html', 'script', 'json', 'jsonp', 'text'
      error: function (xhr, textStatus, errorThrown) {
        promise.fulfill(errorThrown, xhr, textStatus);
      },
      // global: true,
      // ifModified: false,
      jsonp: options.jsonp,
      // jsonpCallback: options.jsonp ? options.params[options.jsonp] : undefined,
      password: options.password,
      // processData: true, // -> x-www-form
      // scriptCharset: "utf-8", //?
      success: function (data, textStatus, xhr) {
        promise.fulfill(undefined, xhr, data);
      },
      timeout: options.timeout,
      // traditional: false,
      type: options.method,
      url: options.uri,
      username: options.username,
      // xhr: function () {}
    };
    overExtend(jqOpts, options.jQopts);

    xhr = $.ajax(jqOpts);

    options.syncback(xhr);
    // TODO throw new Error("'syncback' must be a function which accepts the immediate return value of Browser.XHR or Node.HCR");

    return promise.passable();
  }

  if ('undefined' === typeof XMLHttpRequest && 'undefined' === typeof ActiveXObject) {
      if ('undefined' === typeof require) {
        throw new Error("This doesn't appear to be a browser, nor Node.js.\n" +
          "Please write a wrapper and submit a patch or issue to github.com/coolaj86/ahr");
    }
    nativeHttpClient = nodeHttpClient;
  } else if ('undefined' !== typeof jQuery){
    nativeHttpClient = jQueryHttpClient;
  } else {
    ahr.log('selecting browser client');
    nativeHttpClient = browserHttpClient;
  }

  function objectToLowerCase(obj, recurse) {
    // Make headers all lower-case
    Object.keys(obj).forEach(function (key) {
      var key, value;
      value = obj[key];
      delete obj[key];
      if ('string' == typeof value) {
        obj[key.toLowerCase()] = value.toLowerCase();
      }
    });
    return obj;
  }


  function allowsBody(method) {
    return 'HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method;
  }

  ahr.http = function (options, callback) {
    if (callback) {
      return ahr.jsonp(options).when(callback);
    }
    var presets = cloneJson(globalOptions);

    if ('string' === typeof options) {
      options = {
        uri: options
      };
    }
    options = options || {};
    options.syncback = options.syncback || function () {};
    options.headers = options.headers || {};

    // Authorization
    if (options.username && options.password) {
      options.auth = options.username + ':' + options.password;
    } else if (options.auth) {
      options.username = options.auth.split(':')[0];
      options.password = options.auth.split(':')[1];
    }

    // Parse URL
    options.uri = extendUrl(options.uri, options.params);
    options = overExtend(options, url.parse(options.uri));
    ahr.log("Blah: ");
    ahr.log(options);
    options.uri = options.url || options.uri;
    if ('https' === options.protocol || '443' === options.port || true === options.ssl) {
      presets.ssl = true;
      presets.port = '443';
      presets.protocol = 'https';
      options.protocol = 'https';
    }

    // Set options according to URL
    options.headers = objectToLowerCase(options.headers || {});
    options.headers = underExtend(options.headers, presets.headers);
    options.headers['host'] = options.hostname;
    options = underExtend(options, presets);
    options.requestPath = extendUrl(options.pathname + options.search, options.params);
    // TODO user-agent should retain case
    options.headers = objectToLowerCase(options.headers);
    

    // Create & Send body
    options.headers["transfer-encoding"] = undefined; // TODO support streaming
    delete options.headers["transfer-encoding"];
    if (options.body && allowsBody(options.method)) {
      if ('string' === typeof options.body) {
        options.encodedBody = options.body;
      }
      if (!options.encodedBody) {
        if (options.headers["content-type"].match(/application\/json/) || options.headers["content-type"].match(/text\/javascript/)) {
          options.encodedBody = JSON.stringify(options.body);
        } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
          options.encodedBody = jsonUriEncode(options.body);
        } else if (!options.encodedBody) {
          throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
        }
        options.headers["content-length"] = options.encodedBody.length;
      }
      if (!options.headers["content-type"]) {
        options.headers["content-type"] = "application/x-www-form-urlencoded";
      }
    } else {
      if (options.body) {
        throw new Error('You gave a body for one of HEAD, GET, DELETE, or OPTIONS');
      }
      options.encodedBody = "";
      options.headers["content-type"] = undefined;
      options.headers["content-length"] = undefined;
      options.headers["transfer-encoding"] = undefined;
      delete options.headers["content-type"];
      delete options.headers["content-length"];
      delete options.headers["transfer-encoding"];
    }

    // JSONP
    if (options.jsonp) {
      options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
      options.headers["accept"] = "text/javascript";
      options.dataType = 'jsonp';
      options.jQopts = options.jQopts || {};
      options.jQopts.dataType = options.dataType;
    }

    ahr.log(options);

    return nativeHttpClient(options);
  };

  module.exports = ahr;
  if ('undefined' === typeof provide) { provide = function () {}; }
  provide('ahr');
}());
