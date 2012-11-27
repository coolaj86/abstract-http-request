Abstract HTTP Request
===

AHR is a middleware framework for http clients (Browser and NodeJS).

Think `connect`, but for clients.

API
===

  * AHR.create()
  * AHR#http()
    * request<Emitter>
    * response<Emitter>
  * AHR#use()
  * AHR#extend()

Example
===

```javascript
var ahr = require('ahr')
  , client
  , request
  ;

client = ahr.create()
  .extend(ahr.Http())
  .use(ahr.json())
  ;

req = client.get("http://foobar3000.com/echo/example.json");
req.on('complete', function (data) {
});

req.on('progress', function () {
  // whatever
});
req.on('data', function () {
  // whatever
});
req.on('end', function () {
  // whatever
});
req.on('response', function (res) {
  res.on('progress', function () {
    // whatever
  });
  res.on('data', function () {
    // whatever
  });
  res.on('end', function () {
    // whatever
  });
});
```
