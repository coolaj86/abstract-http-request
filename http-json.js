/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  function json(anr) {
    anr.for('request', function (req, next) {
      /*jshint sub:true*/
      console.log('req', req);
      var accept = req.headers['accept']
        ;

      // text/*;q=0.3, text/html;q=0.7, text/html;level=1, text/html;level=2;q=0.4, */*;q=0.5
      if (!accept) {
        req.headers['accept'] = "";
      }

      if (!/json/.test(accept)) {
        req.headers['accept'] += ' application/json;q=1.0';
      }

      console.log('did request');
      next();
    });

    anr.for('response', function (res, next) {
      console.log('&^%F%&^%&^%&^%^&&^%&%&^%*&^*%&^%&^*%&*%&^*%');
      var data = ''
        ;

      if (res.__json) {
        next();
        return;
      }
      res.__json = true;

      if (!/json/.test(res.headers['content-type'])) {
        next();
        return;
      }

      res.on('data', function (chunk) {
        console.log('onData');
        data += chunk;
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

      console.log('did response');
    });

    console.log('did for req / res');
  }

  module.exports = function () {
    return json;
  };
}());
