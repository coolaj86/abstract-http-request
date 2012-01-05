/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
(function () {
  "use strict";

  var globalOptions
    , ahrOptions = exports
    , url = require('url')
    , querystring = require('querystring')
    , File = require('File')
    , FileList = require('FileList')
    , atob = require('atob')
    , utils = require('./utils')
    , location
    , uriEncodeObject
    , clone
    , preset
    , objectToLowerCase
    ;

  /*
   * Some browsers don't yet have support for FormData.
   * This isn't a real fix, but it stops stuff from crashing.
   * 
   * This should probably be replaced with a real FormData impl, but whatever.
   */
  function FormData() {
  }
  
  try {
    FormData = require('FormData');
  } catch (e) {
    console.warn('FormData does not exist; using a NOP instead');
  }

  // TODO get the "root" dir... somehow
  try {
    location = require('./location');
  } catch(e) {
    location = require('location');
  }

  uriEncodeObject = utils.uriEncodeObject;
  clone = utils.clone;
  preset = utils.preset;
  objectToLowerCase = utils.objectToLowerCase;

  globalOptions = {
    ssl: false,
    method: 'GET',
    headers: {
      //'accept': "application/json; charset=utf-8, */*; q=0.5"
    },
    redirectCount: 0,
    redirectCountMax: 5,
    // contentType: 'json',
    // accept: 'json',
    followRedirect: true,
    timeout: 20000
  };


  //
  // Manage global options while keeping state safe
  //
  ahrOptions.globalOptionKeys = function () {
    return Object.keys(globalOptions);
  };

  ahrOptions.globalOption = function (key, val) {
    if ('undefined' === typeof val) {
      return globalOptions[key];
    }
    if (null === val) {
      val = undefined;
    }
    globalOptions[key] = val;
  };

  ahrOptions.setGlobalOptions = function (bag) {
    Object.keys(bag).forEach(function (key) {
      globalOptions[key] = bag[key];
    });
  };


  /*
   * About the HTTP spec and which methods allow bodies, etc:
   * http://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request
   */
  function checkBodyAllowed(options) {
    var method = options.method.toUpperCase();
    if ('HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method) {
      return true;
    }
    if (options.body && !options.forceAllowBody) {
      throw new Error("The de facto standard is that '" + method + "' should not have a body.\n" +
        "Most web servers just ignore it. Please use 'query' rather than 'body'.\n" +
        "Also, you may consider filing this as a bug - please give an explanation.\n" +
        "Finally, you may allow this by passing { forceAllowBody: 'true' } ");
    }
    if (options.body && options.jsonp) {
      throw new Error("The de facto standard is that 'jsonp' should not have a body (and I don't see how it could have one anyway).\n" +
        "If you consider filing this as a bug please give an explanation.");
    }
  }


  /*
    Node.js

    > var url = require('url');
    > var urlstring = 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash';
    > url.parse(urlstring, true);
    { href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
      protocol: 'http:',
      host: 'user:pass@host.com:8080',
      auth: 'user:pass',
      hostname: 'host.com',
      port: '8080',
      pathname: '/p/a/t/h',
      search: '?query=string',
      hash: '#hash',

      slashes: true,
      query: {'query':'string'} } // 'query=string'
  */

  /*
    Browser

      href: "http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
      protocol: "http:" 
      host: "host.com:8080"
      hostname: "host.com"
      port: "8080"
      pathname: "/p/a/t/h"
      search: '?query=string',
      hash: "#hash"

      origin: "http://host.com:8080"
   */

  function handleUri(options) {
    var presets
      , urlObj
      ;

    presets = clone(globalOptions);

    if (!options) {
      throw new Error('ARe yOu kiddiNg me? You have to provide some sort of options');
    }

    if ('string' === typeof options) {
      options = {
        href: options
      };
    }
    if (options.uri || options.url) {
      console.log('Use `options.href`. `options.url` and `options.uri` are obsolete');
      options.href = options.href || options.url || options.url;
    }
    if (options.params) {
      console.log('Use `options.query`. `options.params` is obsolete');
      options.query = options.query || options.params;
    }


    //
    // pull `urlObj` from `options`
    //
    if (options.href) {
      urlObj = url.parse(options.href, true, true);
      // ignored anyway
      delete urlObj.href;
      // these trump other options
      delete urlObj.host;
      delete urlObj.search;
    } else {
      urlObj = {
          protocol: options.protocol || location.protocol
      //  host trumps auth, hostname, and port
        , host: options.host
        , auth: options.auth
        , hostname: options.hostname || location.hostname
        , port: options.port || location.port
        , pathname: url.resolve(location.pathname, options.pathname || '') || '/'
      // search trumps query
      //, search: options.search
        , query: options.query || querystring.parse(options.search||"")
        , hash: options.hash
      };
    }
    delete options.href;
    delete options.host;
    delete options.auth;
    delete options.hostname;
    delete options.port;
    delete options.path;
    delete options.search;
    delete options.query;
    delete options.hash;

    // Use SSL if desired
    if ('https:' === urlObj.protocol || '443' === urlObj.port || true === options.ssl) {
      options.ssl = true;
      urlObj.port = urlObj.port || '443';
      // hopefully no one would set prt 443 to standard http
      urlObj.protocol = 'https:';
    }

    if ('tcp:' === urlObj.protocol || 'tcps:' === urlObj.protocol || 'udp:' === urlObj.protocol) {
      options.method = options.method || 'POST';
    }

    if (!options.method && (options.body || options.encodedBody)) {
      options.method = 'POST';
    }

    if (options.jsonp) {
      // i.e. /path/to/res?x=y&jsoncallback=jsonp8765
      // i.e. /path/to/res?x=y&json=jsonp_ae75f
      options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
      options.dataType = 'jsonp';
      urlObj.query[options.jsonp] = options.jsonpCallback;
    }

    // for the sake of the browser, but it doesn't hurt node
    if (!urlObj.auth && options.username && options.password) {
      urlObj.auth = options.username + ':' + options.password;
    } else if (urlObj.auth) {
      urlObj.username = urlObj.auth.split(':')[0];
      urlObj.password = urlObj.auth.split(':')[1];
    }

    urlObj.href = url.format(urlObj);
    urlObj = url.parse(urlObj.href, true, true);

    preset(options, presets);
    preset(options, urlObj);
    options.syncback = options.syncback || function () {};

    return options;
  }

  function handleHeaders(options) {
    var presets
      , ua
      ;

    presets = clone(globalOptions);

    options.headers = options.headers || {};
    if (options.jsonp) {
      options.headers.accept = "text/javascript";
    }
    // TODO user-agent should retain case
    options.headers = objectToLowerCase(options.headers || {});
    options.headers = preset(options.headers, presets.headers);
    // TODO port?
    options.headers.host = options.hostname;
    options.headers = objectToLowerCase(options.headers);
    if (options.contentType) {
      options.headers['content-type'] = options.contentType;
    }

    // for the sake of node, but it doesn't hurt the browser
    if (options.auth) {
      options.headers.authorization = 'Basic ' + atob(options.auth);
    }

    return options;
  }

  function hasFiles(body, formData) {
    var hasFile = false;
    if ('object' !== typeof body) {
      return false;
    }
    Object.keys(body).forEach(function (key) {
      var item = body[key];
      if (item instanceof File) {
        hasFile = true;
      } else if (item instanceof FileList) {
        hasFile = true;
      }
    });
    return hasFile;
  }
  function addFiles(body, formData) {

    Object.keys(body).forEach(function (key) {
      var item = body[key];

      if (item instanceof File) {
        formData.append(key, item);
      } else if (item instanceof FileList) {
        item.forEach(function (file) {
          formData.append(key, file);
        });
      } else {
        formData.append(key, item);
      }
    });
  }

  // TODO convert object/map body into array body
  // { "a": 1, "b": 2 } --> [ "name": "a", "value": 1, "name": "b", "value": 2 ]
  // this would be more appropriate and in better accordance with the http spec
  // as it allows for a value such as "a" to have multiple values rather than
  // having to do "a1", "a2" etc
  function handleBody(options) {
    function bodyEncoder() {
      checkBodyAllowed(options);

      if (options.encodedBody) {
        return;
      }

      //
      // Check for HTML5 FileApi files
      //
      if (hasFiles(options.body)) {
        options.encodedBody = new FormData(); 
        addFiles(options.body, options.encodedBody);
      }
      if (options.body instanceof FormData) {
        options.encodedBody = options.body;
      }
      if (options.encodedBody instanceof FormData) {
          // TODO: is this necessary? This breaks in the browser
//        options.headers["content-type"] = "multipart/form-data";
        return;
      }

      if ('string' === typeof options.body) {
        options.encodedBody = options.body;
      }

      if (!options.headers["content-type"]) {
        //options.headers["content-type"] = "application/x-www-form-urlencoded";
        options.headers["content-type"] = "application/json";
      }

      if (!options.encodedBody) {
        if (options.headers["content-type"].match(/application\/json/) || 
            options.headers["content-type"].match(/text\/javascript/)) {
          options.encodedBody = JSON.stringify(options.body);
        } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
            options.encodedBody = uriEncodeObject(options.body);
        }

        if (!options.encodedBody) {
          throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
        }

        options.headers["content-length"] = options.encodedBody.length;
      }
    }

    function removeContentBodyAndHeaders() {
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

    if ('file:' === options.protocol) {
      options.header = undefined;
      delete options.header;
      return;
    }

    // Create & Send body
    // TODO support streaming uploads
    options.headers["transfer-encoding"] = undefined;
    delete options.headers["transfer-encoding"];

    if (options.body || options.encodedBody) {
      bodyEncoder(options);
    } else { // no body || body not allowed
      removeContentBodyAndHeaders(options);
    }
  }

  ahrOptions.handleOptions = function (options) {
    handleUri(options);
    handleHeaders(options);
    handleBody(options);

    return options;
  };
}());
