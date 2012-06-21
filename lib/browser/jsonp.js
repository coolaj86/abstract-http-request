/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
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
      , window = require('window')
      , document = require('document')
      , script = document.createElement("script")
      , head = document.getElementsByTagName("head")[0] || document.documentElement
      , addParamsToUri = require('../utils').addParamsToUri
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
        //timeout = setTimeout(onTimeout, options.timeout);
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
}());
