AbstractHttpRequest
====

Abstract HTTP Request is an HTTP Client with **very reasonable default settings** that works both in **Browers** and **SSJS**.

Currently the following are supported:

  * Browsers (jQuery / XHR backend) - jQuery dependency to be removed soon
  * Node.js (native HTTPClient)

Installation
====

Browser:

    <script src="ahr.all.js"></script>
    // Has a super-simple `require` wrapper for convenience
    // ahr is not put into the global namespace by default
    var ahr = require('ahr');

Node.JS:

    npm install ahr
    var ahr = require('ahr');

API & Usage
====

`http`, `https`, `head`, `get`, `post`, `put`, `delete`, `options`, `jsonp`

Note: might change `delete` to `del` if `es3` keyword `delete` causes conflict. Not yet tested.

AHR.http(options);
----

Pass in a bunch of options, get back a promise for `err`, `data`, and the `nativeHttpClient` (either `XHR` or `Node.HCRR`)

    AHR.http({
      "url": "http://user:pass@host.com:8080/p/a/t/h?query=string#hash", // parsed by node.url or jQuery
    }).when(function (err, data, [XMLHttpRequest | node.Http.Client.Request.Response]));

Default Options
----

Loosely modeled after [Node's Http.Client and URL API]("http://nodejs.org/api.html")

    var presets = {
      // Overrides Connection and Request params
      "url": "",

      // Connection Params
      "protocol": "http" | "https",
      "ssl": false | true,
      "port": 80 | 443,

      // Request Params
      "method": "GET",
      "auth": undefined, // user:pass - TODO
      "headers": {
        "User-Agent": YOUR-BROWSER-UA | "node.js",
        "Accept": "*/*",
        "Content-Type": undefined,
        "Content-Length": undefined,
        "Transfer-Encoding": undefined
      },
      "body": undefined,
      "encodedBody": undefined,
      "attachments": undefined, // for multi-part forms; TODO

      // Timeout after 20 seconds
      "timeout": 20000, // TODO

      // get the xhr or http.request object immediately and do something with it 
      // before the response is received
      "syncback": undefined
    }

When options.body exists the default `Content-Type` will be `x-www-form-urlencoded`;


Note: In the browser jQuery is currently used. This dependency will go away shortly, I just wanted it up quickly

AHR.head|get|delete|options(url, params, options)
----

    AHR.get("/resource", {foo: "bar", baz: "gizmo"}, {timeout: 10000})
      .when(function (err, data, [XHR | node.HCRR) {
        console.log(err);
        console.log(data);
      });

AHR.post|put(url, params, body, options)
----

When `options.body` exists the default `Content-Type` will be `x-www-form-urlencoded`;

If you have some sort of special encoding


AHR.jsonp(url, jsonp, params, options)
----

    var flickrApi = "http://api.flickr.com/services/feeds/photos_public.gne?format=json";
    AHR.jsonp(flickApi, "jsoncallback", {tags: "cat", tagmode: "any"})
      .when(function (err, data, xhr) {
        // do stuff
      });

syncback
----

The purpose of the syncback is to be able to get at the nativeHttpClient as soon as possible.

    var nodeRequest;
    AHR.https({
      url: "http://example.com/"
      syncback: function(nativeClient) {
        nodeRequest = nativeClient;
      }
    });
    // do stuff with nodeRquest

TODO
====

  * maybe ssl shortcuts? heads, gets, posts, puts, deletes, optionss, jsonps
  * CommonJS http client abstraction
