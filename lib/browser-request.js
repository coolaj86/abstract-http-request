/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
var global = window;
(function (undefined) {
  "use strict";

  var url = require('url'),
    Futures = require('futures'),
    nativeHttpClient,
    globalOptions,
    debug = false; // TODO underExtend localOptions


  function browserHttpClient(req, res) {
    var options = req.userOptions;

    ahr.log("hello from browserHttp");
    ahr.log(options);
    // So far, these quirks are accounted for:
    // http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html
    // jQuery is still better
    var xhr,
      timeout,
      fulfilled,
      twocalled,
      promise = Futures.future();

    if (!window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
    }

    function onReadyStateChange() {
      var err, ct, xml, data;
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
        if (xhr.status >= 400) {
          err = xhr.status;
        }
        promise.fulfill(err, xhr, data, true);
      }
    }

    timeout = setTimeout(function () {
        ahr.log('timeout-log browserHttpClient-2');
        promise.fulfill("timeout", xhr, undefined);
        fulfilled = true;
    }, options.timeout);

    xhr = new XMLHttpRequest();

    options.syncback(xhr);
    if (options.username) {
      xhr.open(options.method, options.uri, true, options.username, options.password);
    } else {
      xhr.open(options.method, options.uri, true);
    }
    // throws INVALID_STATE_ERROR if called before open
    Object.keys(options.headers).forEach(function (label) {
      try {
        xhr.setRequestHeader(label, options.headers[label]);
      } catch(e) {
        ahr.log('error setting unsafe header: ' + label);
        ahr.log(e);
      }
    });
    xhr.onreadystatechange = onReadyStateChange;
    xhr.send(options.encodedBody);

    return promise.passable();
  }

  function send(req, res) {
    if (options.jsonp && options.jsonpCallback) {
      return browserJsonpClient(req, res);
    }
    return browserHttpClient(req, res);
  }

  module.exports = send;
}());
