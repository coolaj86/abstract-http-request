#!/bin/bash

cat vendor/require-kiss/lib/require-kiss.js\
  vendor/global-es5.js \
  lib/process.js \
  vendor/events.js \
  vendor/querystring.js \
  vendor/url.js \
  vendor/futures/release/futures.all.js \
  lib/uri-encoder.js \
  lib/utils.js \
  lib/file-api-browser.js \
  lib/browser-jsonp.js \
  lib/browser-request.js \
  lib/ahr-options.js \
  lib/ahr2.js \
    > release/ahr2.all.js
