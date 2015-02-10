#!/usr/bin/env bash
node_modules/.bin/compile-modules convert -I lib -f bundle -o dist/morph-range.js morph-range.umd.js
node_modules/.bin/compile-modules convert -I lib -f bundle -o dist/morph-list.js morph-list.umd.js
find test -type f -iname *-test.js | xargs node_modules/.bin/compile-modules convert -I shim -I test -f bundle -o dist/test.js
