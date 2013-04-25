(function () {
  "use strict";

  function log() {
    if (false) {
      console.log.apply(console, arguments);
    }
  }

  var util = require("util")
    , url = require('url')
    , events = require("events")
    , AnrRequest = require('./anr-request')
    , AnrResponse = require('./anr-response')
    , anr
    , key
    ;

  function request(a, b, c, d, e) {
    var req = new Anr()
      ;

    return req.http(a, b, c, d, e);
  }

  function Anr() {
    if (!(this instanceof Anr)) {
      return request.appy(null, arguments);
    }

    events.EventEmitter.call(this);
    this._anr_proto_ = Anr.prototype;
    this._wares = [];
    this._prequestWares = [];
    this._requestWares = [];
    this._responseWares = [];
  }

  util.inherits(Anr, events.EventEmitter);

  Anr.prototype.extend = function (fn) {
    if ('function' !== typeof fn) {
      console.error('extend fn:', fn);
      throw new Error('extend must receive a function');
    }
    fn(Anr);
    return this;
  };
  Anr.prototype.use = function () {
    var args = Array.prototype.slice.call(arguments)
      , fn
      , mount
      , host
      ;

    args.forEach(function (arg) {
      if ('function' === typeof arg) {
        fn = arg;
      } else if (/^\//.test(arg)) {
        mount = arg;
      } else if (/^\w+:/i.test(arg)) {
        host = arg;
      } else {
        throw new Error('Bad Argument ' + arg);
      }
    });

    // on('request', fn)
    this._wares.push([host, mount, fn]);
    return this;
  };
  Anr.prototype.for = function (type, fn) {
    if ('prequest' === type) {
      this._prequestWares.push(fn);
    } else if ('request' === type) {
      this._requestWares.push(fn);
    } else if ('response' === type) {
      this._responseWares.push(fn);
    } else {
      throw new Error('`for` can only accept functions for `prequest`, `request` and `response`.');
    }
  };
  // Unlike previous versions of AHR, this does not modify the original options
  Anr.prototype._parse = function (urlStr, options) {
    var urlObj
      , query
      ;

    options = options || {};
    if ('string' !== typeof urlStr) {
      options = urlStr;
    }

    urlStr = options.url || options.uri || options.href || urlStr;
    query = options.query || {};

    urlObj = url.parse(urlStr, true, true);
    urlObj.search = null;

    if (options.user || options.username || options.pass || options.password) {
      urlObj.auth = urlObj.auth || (options.user || options.username || '') + ':' + (options.pass || options.password || '');
    }

    Object.keys(query).forEach(function (key) {
      urlObj.query[key] = options.query[key];
    });

    Object.keys(urlObj).forEach(function (key) {
      if ('query' === key) { return; }
      var val = options[key]
        ;

      // don't replace something with '', undefined, null
      // but do replace for 0, false
      if (null === val || 'undefined' === typeof val || '' === val) {
        return;
      }

      urlObj[key] = options[key];
    });

    urlObj.headers = urlObj.headers || {};
    // TODO restrict some headers

    urlObj.body = options.body;
    urlObj.method = urlObj.method || 'GET';
    urlObj.method = urlObj.method.toUpperCase();

    if ('GET' === urlObj.method) {
      if (!urlObj.forceGetBody) {
        if (urlObj.body) {
          throw new Error(
              'refusing to set a body for a GET. use `forceGetBody: true` to force\n'
            + '(Your browser will probably strip the body or convert it to a POST)'
          );
        }
        urlObj.body = null;
      }
    }

    if (/^https/.test(urlObj.href) || /^https/.test(urlObj.protocol)) {
      urlObj.secure = true;
    }
    
    return urlObj;
  };
  Anr.prototype.http = function (urlStr, options) {
    log('[CORE] http');
    var context = {}
      , request
      , response
      ;

    context._options = this._parse(urlStr, options);
    log('[OPTS] http', context._options);
    request = new AnrRequest(this._prequestWares, this._requestWares, context);
    response = new AnrResponse(this._responseWares, context);

    context._request = request;
    context._response = response;
    
    log('[CORE] wares');
    this._wares.forEach(function (ware) {
      var fn = ware[2]
        , mount = ware[1]
        , host = ware[0]
        , urlObj
        ;

      if (host) {
        urlObj = url.parse(host);
        host = urlObj.host || host;
        if (!(context._options.host||"").match(host)) {
          log('[WARE] host skip', host, context._options.host);
          return;
        }
      }

      if (mount && !(context._options.pathname||"").match(mount)) {
        log('[WARE] mount skip', mount, context._options.pathname);
        return;
      }

      log('[WARE] matched for ', host, mount, JSON.stringify(fn.toString().substr(0, 30)));
      fn(this);
    }, this);

    request._prequest();
    return request;
  };

  Anr.create = function (a, b, c) {
    return new Anr(a, b, c);
  };

  // Backwards compat trickery
  anr = Anr.create();
  anr.create = Anr.create;
  anr.Http = require('./http-shortcuts');
  anr.json = require('./http-json');
  anr.text = require('./http-text');
  anr.extend(anr.Http());

  anr.use(anr.text());
  anr.use(anr.json());

  function ahr(a, b, c, d, e) {
    return anr.http(a, b, c, d, e);
  }

  // copy over the prototype methods as well
  for (key in anr) {
    ahr[key] = anr[key];
  }

  module.exports = ahr;
}());
