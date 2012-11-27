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
    ;

  sequence
    .then(function (next) {
      var req = client.get('http://foobar3000.com/echo/example.json').when(function (err, ahr, data) {
        console.log('.when called!!! YAY');
        console.error('error', err);
        console.log('headers', ahr.headers);
        console.log('data', data);
      });
      req.context._response.on('data', function (data) {
        console.log('[data] !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', data);
      });
      req.context._response.on('end', function () {
        console.log('[end] !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      });
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
