(function () {
  "use strict";

  var request = require('../lib/ahr')
    , tests
    , File = require('file-api').File;

  tests = [
  /*
    {
      key: "simple200",
      href: "http://www.google.com",
      regex: /Google Search/
    },
    {
      key: "port80",
      href: "http://www.google.com:80",
      regex: /Google Search/
    },
    {
      key: "port5984",
      href: "http://mikeal.couchone.com:5984",
      regex: /{"couchdb":"Welcome","version":"1/
    },
    {
      key: "redirect301",
      href: "http://coolaj86.github.com",
      regex: /CoolAJ86/
    },
    {
      key: "encodedUrl",
      href: "http://www.google.com/search?hl=en&client=firefox-a&rls=org.mozilla%3Aen-US%3Aofficial&q=%22json+to+x-www-form-urlencoded%22&aq=f&aqi=&aql=&oq=&gs_rfai=",
      regex: /x-www-form-urlencoded/
    },
    {
      key: "encodedParams",
      href: "http://www.google.com/search",
      query: { 
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
      href: "http://api.flickr.com/services/feeds/photos_public.gne?format=json",
      query: { tags: "cat", tagmode: "any", "jsoncallback": "jsonp_" + (new Date()).valueOf() },
      //options: { jsonp: "jsoncallback" }, // turn off jsonp for regex matching
      regex: /jsonp_\d+\(/
    },
    {
      key: "POST json",
      href: "http://mikeal.couchone.com:5984/testjs",
      options: {
        method:'POST',
        headers: { 'content-type': 'application/json', 'accept': 'application/json'},
        body: { _id: Math.floor(Math.random()*100000000).toString() }
      },
      regex: /"ok":true/
    },
  */
    {
      key: "POST 16kb locally",
      href: "http://127.0.0.1:9000/blah",
      options: {
        method:'POST',
        headers: { 'accept': 'application/json'},
        body: {
            file_name: 'super hexabet file'
          , upload_file: new File('/tmp/16kb.dat')
        }
      },
      regex: /Upload in progress/
    },
    {
      key: "POST 2 1kb locally",
      href: "http://127.0.0.1:9000/blah",
      options: {
        chunked: true,
        method:'POST',
        headers: { 'accept': 'application/json'},
        body: {
            file_name_0: 'super alhpa file'
          , file_name_1: 'super beta file'
          , upload_file_0: new File('/tmp/1k_a.dat')
          , upload_file_1: new File('/tmp/1k_b.dat')
        }
      },
      regex: /Upload in progress/
    }
  /*
  */
  ];
  
  /*
  tests.forEach(function (test) {
    // As simple as it gets
    test.options = test.options || {};
    test.options.href = test.href;
    test.options.query = test.query;
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
    if (data instanceof Buffer) {
      data = data.toString();
    }
    if (err || !data || !data.match(test.regex)) {
      console.log("\n\n");
      console.log("\n'" + test.key + "' FAIL...");
      console.log('Status: ' + response.statusCode);
      console.log('Headers: ' + JSON.stringify(response.headers));
      console.log('Error: ' + err);
      console.log('Data: ' + data.substring(0,200) + '...');
      console.log("\n\n");
      return;
    }
    console.log("'" + test.key + "' Passes Expected Regex Match");
  }


  var all = [];
  tests.forEach(function (test, i) {
    // As simple as it gets
    test.options = test.options || {};
    test.options.href = test.href;
    test.options.query = test.query;
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
