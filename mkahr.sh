#!/bin/bash

cat vendor/require-kiss.js\
  vendor/global-es5.js \
  vendor/url.js \
  vendor/futures/lib/private.js \
  vendor/futures/lib/promise.js \
  lib/ahr.js \
    > lib/ahr.all.js
#cat vendor/require-kiss.js vendor/global-es5.js vendor/futures.promise.js lib/ahr.js > lib/ahr.all.js
