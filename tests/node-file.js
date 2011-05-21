(function () {
  var request = require('../lib/ahr'),
    tests;

  tests = [
    {
      key: "file_relative_path1",
      href: "16kb.dat",
      regex: /E\nF/
    },
    {
      key: "file_relative_path2",
      href: "./16kb.dat",
      regex: /E\nF/
    },
    {
      key: "file_relative_path3",
      href: "file:16kb.dat",
      regex: /E\nF/
    },
    {
      key: "file_absolute_path",
      href: "file:///tmp/16kb.dat",
      regex: /E\nF/
    },
  ];

  
  //.when(handleResponses));
  function handleResponses(err, response, data, i) {
    var test = tests[i];
    if (data instanceof Buffer) {
      data = data.toString();
    }
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
