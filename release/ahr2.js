(function () {
  "use strict";

  window.process = window.process || function () {};
  window.process.nextTick = function (fn) {
    setTimeout(fn, 0);
  };
}());
(function () {
  "use strict";

  function uriEncodeObject(json) {
    var query = '';

    try {
      JSON.parse(JSON.stringify(json));
    } catch(e) {
      return 'ERR_CYCLIC_DATA_STRUCTURE';
    }

    if ('object' !== typeof json) {
      return 'ERR_NOT_AN_OBJECT';
    }

    Object.keys(json).forEach(function (key) {
      var param, value;

      // assume that the user meant to delete this element
      if ('undefined' === typeof json[key]) {
        return;
      }

      param = encodeURIComponent(key);
      value = encodeURIComponent(json[key]);
      query += '&' + param;

      // assume that the user wants just the param name sent
      if (null !== json[key]) {
        query += '=' + value;
      }
    });

    // remove first '&'
    return query.substring(1);
  }

  function addParamsToUri(uri, params) {
    var query
      , anchor = ''
      , anchorpos;

    uri = uri || "";
    anchor = '';
    params = params || {};

    // just in case this gets used client-side
    if (-1 !== (anchorpos = uri.indexOf('#'))) {
      anchor = uri.substr(anchorpos);
      uri = uri.substr(0, anchorpos);
    }

    query = uriEncodeObject(params);

    // cut the leading '&' if no other params have been written
    if (query.length > 0) {
      if (!uri.match(/\?/)) {
        uri += '?' + query;
      } else {
        uri += '&' + query;
      }
    }

    return uri + anchor;
  }

  module.exports.uriEncodeObject = uriEncodeObject;
  module.exports.addParamsToUri = addParamsToUri;

  provide('uri-encoder', module.exports);
}());
/*jslint white: false, onevar: true, undef: true, node: true, nomen: true, regexp: false, plusplus: true, bitwise: true, es5: true, newcap: true, maxerr: 5 */
(function () {
  "use strict";

  var utils = exports
    , jsonpRegEx = /\s*([\$\w]+)\s*\(\s*(.*)\s*\)\s*/;

  utils.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  // useful for extending global options onto a local variable
  utils.extend = function (global, local) {
    //global = utils.clone(global);
    Object.keys(local).forEach(function (key) {
      global[key] = local[key] || global[key];
    });
    return global;
  };

  // useful for extending global options onto a local variable
  utils.preset = function (local, global) {
    // TODO copy functions
    // TODO recurse / deep copy
    global = utils.clone(global);
    Object.keys(global).forEach(function (key) {
      if ('undefined' === typeof local[key]) {
        local[key] = global[key];
      }
    });
    return local;
  };

  utils.objectToLowerCase = function (obj, recurse) {
    // Make headers all lower-case
    Object.keys(obj).forEach(function (key) {
      var value;

      value = obj[key];
      delete obj[key];
      if ('string' === typeof value) {
        obj[key.toLowerCase()] = value.toLowerCase();
      }
    });
    return obj;
  };

  utils.parseJsonp = function (jsonpCallback, jsonp) {
    var match = jsonp.match(jsonpRegEx)
      , data
      , json;

    if (!match || !match[1] || !match[2]) {
      throw new Error('No JSONP matched');
    }
    if (jsonpCallback !== match[1]) {
      throw new Error('JSONP callback doesn\'t match');
    }
    json = match[2];

    data = JSON.parse(json);
    return data;
  };

  // exports done via util
  provide('utils', utils);
}());
(function () {
  "use strict";

  // http://www.html5rocks.com/tutorials/#file
  // http://www.html5rocks.com/tutorials/#filereader
  // http://www.html5rocks.com/tutorials/#filewriter
  // http://www.html5rocks.com/tutorials/#filesystem

  var FileApi = {
    // FormData
    // http://www.w3.org/TR/XMLHttpRequest2/
    "FormData": window.FormData,
    // File API
    // http://www.w3.org/TR/FileAPI/
    // http://www.w3.org/TR/file-upload/
    "FileList": window.FileList,
    "Blob": window.Blob,
    "File": window.File,
    "FileReader": window.FileReader,
    "FileError": window.FileError,
    // File API: Writer
    // http://www.w3.org/TR/file-writer-api/
    "BlobBuilder": window.BlobBuilder,
    "FileSaver": window.FileSaver,
    "FileSaverSync": window.FileSaverSync,
    "FileWriter": window.FileWriter,
    "FileWriterSync": window.FileWriterSync,
    // File API: Directories and System
    // http://www.w3.org/TR/file-system-api/
    // implemented by Window and WorkerGlobalScope
    "LocalFileSystem": window.LocalFileSystem,
      // requestFileSystem(type, size, successCallback, opt_errorCallback)
      "requestFileSystem": window.requestFileSystem || window.webkitRequestFileSystem,
      // resolveLocalFileSystemURL
    "LocalFileSystemSync": window.LocalFileSystemSync,
      // Asychronous FileSystem API
    "Metadata": window.Metadata,
    "Flags": window.Flags,
    "FileSystem": window.FileSystem,
    "Entry": window.Entry,
    "DirectoryEntry": window.DirectoryEntry,
    "DirectoryReader": window.DirectoryReader,
    "FileEntry": window.FileEntry,
      // Synchronous FileSystem API
    "FileSystemSync": window.FileSystemSync,
    "EntrySync": window.EntrySync,
    "DirectoryEntrySync": window.DirectoryEntrySync,
    "DirectoryReaderSync": window.DirectoryReaderSync,
    "FileEntrySync": window.FileEntrySync,
    //"FileError": window.FileError,
  };

  module.exports = FileApi;
  provide('file-api', module.exports);
}());
/*
   loadstart;
   progress;
   abort;
   error;
   load;
   timeout;
   loadend;
*/
(function () {
  "use strict";

  function browserJsonpClient(req, res) {
    // TODO check for Same-domain / XHR2/CORS support
    // before attempting to insert script tag
    // Those support headers and such, which are good
    var options = req.userOptions
      , cbkey = options.jsonpCallback
      , script = document.createElement("script")
      , head = document.getElementsByTagName("head")[0] || document.documentElement
      , addParamsToUri = require('uri-encoder').addParamsToUri
      , timeout
      , fulfilled; // TODO move this logic elsewhere into the emitter

    // cleanup: cleanup window and dom
    function cleanup() {
      fulfilled = true;
      window[cbkey] = undefined;
      try {
        delete window[cbkey];
        // may have already been removed
        head.removeChild(script);
      } catch(e) {}
    }

    function abortRequest() {
      req.emit('abort');
      cleanup();
    }

    function abortResponse() {
      res.emit('abort');
      cleanup();
    }

    function prepareResponse() {
      // Sanatize data, Send, Cleanup
      function onSuccess(data) {
        var ev = {
          lengthComputable: false,
          loaded: 1,
          total: 1
        };
        if (fulfilled) {
          return;
        }

        clearTimeout(timeout);
        res.emit('loadstart', ev);
        // sanitize
        data = JSON.parse(JSON.stringify(data));
        res.emit('progress', ev);
        ev.target = { result: data };
        res.emit('load', ev);
        cleanup();
      }

      function onTimeout() {
        res.emit('timeout', {});
        res.emit('error', new Error('timeout'));
        cleanup();
      }

      window[cbkey] = onSuccess;
      // onError: Set timeout if script tag fails to load
      if (options.timeout) {
        timeout = setTimeout(onTimeout, options.timeout);
      }
    }

    function makeRequest() {
      var ev = {}
        , jsonp = {};

      function onError(ev) {
        res.emit('error', ev);
      }

      // ?search=kittens&jsonp=jsonp123456
      jsonp[options.jsonp] = options.jsonpCallback;
      options.href = addParamsToUri(options.href, jsonp);

      // Insert JSONP script into the DOM
      // set script source to the service that responds with thepadded JSON data
      req.emit('loadstart', ev);
      try {
        script.setAttribute("type", "text/javascript");
        script.setAttribute("async", "async");
        script.setAttribute("src", options.href);
        // Note that this only works in some browsers,
        // but it's better than nothing
        script.onerror = onError;
        head.insertBefore(script, head.firstChild);
      } catch(e) {
        req.emit('error', e);
      }

      // failsafe cleanup
      setTimeout(cleanup, 2 * 60 * 1000);
      // a moot point since the "load" occurs so quickly
      req.emit('progress', ev);
      req.emit('load', ev);
    }

    setTimeout(makeRequest, 0);
    req.abort = abortRequest;
    res.abort = abortResponse;
    prepareResponse();

    return res;
  }

  module.exports = browserJsonpClient;

  provide('browser-jsonp', module.exports);
}());
/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
// This module is meant for modern browsers. Not much abstraction or 1337 majic
var window;
(function (undefined) {
  "use strict";

  var url = require('url')
    , browserJsonpClient = require('./browser-jsonp')
    , nativeHttpClient
    , globalOptions
    , restricted
    , debug = false
    ; // TODO underExtend localOptions

  // Restricted Headers
  // http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method
  restricted = [
      "Accept-Charset"
    , "Accept-Encoding"
    , "Connection"
    , "Content-Length"
    , "Cookie"
    , "Cookie2"
    , "Content-Transfer-Encoding"
    , "Date"
    , "Expect"
    , "Host"
    , "Keep-Alive"
    , "Referer"
    , "TE"
    , "Trailer"
    , "Transfer-Encoding"
    , "Upgrade"
    , "User-Agent"
    , "Via"
  ];
  restricted.forEach(function (val, i, arr) {
    arr[i] = val.toLowerCase();
  });

  if (!window.XMLHttpRequest) {
    window.XMLHttpRequest = function() {
      return new ActiveXObject('Microsoft.XMLHTTP');
    };
  }
  if (window.XDomainRequest) {
    // TODO fix IE's XHR/XDR to act as normal XHR2
    // check if the location.host is the same (name, port, not protocol) as origin
  }


  function encodeData(options, xhr2) {
    var data
      , ct = options.overrideResponseType || xhr2.getResponseHeader("content-type") || ""
      , text
      , len
      ;

    ct = ct.toLowerCase();

    if (xhr2.responseType && xhr2.response) {
      text = xhr2.response;
    } else {
      text = xhr2.responseText;
    }

    len = text.length;

    if ('binary' === ct) {
      if (window.ArrayBuffer && xhr2.response instanceof window.ArrayBuffer) {
        return xhr2.response;
      }

      // TODO how to wrap this for the browser and Node??
      if (options.responseEncoder) {
        return options.responseEncoder(text);
      }

      // TODO only Chrome 13 currently handles ArrayBuffers well
      // imageData could work too
      // http://synth.bitsnbites.eu/
      // http://synth.bitsnbites.eu/play.html
      // var ui8a = new Uint8Array(data, 0);
      var i
        , ui8a = Array(len)
        ;

      for (i = 0; i < text.length; i += 1) {
        ui8a[i] = (text.charCodeAt(i) & 0xff);
      }

      return ui8a;
    }

    if (ct.indexOf("xml") >= 0) {
      return xhr2.responseXML;
    }

    if (ct.indexOf("jsonp") >= 0 || ct.indexOf("javascript") >= 0) {
      console.log("forcing of jsonp not yet supported");
      return text;
    }

    if (ct.indexOf("json") >= 0) {
      try {
        data = JSON.parse(text);
      } catch(e) {
        data = text;
      }
      return data;
    }

    return xhr2.responseText;
  }

  function browserHttpClient(req, res) {
    var options = req.userOptions
      , xhr2
      , xhr2Request
      , timeoutToken
      ;

    function onTimeout() {
        req.emit("timeout", {});
    }

    function resetTimeout() {
      clearTimeout(timeoutToken);
      timeoutToken = setTimeout(onTimeout, options.timeout);
    }

    function sanatizeHeaders(header) {
      var value = options.headers[header];

      if (-1 !== restricted.indexOf(header.toLowerCase())) {
        console.log('Cannot set header ' + header + ' because it is restricted (http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method)');
        return;
      }

      try {
        // throws INVALID_STATE_ERROR if called before `open()`
        xhr2.setRequestHeader(header, value);
      } catch(e) {
        console.log('error setting header: ' + header);
        console.log(e);
      }
    }

    // A little confusing that the request object gives you
    // the response handlers and that the upload gives you
    // the request handlers, but oh well
    xhr2 = new XMLHttpRequest();
    xhr2Request = xhr2.upload;

    /* Proper States */
    xhr2.addEventListener('loadstart', function (ev) {
        // this fires when the request starts,
        // but shouldn't fire until the request has loaded
        // and the response starts
        req.emit('loadstart', ev);
        resetTimeout();
    }, true);
    xhr2.addEventListener('progress', function (ev) {
        if (!req.loaded) {
          req.loaded = true;
          req.emit('progress', {});
          req.emit('load', {});
        }
        if (!res.loadstart) {
          res.headers = xhr2.getAllResponseHeaders();
          res.loadstart = true;
          res.emit('loadstart', ev);
        }
        res.emit('progress', ev);
        resetTimeout();
    }, true);
    xhr2.addEventListener('load', function (ev) {
      if (xhr2.status >= 400) {
        ev.error = new Error(xhr2.status);
      }
      ev.target.result = encodeData(options, xhr2);
      res.emit('load', ev);
    }, true);
    /*
    xhr2Request.addEventListener('loadstart', function (ev) {
      req.emit('loadstart', ev);
      resetTimeout();
    }, true);
    */
    xhr2Request.addEventListener('load', function (ev) {
      resetTimeout();
      req.loaded = true;
      req.emit('load', ev);
      res.loadstart = true;
      res.emit('loadstart', {});
    }, true);
    xhr2Request.addEventListener('progress', function (ev) {
      resetTimeout();
      req.emit('progress', ev);
    }, true);


    /* Error States */
    xhr2.addEventListener('abort', function (ev) {
      res.emit('abort', ev);
    }, true);
    xhr2Request.addEventListener('abort', function (ev) {
      req.emit('abort', ev);
    }, true);
    xhr2.addEventListener('error', function (ev) {
      res.emit('error', ev);
    }, true);
    xhr2Request.addEventListener('error', function (ev) {
      req.emit('error', ev);
    }, true);
    // the "Request" is what timeouts
    // the "Response" will timeout as well
    xhr2.addEventListener('timeout', function (ev) {
      req.emit('timeout', ev);
    }, true);
    xhr2Request.addEventListener('timeout', function (ev) {
      req.emit('timeout', ev);
    }, true);

    /* Cleanup */
    res.on('loadend', function () {
      // loadend is managed by AHR
      clearTimeout(timeoutToken);
    });

    if (options.username) {
      xhr2.open(options.method, options.href, true, options.username, options.password);
    } else {
      xhr2.open(options.method, options.href, true);
    }

    Object.keys(options.headers).forEach(sanatizeHeaders);

    setTimeout(function () {
      if ('binary' === options.overrideResponseType) {
        xhr2.overrideMimeType("text/plain; charset=x-user-defined");
        xhr2.responseType = 'arraybuffer';
      }
      try {
        xhr2.send(options.encodedBody);
      } catch(e) {
        req.emit('error', e);
      }
    }, 1);
    

    req.abort = function () {
      xhr2.abort();
    };
    res.abort = function () {
      xhr2.abort();
    };

    res.browserRequest = xhr2;
    return res;
  }

  function send(req, res) {
    var options = req.userOptions;
    if (options.jsonp && options.jsonpCallback) {
      return browserJsonpClient(req, res);
    }
    return browserHttpClient(req, res);
  }

  module.exports = send;

  provide('browser-request', module.exports);
}());
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
          // TODO: is this necessary? This breaks in the browser
//        options.headers["content-type"] = "multipart/form-data";
        return;
      }

      if ('string' === typeof options.body) {
        options.encodedBody = options.body;
      }

      if (!options.headers["content-type"]) {
        options.headers["content-type"] = "application/x-www-form-urlencoded";
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

  provide('ahr-options', module.exports);
}());
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
      if (!res.error) {
        res.emit('error', err, ev);
      }
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
