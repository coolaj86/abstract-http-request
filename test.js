/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var request = require('./anr')
    , sequence = require('sequence').create()
    , req
    ;

  req = request.create()
    .extend(request.Http())
    .use('http://foobar3000.com', '/echo', request.json())
    .use(request.text())
    ;

  sequence
    .then(function (next) {
      var res = req.get('http://foobar3000.com/echo/example.json').when(function (err, ahr, data) {
        console.log('.when called!!! YAY');
        console.error('error', err);
        console.log('headers', ahr.headers);
        console.log('data', data);
      });
      res._response.on('data', function (data) {
        console.log('[data] !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', data);
      });
      res._response.on('end', function () {
        console.log('[end] !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      });
    })
    .then(function () {
      req.get('http://foobar3000.com/gecho/example.json').when(function (err, ahr, data) {
        console.log('.when called!!! YAY');
        console.error('error', err);
        console.log('headers', ahr.headers);
        console.log('data', data);
      });
    })
    ;
}());
