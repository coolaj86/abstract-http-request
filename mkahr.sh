#!/bin/bash

cat vendor/require-kiss/lib/require-kiss.js \
  vendor/global-es5.js \
  vendor/url.js \
  vendor/futures/lib/future.js \
  lib/ahr.js \
    > lib/ahr.all.js
