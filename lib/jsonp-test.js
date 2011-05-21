(function () {
  "use strict";

  var parseJsonp = require('./utils').parseJsonp;

  function parseJsonpWithSubStr(jsonp, jsonResp) {
    var lparen = jsonpResp.indexOf('(')
      , rparen = jsonpResp.lastIndexOf(')');

    if (!lparen) {
      return new Error('No JSONP left-paren Matched');
    }
    if (!rparen) {
      return new Error('No JSONP right-paren Matched');
    }
    // jsonPad = jsonResp.substr();
  }

  var jsonps = [
          'jsonp7634567({ "a": "b" })'
        , "jsonp7634567(   {}  )"
        , "   jsonp7634567(   {}  )   "
        , "jsonp7634567(   {}  )"
        , "jsonp7634567([2,4,8])"
        , "jsonp7634567(1)"
        , "jsonp7634567(1)"
        , "jsonp7634567(\"abc\")"
        , "jsonp7634567(\"({})\")"
        , "jsonp7634567(\"{(})\")"
        , "jsonp7634567(\"{()}\")"
        , "jsonp7634567(\"{(})\")"
        , "jsonp7634567(\"{(})\")"
      ]
    , jsonperrs = [
          "   jsonp7634567()   "
        , "   [1,3,9]   "
      ];

  var jsonpCallback = "jsonp7634567";
  jsonps.forEach(function (jsonp) {
    var data = parseJsonp(jsonpCallback, jsonp);
    console.log(data);
  });
}());
