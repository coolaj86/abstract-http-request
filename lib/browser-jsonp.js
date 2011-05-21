(function () {
  "use strict";

  function browserJsonpClient(req, res) {
    // TODO check for Same-domain / XHR2/CORS support
    // before attempting to insert script tag
    // Those support headers and such, which are good
    var cbkey = options.jsonpCallback
      , options = req.userOptions
      , script = document.createElement("script")
      , head = document.getElementsByTagName("head")[0] || document.documentElement
      , promise = Futures.future()
      , timeout
      , jsonp = {}
      , fulfilled; // TODO add status to Futures

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
      promise.fulfill(undefined, {readyState: 4}, data, true);

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

    return res;
  }

  module.exports = browserJsonpClient;
}());
