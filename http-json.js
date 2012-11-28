/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true undef:true unused:true*/
(function () {
  "use strict";

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

      console.log('[JSON] matched prequest');
      next();
    });

    anr.for('response', function (res, next) {
      console.log('[JSON] attempt response -----------------------------------');
      var data = ''
        ;

      if (res.__json) {
        next();
        return;
      }
      res.__json = true;

      console.log('[JSON] headers');
      console.log(res.headers);
      if (!/json/.test(res.headers['content-type'])) {
        console.log('[JSON] skip: no json in content-type');
        next();
        return;
      }

      res.on('data', function (chunk) {
        console.log('[JSON] data');
        data += chunk.toString();
      });

      res.on('end', function () {
        console.log('[JSON] end');
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
