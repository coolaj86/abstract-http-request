(function () {
  "use strict";

  var request = require('ahr2')
    , assert = require('assert')
    , hasUnicode
    ;

  hasUnicode = {
    "87dbe29b-1f21-4ad5-bab2-c81c6cc044a3": {
      "name": "18 - If I Ain’t Got You (Live).mp3",
      "relativePath": "/Users/coolaj86/Downloads/Maroon 5/Hands All Over",
      "lastModificationDate": "2012-03-01T15:53:28.000Z",
      "size": 9663094
    }
  };

  request.post('http://foobar3000.com/echo/echo.json', null, hasUnicode).when(function (err, ahr, data) {
    assert.ok(!err, 'should not have parse error error: ' + err + String(data));
    assert.ok(data['87dbe29b-1f21-4ad5-bab2-c81c6cc044a3']);
  });

}());
