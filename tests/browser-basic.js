(function () {
  var ahr = require('ahr'),
    tests;

  // TODO test against XHR2 / CORS enabled sites
  tests = {
    "simple200": "http://www.google.com",
    "redirect301": "http://coolaj86.github.com",
    "encodedUrl": "http://www.google.com/search?hl=en&client=firefox-a&rls=org.mozilla%3Aen-US%3Aofficial&q=%22json+to+x-www-form-urlencoded%22&aq=f&aqi=&aql=&oq=&gs_rfai=",
  }

  Object.keys(tests).forEach(function (key) {
    // As simple as it gets
    ahr.http({
      url: tests[key],
      method: 'GET'
    }).when(function (err, xhr, data) {
      if (err) {
        console.log("\n'" + key + "' FAIL...");
        console.log('Status: ' + xhr.statusText);
        console.log('Headers: ' + JSON.stringify(xhr.getAllResponseHeaders()));
        console.log('Error: ');
        console.log(err);
        console.log(data);
        return;
      }
      console.log("'" + key + "' Pass");
    });
  });
}());
