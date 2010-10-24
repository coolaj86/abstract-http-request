(function () {
  var ahr = require('./ahr'),
    tests;

  tests = {
    "simple200": "http://www.google.com",
    "redirect301": "http://coolaj86.github.com",
    "encodedUrl": "http://www.google.com/search?hl=en&client=firefox-a&rls=org.mozilla%3Aen-US%3Aofficial&q=%22json+to+x-www-form-urlencoded%22&aq=f&aqi=&aql=&oq=&gs_rfai=",
  }

  function responseTest(err, data, response) {
  }

  Object.keys(tests).forEach(function (key) {
    // As simple as it gets
    ahr.http({
      url: tests[key],
      method: 'GET'
    }).when(function (err, data, response) {
      if (err) {
        console.log("\n'" + key + "' FAIL...");
        console.log('Status: ' + response.statusCode);
        console.log('Headers: ' + JSON.stringify(response.headers));
        console.log('Error: ' + err);
        console.log('Data: ' + data.substring(0,100) + '...');
        return;
      }
      console.log("'" + key + "' Pass");
    });
  });
}());
