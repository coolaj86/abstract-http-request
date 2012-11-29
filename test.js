/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var anr = require('./anr')
    , sequence = require('sequence').create()
    , client
    ;

  client = anr.create()
    .extend(anr.Http())
    .use('http://foobar3000.com', '/echo', anr.json())
    .use(anr.text())
    .use(function (anr/*, pr, req, res*/) {
        anr.for('prequest', function (req, next) {
          req.headers['X-Test'] = 'Foo-Bar Bazzled';
          next();
        });
        anr.for('request', function (req, next) {
          if (!req.body) {
            req.end();
          }
          //next();
        });
        anr.for('response', function (res, next) {
          // TODO should be able to replace this response with another
          // I.E. 301 redirect
          console.log('[X-Test] post-others');
          console.log(res.body);
          //next();
        });
      })
    ;

  sequence
    .then(function (next) {
      var req = client.get('http://foobar3000.com/echo/example.json');
      
      
      /*
      .when(function (err, ahr, data) {
        console.log('[WHEN] I have been called!!! YAY');
        console.error('error', err);
        console.log('[WHEN] headers', ahr.headers);
        console.log('[WHEN] data', data);
      });/*.on('response', function (res) {
        var chunks = []
          ;
        console.log('response is coming ------------------------------------------------------------');
        //req.context._response
        res.on('data', function (chunk) {
          console.log('[data]');
          chunks.push(chunk);
        });
        //req.context._response
        res.on('end', function () {
          console.log('[end]');
          console.log(Buffer.concat(chunks).toString());
        });
      });
      */
    })
    .then(function () {
      var req = client.get('http://foobar3000.com/gecho/example.json').when(function (err, ahr, data) {
        console.log('.when called!!! YAY');
        console.error('error', err);
        console.log('headers', ahr.headers);
        console.log('data', data);
      });
    })
    ;
}());
