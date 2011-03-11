#!/bin/bash

mkdir -p release

cat vendor/require-kiss/lib/require-kiss.js \
  vendor/global-es5.js \
  vendor/url.js \
  vendor/futures/futures/future.js \
  lib/ahr.js \
    > release/ahr.all.js
