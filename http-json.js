(function () {
  "use strict";

  function log() {
    if (false) {
      console.log.apply(console, arguments);
    }
  }

  function json(anr) {
    anr.for('prequest', function (req, next) {
      /*jshint sub:true*/
      var accept = req.headers['accept']
        ;

      // text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5
      if (!accept) {
        req.headers['accept'] = "";
      }

      // TODO handle accept header with array where the first is the most desired???
      if (!/json/.test(accept)) {
        if (accept) {
          req.headers['accept'] += ', application/json;q=0.5';
        } else {
          req.headers['accept'] += 'application/json;q=1.0';
        }
      }

      log('[JSON] matched prequest');
      next();
    });

    anr.for('response', function (res, next) {
      log('[JSON] attempt response -----------------------------------');
      var data = ''
        ;

      if (res.__json) {
        next();
        return;
      }
      res.__json = true;

      log('[JSON] headers');
      log(res.headers);
      if (!/json/.test(res.headers['content-type'])) {
        log('[JSON] skip: no json in content-type');
        next();
        return;
      }

      res.on('data', function (chunk) {
        log('[JSON] data');
        data += chunk.toString();
      });

      res.on('end', function () {
        log('[JSON] end');
        try {
          res.body = JSON.parse(data);
        } catch(e) {
          res.error = e;
          res.body = data;
        }
        next();
      });
    });
  }

  module.exports = function () {
    return json;
  };
}());
