[![build status](https://secure.travis-ci.org/coolaj86/abstract-http-request.png)](http://travis-ci.org/coolaj86/abstract-http-request)
AbstractHttpRequest
====

Installation
---

Abstract HTTP Request is an HTTP Client for both **Node.JS** as well as **Modern Browsers** which handles:

  * JSONP
  * Cross-Origin Resource Sharing (CORS)
    * Access-Control (AC) + XMLHttpRequest Level 2 (XHR2)
    * XDomainRequest (XDR)
  * Binary downloads (overrideMimeType hack)
  * HTML5 FileApi
    * Binary uploads
    * FormData
    * File
    * FileList
  * Automatically redirects on 3xx requests (excluding 304)
  * HTTP Basic Auth
  * Join multiple requests together (see the **shorthand** section below)

Supported Platforms:

  * Node.JS v0.4.2+
  * Chrome 9+
  * Firefox 4+
  * IE 9+
  * Android Browser 2.2 (which lacks FormData support)
  * iOS 5 Mobile Safari

Installation
====

**NodeJS**

    npm install ahr2

**Browser w/ Pakmanager**

    pakmanager build

Note: If you're supporting legacy browsers you'll need to include the `es5` and `JSON` modules in `package.json` (you may also need to create fake functions for FormData, File, and FileList)..

package.json:

    browserDependencies: {
        "es5"
      , "JSON"
    }

index.js:

    window.FormData = window.FormData || function () {};
    window.File = window.File || function () {};
    window.FileList = window.FileList || function () {};

**require**

index.html:

    <script src="pakmanager.min.js"></script>
    <script>
      var request = require('ahr2');
    </script>


example.js:

    var request = require('ahr2');

Basic Usage
====

    var request = require('ahr2') // Ender.JS providers `require` for browser
      ;

    // use HREF
    request({
        href: "/"
    }).when(function (err, ahr, data) {
      console.log(arguments);
    });

    // use other stuff
    request({
        method: 'GET'
      , hostname: "foobar3000.com"
      , port: 80
      , pathname: "/echo"
      , query: {
            foo: "bar"
          , baz: ["qux, quux"]
          , corge: ""
        }
    }).when(function (err, ahr, data) {
      console.log(arguments);
    });

GET, HEAD, OPTIONS, DELETE Shorthand
---

    // request.get(resource, query, [options]);
    request.get("/resource", {foo: "bar", baz: "gizmo"}, {timeout: 10000});
    request.head("/resource", {foo: "bar", baz: "gizmo"}, {timeout: 10000});
    request.options("/resource", {foo: "bar", baz: "gizmo"}, {timeout: 10000});
    request.delete("/resource", {foo: "bar", baz: "gizmo"}, {timeout: 10000});

POST, PUT Shorthand
---

    // request.post(resource, query, body, options);
    request.post("/resource", {}, body, [options]);
    request.put("/resource", {}, body, [options]);

FileApi / File / FileList / FormData Upload
---

  see options.body section below

JSONP Shorthand
---

Note: Yes, This does work in Node.JS and the Browser.

    // request.jsonp(resource, jsonp, query, [options])
    var flickrApi = "http://api.flickr.com/services/feeds/photos_public.gne?format=json";
    request.jsonp(flickrApi, "jsoncallback", {tags: "cat", tagmode: "any"})
      .when(function (err, response, data) {
        console.log(data) // t3h kittehz!
      });


AHR2 uses *both* EventEmitter and FuturesJS in *both* the browser and Node.JS.

You may use whichever syntax you find most convenient or appropriate.

    var request = require('ahr2'); // Yes, you must use `require` even in the browser

Futures-style multi-callbacks

    var future = request(options);

    future.when(function (err, response, data) {
        if (err) {
          // handle error
        }
        // handle data
      })
      .when(nextCallback)
      .when(nextNextCallback);

Node-style callback

    // request(options);
    var res = request(options)
      , req = res.upload
      ;

    req.on('progress', function (ev) {
      // update UI
    });

    res.on('loadend', function (ev) {
      if (ev.error) {
        // handle error
        throw ev.error;
      }
      // handle data
      console.log(ev.target.result);
    });

Events
====

Both `requests` and `responses` have all of the following events.

The order of events has been normalized such that they are predictable and consistent.

`request` events will always be fired and will always reach `loadend` before `response` events begin with `loadstart`

Proper Events:

  * `loadstart` - fired when the request is made
  * `progress` - fired occasionally
  * `load` - fires on success
  * `loadend` - fires on completion (including after `load`, `error`, `timeout`, or `abort`)

Error Events
  * `abort` - user abort completed
  * `timeout` - user or default timeout completed
  * `error` - network or other error (not including >= 400 status codes)

The final `loadend` is followed by the completion of all `when` promises

Options
====


Note: anywhere that `options` used you may use the `href` string instead

options
----

Loosely modeled after the [Node.JS Http.Client and URL API]("http://nodejs.org/api.html")

    var presets = {
          // Overrides Connection and Request query
          "href": ""

          // Connection Params
        , "protocol": "http" | "https"
        , "ssl": false | true
        , "port": 80 | 443
        , "query": { "search": "keys" }

          // Request Params
        , "method": "GET"
        , "auth": undefined        // in the format "username:password"
        , "headers": {}            // see section below
        , "body": undefined        // see section below
        , "encodedBody": undefined // if you encode the body yourself 

          // Response Params
        , "responseEncoder": function (responseText) { return Custom.parse(responseText) } // a function to parse / encode data

          // Timeout after 20 seconds
        , "timeout": 20000
    }

options.headers
----

    var presets = {
      "headers": {
          "User-Agent": YOUR-BROWSER-UA | "Node.js (AbstractHttpRequest v2.0)"
        , "Accept": "application/json; charset=utf-8, */*; q=0.5" // prefer json utf-8, accept anything
        , "Content-Type": undefined
        , "Content-Length": this.encodedBody.length
        , "Transfer-Encoding": undefined
      },
    };

options.body and options.encodedBody
----

`options.body` is expected to be a JavaScript or FormData Object.


**JavaScript Object**:

    "body": {
        "name": "Alfred"
      , "address": "Canada"
      , "fav_color": "green"
    }

  * `Content-Type` will be `x-www-form-urlencoded`
  * encoded result will be `name=Alfred&address=Canada&fav_color=green`

**File, FileList**:

    "body": {
        "name": "Alfred"
      , "profile_pic": [object File]
      , "comment": "Me at the beach"
      , "album_pics": [object FileList]
    }

  * `Content-Type` will be `multipart/form-data`
  * encoded result will default to `Content-Length`-based (not `chunked`)

**FormData Object**:

    "body": [object FormData]

  * `Content-Type` will be `multipart/form-data`
  * encoded result will default to `Content-Length`-based (not `chunked`)

If you have some sort of special encoding, format `options.encodedBody` yourself and set options.headers['Content-Type'] yourself.

Joining Requests
===

    // npm install join
    // or ender build join

    var Join = require('join')
      , join = Join()
      ;

    // join(req1, req2, req3, ...);
    join(
      request({ "href": "/foo" }),
      request.get("/bar"),
    ).when(function (fooArgs, barArgs) {
      var fArgs, bArgs;
      fArgs = { err: fooArgs[0], response: fooArgs[1], data: fooArgs[2] };
      bArgs = { err: barArgs[0], response: barArgs[1], data: barArgs[2] };
      if (fArgs.err || bArgs.err) {
        console.log(fArgs.err);
        console.log(bArgs.err);
      }
    });

