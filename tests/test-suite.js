(function () {
  "use strict";

  // TODO an assert that calls next

  var request = require('../lib') //('ahr2')
    , assert = require('assert')
    , sequence = require('sequence')()
    , mockHostName = 'foobar3000.com'
    , mockHostPort = '3223'
    , mockHost = mockHostName + (mockHostPort ? ':' + mockHostPort : '')
    ;

  function assertDeepAlike(a, b, key) {
    var alike = true
      , res;

    if ('object' !== typeof a) {
      res = (a === b);
      if (!res) {
        console.error('dissimilar:', key, a, b);
      }
      return res;
    }

    if ('object' !== typeof b) {
      console.error('type mismatch');
      console.info(a);
      console.info(b);
      return false;
    }

    Object.keys(a).forEach(function (key) {
      alike = alike && assertDeepAlike(a[key], b[key], key);
    });

    return alike;
  }

  function hrefHost(next) {
    // curl "http://localhost:8000"
    var href = "http://" + mockHost + "/echo.json"
      ;

    request(
        href
      , function (err, ahr, data) {
          var mockObj
            ;

          mockObj = {
              "pathname": "/echo.json"
            , "method": "GET"
            , "headers": {
                  "host": mockHost
              }
            , "trailers": {}
          };

          assert.ok(!err);
          assert.ok(assertDeepAlike(mockObj, data));

          next();
        }
    );
  }

  function hrefHostPathQuery(next) {
    // curl "http://localhost:8000?foo=bar&baz=qux&baz=quux&corge"
    var href = "http://" + mockHost + "/echo.json?foo=bar&baz=qux&baz=quux&corge"
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
            , "pathname": "/echo.json"
            , "method": "GET"
            , "headers": {
                  "host": mockHost
              }
          }, data));
          next();
        }
    );
  }

  function paramsHrefBody(next) {
    // curl "http://localhost:8000?foo=bar&baz=qux&baz=quux&corge" -d ''
    var href = "http://" + mockHost + "/echo.json?foo=bar&baz=qux&baz=quux&corge"
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
          var mockObj
            ;

          mockObj = {
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
            , "pathname": "/echo.json"
            , "method": "POST"
            , "headers": {
                  "host": mockHost
                , "content-type": "application/json"
              //, "content-type": "application/x-www-form-urlencoded"
              }
          };

          assert.ok(assertDeepAlike(mockObj, data));
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
          , hostname: mockHostName
          , port: mockHostPort
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
          var mockObj
            ;
          
          mockObj = {
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
                  "host": mockHost
              }
          };

          assert.ok(assertDeepAlike(mockObj, data));
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
      console.info('[PASS] all tests passed');
    });
    ;

}());
