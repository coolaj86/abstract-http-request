(function () {
  "use strict";

  // TODO an assert that calls next

  var request = require('ahr2')
    , assert = require('assert')
    , sequence = require('sequence')()
    ;

  function assertDeepAlike(a, b) {
    var alike = true
      , res;

    if ('object' !== typeof a) {
      res = a === b;
      if (!res) {
        console.log('dissimilar:', a, b);
      }
      return a === b;
    }

    Object.keys(a).forEach(function (key) {
      alike = alike && assertDeepAlike(a[key], b[key]);
    });

    return alike;
  }

  function hrefHost(next) {
    // curl "http://localhost:8000"
    var href = "http://localhost:8000"
      ;

    request(
        href
      , function (err, ahr, data) {
          assert.ok(!err);
          assert.ok(assertDeepAlike({
              "pathname": "/"
            , "method": "GET"
            , "headers": {
                  "host": "localhost:8000"
              }
            , "trailers": {}
          }, data));

          next();
        }
    );
  }

  function hrefHostPathQuery(next) {
    // curl "http://localhost:8000?foo=bar&baz=qux&baz=quux&corge"
    var href = "http://localhost:8000?foo=bar&baz=qux&baz=quux&corge"
      ;

    request(
        href
      , function (err, ahr, data) {
          assert.ok(assertDeepAlike({
              "query": {
                  "foo": "bar"
                , "baz": [
                      "qux"
                    , "quux"
                  ]
                , "corge": ""
              }
            , "pathname": "/"
            , "method": "GET"
            , "headers": {
                  "host": "localhost:8000"
              }
          }, data));
          next();
        }
    );
  }

  function paramsHrefBody(next) {
    // curl "http://localhost:8000?foo=bar&baz=qux&baz=quux&corge" -d ''
    var href = "http://localhost:8000?foo=bar&baz=qux&baz=quux&corge"
      , body = {
            "grault": "garply"
          , "waldo": [
                "fred"
              , "plug"
              , "xyzzy"
            ]
          , "thud": ""
        }
      ;

    request(
        {
            href: href
          , body: body
        }
      , function (err, ahr, data) {
          assert.ok(assertDeepAlike({
              "query": {
                  "foo": "bar"
                , "baz": [
                      "qux"
                    , "quux"
                  ]
                , "corge": ""
              }
            , "body": {
                  "grault": "garply"
                , "waldo": [
                      "fred"
                    , "plug"
                    , "xyzzy"
                  ]
                , "thud": ""
              }
            , "pathname": "/"
            , "method": "POST"
            , "headers": {
                  "host": "localhost:8000"
                , "content-type": "application/json"
              //, "content-type": "application/x-www-form-urlencoded"
              }
          }, data));
          next();
        }
    );
  }

    // curl "http://localhost:8000?foo=bar&baz=qux&baz=quux&corge" -d 'blahblah=yada&yada=blah'
  function paramsFull(next) {
    // curl "http://localhost:8000/doesntexist?foo=bar&baz=qux&baz=quux&corge"
    var params = {
            //href: "http://localhost:8000/doesntexist?foo=bar&baz=qux&baz=quux&corge"
            /*
              protocol, hostname, and port can be taken from location.js
            */
            protocol: "http:"
          //, host: "localhost:8000"
          , hostname: "localhost"
          , port: "8000"
          , pathname: "/doesntexist"
          , query: {
                "foo": "bar"
              , "baz": [
                    "qux"
                  , "quux"
                ]
              , "corge": ""
            }
        }
      ;

    request(
        params
      , function (err, ahr, data) {
          assert.ok(assertDeepAlike({
              "query": {
                  "foo": "bar"
                , "baz": [
                      "qux"
                    , "quux"
                  ]
                , "corge": ""
              }
            , "pathname": "/doesntexist"
            , "method": "GET"
            , "headers": {
                  "host": "localhost:8000"
              }
          }, data));
          next();
        }
    );
  }

  function paramsPartial(next) {
  }


  sequence
    .then(hrefHost)
    .then(hrefHostPathQuery)
    .then(paramsHrefBody)
    .then(paramsFull)
    //.then(paramsPartial)
  // TODO merge href / query
    //.then(paramsHrefQueryMerge)
    .then(function () {
      console.log('[PASS] all tests passed');
    });
    ;

}());
