/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  function text(anr) {
    anr.for('request', function (req, next) {
      /*jshint sub:true*/
      console.log('req', req);
      var accept = req.headers['accept']
        ;

      // text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5
      if (!accept) {
        req.headers['accept'] = "";
      }

      if (!/text/.test(accept)) {
        req.headers['accept'] += ' text/plain;q=0.5';
      }

      console.log('did request text');
      next();
    });

    anr.for('response', function (res, next) {
      console.log('calling the text handler');
      var data = ''
        ;

      if (res.__text) {
        next();
        return;
      }
      res.__text = true;

      if (!/text/.test(res.headers['content-type'])) {
        console.log('no content-type matching text', res.headers);
        next();
        return;
      }

      res.on('data', function (chunk) {
        console.log('TEXT onData', chunk);
        data += chunk;
      });

      res.on('end', function () {
        console.log('TEXT onEnd');
        res.body = data;
        next();
      });

      console.log('did response text');
    });

    console.log('did for req / res text');
  }

  module.exports = function () {
    return text;
  };
}());
