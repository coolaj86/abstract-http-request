/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  function json(anr) {
    anr.for('prequest', function (req, next) {
      /*jshint sub:true*/
      console.log('[JSON] req', req);
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

      console.log('[JSON] did prequest');
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

      console.log('[JSON] ----------------------------------------------', res.headers);
      if (!/json/.test(res.headers['content-type'])) {
        console.log('[JSON] skip: no json in content-type');
        next();
        return;
      }

      res.on('data', function (chunk) {
        console.log('onData');
        data += chunk.toString();
      });

      res.on('end', function () {
        console.log('onEnd');
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
