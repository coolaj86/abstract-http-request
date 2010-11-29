(function () {
  var request = require('../lib/ahr'),
    tests;

  tests = [
    {
      key: "simple200",
      uri: "http://www.google.com",
      regex: /Google Search/
    },
    {
      key: "port80",
      uri: "http://www.google.com:80",
      regex: /Google Search/
    },
    {
      key: "port5984",
      uri: "http://mikeal.couchone.com:5984",
      regex: /{"couchdb":"Welcome","version":"1/
    },
    {
      key: "POST json",
      uri: "http://mikeal.couchone.com:5984/testjs",
      options: {
        method:'POST',
        headers: { 'content-type': 'application/json', 'accept': 'application/json'},
        body: { _id: Math.floor(Math.random()*100000000).toString() }
      },
      regex: /"ok":true/
    },
    {
      key: "redirect301",
      uri: "http://coolaj86.github.com",
      regex: /CoolAJ86/
    },
    {
      key: "encodedUrl",
      uri: "http://www.google.com/search?hl=en&client=firefox-a&rls=org.mozilla%3Aen-US%3Aofficial&q=%22json+to+x-www-form-urlencoded%22&aq=f&aqi=&aql=&oq=&gs_rfai=",
      regex: /x-www-form-urlencoded/
    },
    {
      key: "encodedParams",
      uri: "http://www.google.com/search",
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
      uri: "http://api.flickr.com/services/feeds/photos_public.gne?format=json",
      params: { tags: "cat", tagmode: "any", "jsoncallback": "jsonp_" + (new Date()).valueOf() },
      options: { jsonp: "jsoncallback" },
      regex: /jsonp_\d+\(/
    },
    {
      key: "file_relative_path1",
      uri: "16kb.dat",
      regex: /E\nF/
    },
    {
      key: "file_relative_path2",
      uri: "./16kb.dat",
      regex: /E\nF/
    },
    {
      key: "file_relative_path3",
      uri: "file:16kb.dat",
      regex: /E\nF/
    },
    {
      key: "file_absolute_path",
      uri: "file:///tmp/16kb.dat",
      regex: /E\nF/
    },
  ];

  
  /*
  tests.forEach(function (test) {
    // As simple as it gets
    test.options = test.options || {};
    test.options.uri = test.uri;
    test.options.params = test.params;
    request.http(test.options).when(function (err, response, data) {
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
  */

  //.when(handleResponses));
  function handleResponses(err, response, data, i) {
    var test = tests[i];
    if (err || !data || !data.match(test.regex)) {
      console.log("\n'" + test.key + "' FAIL...");
      console.log('Status: ' + response.statusCode);
      console.log('Headers: ' + JSON.stringify(response.headers));
      console.log('Error: ' + err);
      console.log('Data: ' + data.substring(0,100) + '...');
      return;
    }
    console.log("'" + test.key + "' Passes Expected Regex Match");
  }


  var all = [];
  tests.forEach(function (test, i) {
    // As simple as it gets
    test.options = test.options || {};
    test.options.uri = test.uri;
    test.options.params = test.params;
    all.push(
      request.http(test.options)
        .when(function (err, response, data) {
            handleResponses.call(null, err, response, data, i);
        })
    );
  });

  console.log("If nothing happens, then the joins failed");
  request.join(all)
    .when(function (arr) {
      console.log("'join' Passes.");
    });

}());
