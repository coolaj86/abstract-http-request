(function () {
  "use strict";

  var browz = require('browz')
    , browzer;

  function jsonp(req, next) {
    if (!req.jsonp) {
      next();
    }
    req.jsonpCallback = 'jsonp' + new Date().valueOf();
    req.emit('loadstart');
    // In the world of CORS/XHR2 this is a silly notion,
    // but this just serves as an example
    if ('POST' === req.method) {
      req.query['X-HTTP-Method-Override'] = 'POST';
    }
    insertScriptTag(req, function (res) {
      req.emit('load');
      req.emit('loaded');
    });
    req.on('response', function (res) {
    });
  }

  function json(res, next) {
    if (/json/.test(res.getHeader('Content-Type'))) {
      try {
        res.data = JSON.parse(data);
      } catch(e) {
        res.emit('error', );
      }
    }
  }

  function GitHub() {
    browzer = browz.up(
        browz.jsonp
      , browz.auth("user", "pass")
    ).down(
        browz.cookies
        browz.json
    );
  }

  browzer.get("http://github.com", function (res) {
    res.on('progress', function (ev) {
      if (ev.chunk) {
        md5sum.churn(ev.chunk);
      }
      console.log("Housten, we have progress");
    })
    res.on('load', function (ev) {
      if (!md5sum.length) {
        md5sum.churn(ev.data);
      }
      console.log(ev.data.username, md5sum.digest(16));
    });
  });

  /*
   ...
  */
  github.login("secret_token");
}());
