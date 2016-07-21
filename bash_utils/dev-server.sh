#!/usr/bin/env bash
node_modules/gulp/bin/gulp.js build

if [[ $(pidof -bash) ]]; then
    echo "skipping pidof install"
else
    cp bash_utils/pidof /usr/local/bin/pidof
    chmod 700 /bin/pidof
    chmod +x /bin/pidof
    echo "pidof installed to /usr/local/bin"
fi
if [[ $(pidof node) ]]; then
    echo "skipping node server start, node is already running"
else
    node server & node_modules/gulp/bin/gulp.js watch
fi