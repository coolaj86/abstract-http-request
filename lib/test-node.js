(function () {
  var ahr = require('./ahr'),
    tests;

  tests = [
    {
      key: "simple200",
      url: "http://www.google.com",
      regex: /Google Search/
    },
    {
      key: "redirect301",
      url: "http://coolaj86.github.com",
      regex: /CoolAJ86/
    },
    {
      key: "encodedUrl",
      url: "http://www.google.com/search?hl=en&client=firefox-a&rls=org.mozilla%3Aen-US%3Aofficial&q=%22json+to+x-www-form-urlencoded%22&aq=f&aqi=&aql=&oq=&gs_rfai=",
      regex: /x-www-form-urlencoded/
    },
    {
      key: "encodedParams",
      url: "http://www.google.com/search",
      params: { 
        hl: "en",
        client: "firefox-a",
        rls: "org.mozilla:en-US:official",
        q: "\"json+to+x-www-form-urlencoded\"",
        aq: "f",
        aqi: "",
        aql: "",
        oq: "",
        gs_rfai : ""
      },
      regex: /x-www-form-urlencoded/
    },
    {
      key: "jsonp",
      url: "http://api.flickr.com/services/feeds/photos_public.gne?format=json",
      params: { tags: "cat", tagmode: "any", "jsoncallback": "jsonp_" + (new Date()).valueOf() },
      options: { jsonp: "jsoncallback" },
      regex: /jsonp_\d+\(/
    }
  ];

  tests.forEach(function (test) {
    // As simple as it gets
    test.options = test.options || {};
    test.options.url = test.url;
    test.options.params = test.params;
    ahr.http(test.options).when(function (err, data, response) {
      if (err || !data || !data.match(test.regex)) {
        console.log("\n'" + test.key + "' FAIL...");
        console.log('Status: ' + response.statusCode);
        console.log('Headers: ' + JSON.stringify(response.headers));
        console.log('Error: ' + err);
        console.log('Data: ' + data.substring(0,100) + '...');
        return;
      }
      console.log("'" + test.key + "' Passes Expected Regex Match");
    });
  });
}());
