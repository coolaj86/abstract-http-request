/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
(function () {
  "use strict";

  var globalOptions
    , exports = module.exports
    , location = require('./location')
    , FileApi = require('file-api')
    , File = FileApi.File
    , FileList = FileApi.FileList
    , FormData = FileApi.FormData
    , url = require('url')
    , uriEncoder = require('./uri-encoder')
    , uriEncodeObject = uriEncoder.uriEncodeObject
    , utils = require('./utils')
    , clone = utils.clone
    , preset = utils.preset
    , objectToLowerCase = utils.objectToLowerCase;

  globalOptions = {
    port: 80,
    host: 'localhost',
    ssl: false,
    protocol: 'file:',
    method: 'GET',
    headers: {
      //'accept': "application/json; charset=utf-8, */*; q=0.5"
    },
    pathname: '/',
    search: '',
    redirectCount: 0,
    redirectCountMax: 5,
    query: {},
    // contentType: 'json',
    // accept: 'json',
    followRedirect: true,
    timeout: 20000
  };


  //
  // Manage global options while keeping state safe
  //
  exports.globalOptionKeys = function () {
    return Object.keys(globalOptions);
  };

  exports.globalOption = function (key, val) {
    if ('undefined' === typeof val) {
      return globalOptions[key];
    }
    if (null === val) {
      val = undefined;
    }
    globalOptions[key] = val;
  };

  exports.setGlobalOptions = function (bag) {
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

  function parseAuth(options) {
    var auth = options.auth
      , username
      , password;

    if (auth) {
      username = auth.split(':')[0] || "";
      password = auth.split(':')[1] || "";
    }

    preset(options, {
      username: username,
      password: password
    });

    return options;
  }

  function parseHost(options) {
    var auth
      , host = options.host
      , port
      , hostname
      , username
      , password;

    if (!host) {
      return options;
    }
    if (/@/.test(host)) {
      auth = host.substr(0, '@');
      host = host.substr('@' + 1);
      if (auth) {
        username = auth.split(':')[0] || "";
        password = auth.split(':')[1] || "";
      }
    }
    if (/:/.test(host)) {
      port = host.substr(0, ':');
      hostname = host.substr(':' + 1);
    }

    preset(options, {
      username: username,
      password: password,
      hostname: hostname,
      port: port
    });

    return options;
  }

  // href should be parsed if present
  function parseHref(options) {
    var urlObj;

    if (!options.href) {
      return options;
    }
    if (-1 === options.href.indexOf('://')) {
      options.href = url.resolve(location.href, options.href);
    }
    urlObj = url.parse(options.href || "", true);

    preset(options, urlObj);

    return options;
  }

  function handleUri(options) {
    var presets;

    presets = clone(globalOptions);

    if (!options) {
      throw new Error('ARe yOu kiddiNg me? You have to provide some sort of options');
    }

    if (options.uri || options.url) {
      console.log('Use `options.href`. `options.url` and `options.uri` are obsolete');
    }
    if (options.params) {
      console.log('Use `options.query`. `options.params` is obsolete');
    }

    if ('string' === typeof options) {
      options = {
        href: options
      };
    }

    options.syncback = options.syncback || function () {};

    // Use SSL if desired
    if ('https:' === options.protocol || '443' === options.port || true === options.ssl) {
      presets.ssl = true;
      presets.port = '443';
      presets.protocol = 'https:';
      // hopefully no one would set prt 443 to standard http
      options.protocol = 'https:';
    }

    options.href = options.href || options.uri || options.url;
    options.query = options.query || options.params || {};

    if (options.jsonp) {
      // i.e. /path/to/res?x=y&jsoncallback=jsonp8765
      // i.e. /path/to/res?x=y&json=jsonp_ae75f
      options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
      options.dataType = 'jsonp';
      options.query[options.jsonp] = options.jsonpCallback;
    }

    // TODO auth or username and password
    parseAuth(options);
    // TODO host or auth, hostname, and port
    parseHost(options);
    // TODO href and query; or host
    parseHref(options);
    options.href = url.format(options);

    preset(options, presets);

    return options;
  }

  function handleHeaders(options) {
    var presets;

    presets = clone(globalOptions);

    options.headers = options.headers || {};
    if (options.jsonp) {
      options.headers.accept = "text/javascript";
    }
    // TODO user-agent should retain case
    options.headers = objectToLowerCase(options.headers || {});
    options.headers = preset(options.headers, presets.headers);
    options.headers.host = options.hostname;
    options.headers = objectToLowerCase(options.headers);

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
        options.headers["content-type"] = "multipart/form-data";
        return;
      }

      if ('string' === typeof options.body) {
        options.encodedBody = options.body;
      }

      if (!options.encodedBody) {
        if (options.headers["content-type"].match(/application\/json/) || 
            options.headers["content-type"].match(/text\/javascript/)) {
          options.encodedBody = JSON.stringify(options.body);
        } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
          options.encodedBody = uriEncodeObject(options.body);
        } else if (!options.encodedBody) {
          throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
        }
        options.headers["content-length"] = options.encodedBody.length;
      }

      if (!options.headers["content-type"]) {
        options.headers["content-type"] = "application/x-www-form-urlencoded";
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

    if (options.body) {
      bodyEncoder(options);
    } else { // no body || body not allowed
      removeContentBodyAndHeaders(options);
    }
  }

  exports.handleOptions = function (options) {
    handleUri(options);
    handleHeaders(options);
    handleBody(options);

    return options;
  };

  module.exports = exports;
}());
