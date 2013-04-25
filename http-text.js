(function () {
  "use strict";

  function log() {
    if (false) {
      console.log.apply(console, arguments);
    }
  }

  function text(anr) {
    anr.for('prequest', function (req, next) {
      /*jshint sub:true*/
      var accept = req.headers['accept']
        ;

      // text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5
      if (!accept) {
        req.headers['accept'] = "";
      }

      // TODO handle accept header with array where the first is the most desired???
      if (!/text/.test(accept)) {
        if (accept) {
          req.headers['accept'] += ', text/plain;q=0.5';
        } else {
          req.headers['accept'] += 'text/plain;q=1.0';
        }
      }

      log('[TEXT] matched prequest');
      next();
    });

    anr.for('response', function (res, next) {
      log('[TEXT] attempt response -----------------------------------');
      var data = ''
        ;

      if (res.__text) {
        next();
        return;
      }
      res.__text = true;

      if (!/text/.test(res.headers['content-type'])) {
        log('[TEXT] skip: no text in content-type');
        next();
        return;
      }

      res.on('data', function (chunk) {
        log('[TEXT] onData', chunk);
        data += chunk;
      });

      res.on('end', function () {
        log('[TEXT] onEnd');
        res.body = data;
        next();
      });
    });
  }

  module.exports = function () {
    return text;
  };
}());
