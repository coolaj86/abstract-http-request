/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  var request = require('./anr')
    , req
    ;

  req = request.create()
    .extend(request.Http())
    .use('http://example.com', '/account', request.json())
    .use(request.json())
    .use(request.text())
    ;

  req.get('http://foobar3000.com/echo/example.json').when(function (err, ahr, data) {
    console.log('.when called!!! YAY');
    console.error('error', err);
    console.log('headers', ahr.headers);
    console.log('data', data);
  });
}());
