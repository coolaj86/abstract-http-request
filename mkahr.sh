#!/bin/bash

cat lib/process.js \
  lib/uri-encoder.js \
  lib/utils.js \
  lib/file-api-browser.js \
  lib/browser-jsonp.js \
  lib/browser-request.js \
  lib/ahr-options.js \
  lib/ahr2.js \
    > release/ahr2.js
