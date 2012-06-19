/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var EventEmitter = require('events').EventEmitter
    , Future = require('future')
    , Join = require('join')
    , ahrOptions
    , utils
    , preset
    ;

  function nextTick(fn, a, b, c, d) {
    try {
      process.nextTick(fn, a, b, c, d);
    } catch(e) {
      setTimeout(fn, 0, a, b, c, d);
    }
  }

  ahrOptions = require('./options');
  utils = require('./utils');
  
  preset = utils.preset;

  // The normalization starts here!
  function newEmitter() {
    var emitter = new EventEmitter()
      , promise = Future.create()
      , ev = {
            lengthComputable: false
          , loaded: 0
          , total: undefined
        };

    function loadend(ev, errmsg) {
      ev.error = errmsg && new Error(errmsg);
      nextTick(function () {
        emitter.emit('loadend', ev);
      });
    }

    emitter.done = 0;

    // any error in the quest causes the response also to fail
    emitter.on('loadend', function (ev) {
      emitter.done += 1;

      if (emitter.done > 1) {
        console.warn('loadend called ' + emitter.done + ' times');
        return;
      }

      // in FF this is only a getter, setting is not allowed
      if (!ev.target) {
        ev.target = {};
      }

      promise.fulfill(emitter.error || ev.error, emitter, ev.target.result, ev.error ? false : true);
    });

    emitter.on('timeout', function (ev) {
      emitter.error = ev;
      loadend(ev, 'timeout');
    });

    emitter.on('abort', function (ev) {
      loadend(ev, 'abort');
    });

    emitter.on('error', function (err, evn) {
      // TODO rethrow the error if there are no listeners (incl. promises)
      //if (respEmitter.listeners.loadend) {}

      emitter.error = err;
      ev.error = err;
      if (evn) {
        ev.lengthComputable = evn.lengthComputable || true;
        ev.loaded = evn.loaded || 0;
        ev.total = evn.total;
      }
      loadend(ev);
    });

    // TODO there can actually be multiple load events per request
    // as is the case with mjpeg, streaming media, and ad-hoc socket-ish things
    emitter.on('load', function (evn) {
      // ensure that `loadend` is after `load` for all interested parties
      loadend(evn);
    });

    // TODO 3.0 remove when
    emitter.when = promise.when;

    return emitter;
  }


  // backwards compat
  function ahr(options, callback) {
    return ahr.http(options, callback);
  }

  //
  // Emulate `request`
  //
  function abstractHttpRequest(options, callback) {
    var NativeHttpClient
      , req = newEmitter()
      , res = newEmitter()
      ;

    if (callback || options.callback) {
      // TODO 3.0 remove when
      return ahr.http(options).when(callback);
    }

    if ('string' === typeof options) {
      options = {
        href: options
      };
    }

    ahrOptions.handleOptions(options);

    // todo throw all the important properties in the request
    req.userOptions = options;
    // in the browser tradition
    res.upload = req;

    // if the request fails, then the response must also fail
    req.on('error', function (err, ev) {
      if (!res.error) {
        res.emit('error', err, ev);
      }
    });
    req.on('timeout', function (ev) {
      if (!res.error) {
        res.emit('timeout', ev);
      }
    });
    req.on('abort', function (ev) {
      if (!res.error) {
        res.emit('abort', ev);
      }
    });

    try {
      // tricking pakmanager to ignore the node stuff
      var client = './node';
      NativeHttpClient = require(client);
    } catch(e) {
      NativeHttpClient = require('./browser');
    }

    return NativeHttpClient(req, res);
  }
  ahr.globalOptionKeys = ahrOptions.globalOptionKeys;
  ahr.globalOption = ahrOptions.globalOption;
  ahr.setGlobalOptions = ahrOptions.setGlobalOptions;
  ahr.handleOptions = ahrOptions.handleOptions;


  // TODO 3.0 remove join
  ahr.join = Join;


  //
  //
  // All of these convenience methods are safe to cut if needed to save kb
  //
  //
  function allRequests(method, href, query, body, jsonp, options, callback) {
    options = options || {};

    if (method) { options.method = method; }
    if (href) {
      // XXX better definition for what a scheme could be
      // I believe that `wtp:localhost` is a valid url
      if (/^[\w\-]{1,8}:.+/.exec(href)) {
        options.href = href;
      } else {
        options.pathname = href;
      }
    }
    if (jsonp) { options.jsonp = jsonp; }

    if (query) { options.query = preset((query || {}), (options.query || {})); }
    if (body) { options.body = body; }

    return ahr.http(options, callback);
  }

  ahr.http = abstractHttpRequest;
  ahr.file = abstractHttpRequest;
  // TODO copy the jquery / reqwest object syntax
  // ahr.ajax = ahr;

  // HTTP jQuery-like body-less methods
  ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
    verb = verb.toLowerCase();
    ahr[verb] = function (href, query, options, callback) {
      return allRequests(verb, href, query, undefined, undefined, options, callback);
    };
  });

  // Correcting an oversight of jQuery.
  // POST and PUT can have both query (in the URL) and data (in the body)
  ['POST', 'PUT'].forEach(function (verb) {
    verb = verb.toLowerCase();
    ahr[verb] = function (href, query, body, options, callback) {
      return allRequests(verb, href, query, body, undefined, options, callback);
    };
  });

  // JSONP
  ahr.jsonp = function (href, jsonp, query, options, callback) {
    if (!jsonp || 'string' !== typeof jsonp) {
      throw new Error("'jsonp' is not an optional parameter.\n" +
        "If you believe that this should default to 'callback' rather" +
        "than throwing an error, please file a bug");
    }

    return allRequests('GET', href, query, undefined, jsonp, options, callback);
  };

  // HTTPS
  ahr.https = function (options, callback) {
    if ('string' === typeof options) {
      options = {
        href: options
      };
    }

    options.ssl = true;
    options.protocol = "https:";

    return ahr.http(options, callback);
  };

  ahr.tcp = function (options, callback) {
    if ('string' === typeof options) {
      options = {
        href: options
      };
    }

    options.protocol = "tcp:";

    return ahr.http(options, callback);
  };

  ahr.udp = function (options, callback) {
    if ('string' === typeof options) {
      options = {
        href: options
      };
    }

    options.protocol = "udp:";

    return ahr.http(options, callback);
  };

  module.exports = ahr;
}());
