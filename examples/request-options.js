(function () {
  "use strict";
  
  var request = require('ahr2')
    ;

  // request(options).when(callback);
  request({
      "method": "POST"

    // urlObj
    , "hostname": "foobar3000.com"
    , "port": "80"
    , "pathname": "/echo"
    , "query": {
          "foo": "bar"
        , "baz": [
              "qux"
            , "quux"
          ]
        , "corge": ""
      }
    , "hash": "#grault"

    // headers
    , "headers": {
          "X-Request-Header": "Testing"
        , "Content-Type": "application/json"
      }

    // body
    , "body": {
        "garply": {
          "waldo" : "fred"
          "plugh": {
            "xyzzy": "thud"
          }
        }
      }

    // other
    , "overrideResponseType": "binary"
    , "timeout": 5000
  });

}());
