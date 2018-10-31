#!/bin/sh

if [ -z "$npm_package_name" ]; then
    echo "This script can not be used standalone because it depends on variables set by Yarn/NPM. Run it like this: \"yarn run package\" or \"npm run package\""
    exit 1
fi

mkdir -p dist
zip -r dist/$npm_package_name-$npm_package_version.zip package.json $npm_package_main node_modules
