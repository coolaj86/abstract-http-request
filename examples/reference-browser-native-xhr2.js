/*
  Experiences with Chrome 13
    * Both `loadstart` events fire at `send()`
    * Neither `loadend` events fire ever
    * response only progresses after request has loaded

  For a request without a body (neither FormData nor DOMString):
    * `request` events never fire
*/
(function () {
  "use strict";

  var xhr2 = new XMLHttpRequest()
    , xhr2Request = xhr2.upload;
    ;

  // Make Request
  xhr2.open('POST', "/doesnt-exist/doesnt-matter", true);

  // Response (old-fashioned handlers)
  xhr2.addEventListener('loadstart', function (ev) {
      console.log('res.loadstart', ev);
  });
  xhr2.addEventListener('progress', function (ev) {
      xhr2.getAllResponseHeaders();
      console.log('res.progress', ev);
  });
  xhr2.addEventListener('load', function (ev) {
      if ('binary' === options.overrideResponseType) {
        xhr2.
      }
      console.log('res.load', ev, ev.target);
  });
  xhr2.addEventListener('loadend', function (ev) {
      console.log('res.loadend', ev);
  });

  // Request (upload handlers)
  xhr2Request.addEventListener('loadstart', function (ev) {
      console.log('req.loadstart', ev);
  });
  xhr2Request.addEventListener('progress', function (ev) {
      console.log('req.progress', ev);
  });
  xhr2Request.addEventListener('load', function (ev) {
      console.log('req.load', ev, ev.target);
  });
  xhr2Request.addEventListener('loadend', function (ev) {
      console.log('req.loadend', ev);
  });

  //xhr2.send("blah=x&yab=y");
  xhr2.send(null);
}());
