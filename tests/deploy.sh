#!/bin/bash
set -u
set -e

rm -rf public
mkdir -p public

jade *.jade
mv *.html public

pakmanager build
rm -f pakmanaged.html
mv pakmanaged.* public
