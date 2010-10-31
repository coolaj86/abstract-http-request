AbstractHttpRequest
====

Abstract HTTP Request is a lightweight HTTP Client with **very reasonable default settings** that works both in **Browers** and **SSJS**.

In provides a thin abstraction layer over the underlaying http client (XMLHttpRequest or Http.Client.Request.Response)

Currently the following are supported:

  * Browsers (jQuery / XHR backend) - jQuery dependency to be removed soon
    * JSONP by script tag injection
    * XHR Level 1 requests
    * Lightweight standalone Abstraction of XHR
    * If jQuery is detected, uses jQuery instead

  * Node.js (Http.Client, auto-redirects on 3xx responses)
    * **API-compatible with [`node-request`](http://github.com/mikeal/node-utils/tree/master/request/)**
      * Passes `node-request` tests. Any break from `node-request`'s documented API should be filed as bug
    * JSONP via http Client
    * Automatically redirects on 3xx requests (excluding 304)
    * Automatically handles base64 encoding of HTTP Basic Authentication

Goals
----

  * XHR2 / CORS support, (with option plugin for post form / iframe tricks)
  * Echo server to test browser requests against
  * Abstract response object
  * methodOverride

Installation & Basic Usage
====

Browser:

    <script src="ahr.all.js"></script>
    // Has a super-simple `require` wrapper for convenience
    // ahr is not put into the global namespace by default
    var request = require('ahr');

Node.JS:

    npm install ahr
    var request = require('ahr');

Usage:
----

Futures-style multi-callbacks

    request(options)
      .when(function (err, Xhr_Or_NodeResponse, data) {
        if (err) {
          // handle error
        }
        // handle data
      })
      .when(nextCallback)
      .when(nextNextCallback);

Node-style callback

    // request(options, callback);
    request(options, function (err, Xhr_Or_NodeResponse) {
      if (err) {
        // handle error
      }
      // handle data
    });

jQuery-like shorthand (both styles of callbacks supported)

GET
    // request.get(resource, params, options)
    request.get("/resource", {foo: "bar", baz: "gizmo"}, {timeout: 10000})
      .when(function (err, Xhr_Or_NodeResponse, data) {
        console.log(err);
        console.log(data);
      });

POST
    // request.post(resource, params, body, options)
    request.post("/resource", {}, body, options)

JSONP
    // request.jsonp(resource, jsonp, params, options)
    request.jsonp("/resource", "jsonpcallback", {foo: "bar", baz: "gizmo"}, {timeout: 10000})
      .when(function (err, Xhr_Or_NodeResponse, data) {
        console.log(err);
        console.log(data);
      });

Joining Requests

    // request.join(req1, req2, req3, ...);
    request.join(
      request("/local-contacts"),
      request.get("/local-contacts"),
      request.jsonp(FacebookContacts, "jsoncallback"),
      request.jsonp(TwitterContacts, "callback")
    ).when(function (fbcResp, tcResp) {
      var fbc, tc;
      fbc = { err: fbcResp[0], xhr: fbcResp[1], data: fbcResp[2] };
      tc = { err: tcResp[0], xhr: tcResp[1], data: tcResp[2] };
      if (fbc.err || tc.err) {
        console.log(fbc.err);
        console.log(tc.err);
      }
    });


API & Advanced Usage
====

`http`, `https`, `head`, `get`, `post`, `put`, `delete`, `options`, `jsonp`, `join`

Note: might change `delete` to `del` if `es3` keyword `delete` causes conflict. Not yet tested.

AHR.http(options, *[callback]*);
----

Pass in a bunch of options, get back a promise for `err`, `data`, and the `nativeHttpClient` (either `XHR` or `Node.HCRR`)

    AHR.http({
      "uri": "http://user:pass@host.com:8080/p/a/t/h?query=string#hash", // parsed by node.url or jQuery
    }).when(function (err, [XMLHttpRequest | node.Http.Client.Request.Response], data));

Default Options
----

Loosely modeled after [Node's Http.Client and URL API]("http://nodejs.org/api.html")

    var presets = {
      // Overrides Connection and Request params
      "uri": "",

      // Connection Params
      "protocol": "http" | "https",
      "ssl": false | true,
      "port": 80 | 443,

      // Request Params
      "method": "GET",
      "auth": undefined, // in the format "username:password"
      "headers": {
        "User-Agent": YOUR-BROWSER-UA | "Node.js (AbstractHttpRequest)",
        "Accept": "application/json; charset=utf-8, */*; q=0.5", // prefer json utf-8, accept anything
        "Content-Type": undefined,
        "Content-Length": this.encodedBody.length,
        "Transfer-Encoding": undefined
      },
      "body": undefined,
      "encodedBody": undefined,
      "attachments": undefined, // for multi-part forms; TODO

      // Timeout after 20 seconds
      "timeout": 20000,

      // get the xhr or http.request object immediately and do something with it 
      // before the response is received
      "syncback": function () {},

      // if jQuery is present
      "jQopts": {} // these options are passed to jQuery directly, overriding the defaults
    }

When options.body exists the default `Content-Type` will be `x-www-form-urlencoded`;


Note: In the browser jQuery is currently used. This dependency will go away shortly, I just wanted it up quickly

AHR. | head | get | delete | options | (uri, params, options)
----

    AHR.get("/resource", {foo: "bar", baz: "gizmo"}, {timeout: 10000})
      .when(function (err, Xhr_Or_NodeResponse, data) {
        console.log(err);
        console.log(data);
      });

AHR | post | put | (uri, params, body, options)
----

When `options.body` exists the default `Content-Type` will be `x-www-form-urlencoded`;

If you have some sort of special encoding, format `options.encodedBody` yourself and set options.headers['Content-Type'] yourself.


AHR.jsonp(uri, jsonp, params, options)
----

    var flickrApi = "http://api.flickr.com/services/feeds/photos_public.gne?format=json";
    AHR.jsonp(flickApi, "jsoncallback", {tags: "cat", tagmode: "any"})
      .when(function (err, Xhr_Or_NodeResponse, data) {
        // do stuff
      });

syncback
----

The purpose of the syncback is to be able to get at the nativeHttpClient as soon as possible.

    var nodeRequest;
    AHR.https({
      uri: "http://example.com/"
      syncback: function(nativeClient) {
        nodeRequest = nativeClient;
      }
    });
    // do stuff with nodeRquest

TODO
====

  * maybe ssl shortcuts? heads, gets, posts, puts, deletes, optionss, jsonps
  * CommonJS http client abstraction
