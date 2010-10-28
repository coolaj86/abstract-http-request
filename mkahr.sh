#!/bin/bash

cat vendor/require-kiss.js\
  vendor/global-es5.js \
  vendor/url.js \
  vendor/futures.private.js \
  vendor/futures.promise.js \
  lib/ahr.js \
    > lib/ahr.all.js
#cat vendor/require-kiss.js vendor/global-es5.js vendor/futures.promise.js lib/ahr.js > lib/ahr.all.js
