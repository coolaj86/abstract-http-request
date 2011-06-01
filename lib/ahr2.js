var window;
/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
(function () {
  "use strict";

  // TODO use Ender.JS in place of require-kiss
  require('require-kiss');

  var ahrOptions = require('./ahr-options')
    , utils = require('./utils')
    , EventEmitter = require('events').EventEmitter
    , Futures = require('futures')
    , preset = utils.preset
    , ahr;

  //
  // Emulate `request`
  //
  ahr = function (options, callback) {
    return ahr.http(options).when(callback || function () {});
  };
  ahr.join = Futures.join;

  ahr.globalOptionKeys = ahrOptions.globalOptionKeys;
  ahr.globalOption = ahrOptions.globalOption;
  ahr.setGlobalOptions = ahrOptions.setGlobalOptions;

  function allRequests(method, href, query, body, options, callback) {
    if (callback) {
      return allRequests(method, href, query, body, options).when(callback);
    }

    options = options || {};

    options.method = method;
    options.href = href || "";

    options.query = preset((query || {}), (options.query || {}));
    options.body = body;

    return ahr.http(options);
  }

  // HTTP jQuery-like body-less methods
  ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
    verb = verb.toLowerCase();
    ahr[verb] = function (href, query, options, callback) {
      return allRequests(verb, href, query, undefined, options, callback);
    };
  });

  // Correcting an oversight of jQuery.
  // POST and PUT can have both query (in the URL) and data (in the body)
  ['POST', 'PUT'].forEach(function (verb) {
    verb = verb.toLowerCase();
    ahr[verb] = function (href, query, body, options, callback) {
      return allRequests(verb, href, query, body, options, callback);
    };
  });


  // JSONP
  ahr.jsonp = function (href, jsonp, query, options, callback) {
    if (callback) {
      return ahr.jsonp(href, jsonp, query, options).when(callback);
    }
    options = options || {};

    if (!jsonp || 'string' !== typeof jsonp) {
      throw new Error("'jsonp' is not an optional parameter.\n" +
        "If you believe that this should default to 'callback' rather" +
        "than throwing an error, please file a bug");
    }

    options.href = href || "";
    options.query = preset(query || {}, options.query || {});
    options.jsonp = jsonp;

    // TODO move
    if (options.body) {
      throw new Error("The de facto standard is that 'jsonp' should not have a body.\n" +
        "If you consider filing this as a bug please give an explanation.");
    }

    return ahr.http(options);
  };


  // HTTPS
  ahr.https = function (options, callback) {
    if (callback) {
      return ahr.https(options).when(callback);
    }
    options.ssl = true;
    options.protocol = "https:";
    return ahr.http(options);
  };


  function NewEmitter() {
    var emitter = new EventEmitter()
      , promise = Futures.future()
      , ev = {
            lengthComputable: false
          , loaded: 0
          , total: undefined
        };

    function loadend(ev, errmsg) {
      process.nextTick(function () {
        ev.error = errmsg && new Error(errmsg);
        emitter.emit('loadend', ev);
      });
    }

    // any error in the quest causes the response also to fail
    emitter.on('loadend', function (ev) {
      emitter.done = true;
      // in FF this is only a getter, setting is not allowed
      if (!ev.target) {
        ev.target = {};
      }
      promise.fulfill(ev.error, emitter, ev.target.result, ev.err ? false : true);
    });
    emitter.on('timeout', function (ev) {
      loadend(ev, 'timeout');
    });
    emitter.on('abort', function (ev) {
      loadend(ev, 'abort');
    });
    emitter.on('error', function (err, evn) {
      // TODO rethrow the error if there are no listeners (incl. promises)
      //if (respEmitter.listeners.loadend) {}
      if (emitter.cancelled) {
        // return;
      }
      emitter.error = err;
      ev.error = err;
      if (evn) {
        ev.lengthComputable = evn.lengthComputable || true;
        ev.loaded = evn.loaded || 0;
        ev.total = evn.total;
      }
      loadend(ev);
    });
    emitter.on('load', function (evn) {
      // ensure that `loadend` is after `load` for all interested parties
      if (emitter.cancelled) {
        return;
      }
      loadend(evn);
    });

    emitter.when = promise.when;

    return emitter;
  }

  function isBrowser() {
    if ('undefined' !== typeof window) {
      return true;
    }
  }
  function isNode() {
    try {
      return global.process && global.process.nextTick && true;
    } catch (e) {
      return false;
    }
  }

  // HTTP and, well, EVERYTHING!
  ahr.http = function (options, callback) {
    var NativeHttpClient
      , req = NewEmitter()
      , res = NewEmitter()
      ;

    if (callback) {
      return ahr.http(options).when(callback);
    }

    ahrOptions.handleOptions(options);

    // todo throw all the important properties in the request
    req.userOptions = options;
    // in the browser tradition
    res.upload = req;

    // if the request fails, then the response must also fail
    req.on('error', function (err, ev) {
      res.emit('error', err, ev);
    });
    req.on('timeout', function (ev) {
      res.emit('timeout', ev);
    });
    req.on('abort', function (ev) {
      res.emit('abort', ev);
    });

    if (isBrowser()) {
      NativeHttpClient = require('./browser-request');
    } else if (isNode()) {
      global.provide = global.provide || function () {};
      NativeHttpClient = require('./node-request');
    } else {
      throw new Error('Not sure whether this is NodeJS or the Browser. Please report this bug and the modules you\'re using');
    }
    return NativeHttpClient(req, res);
  };

  module.exports = ahr;

  provide('ahr2', module.exports);
}());
