/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var fs = require('fs');

  function nodeFileClient(req, res) {
    var options = req.userOptions
      , size = 0
      , data = []
      , reqEv;

    function onFreadData(chunk) {
      size += chunk.length;
      res.emit('progress', {
          lengthComputable: true
        , loaded: size
        , total: size
      });
      res.emit('data', chunk);
      data.push(chunk);
    }

    function onFreadError(err) {
      res.emit('error', err);
    }

    function onFreadEnd() {
      var buffer = Buffer.concat(data);
      res.emit('load', {
          lengthComputable: true
        , loaded: size
        , total: size
        , target: {
            result: buffer
          }
      });
    }

    // Request automatically succeeds
    reqEv = {
      lengthComputable: false,
      loaded: 0,
      total: undefined
    };
    req.emit('loadstart', reqEv);
    req.emit('load', reqEv);
    req.emit('loadend', reqEv);

    // Response... not so much
    // TODO JSON, MIME, etc
    res = fs.createReadStream(options.pathname);
    res.on('error', onFreadError);
    res.on('data', onFreadData);
    res.on('end', onFreadEnd);

    return res;
  }

  module.exports = nodeFileClient;
}());
