#!/bin/bash

# Extract version from package.json
VERSION=$(node -pe "require('./package.json').version")
NODE_ENV=production

if [ -z ${ALBY_OAUTH_CLIENT_ID_CHROME+x} ];
then
    echo "OAuth client id for Chrome:"
    read ALBY_OAUTH_CLIENT_ID_CHROME
fi

if [ -z ${ALBY_OAUTH_CLIENT_SECRET_CHROME+x} ];
then
    echo "OAuth client secret for Chrome:"
    read ALBY_OAUTH_CLIENT_SECRET_CHROME
fi

if [ -z ${ALBY_OAUTH_CLIENT_ID_FIREFOX+x} ];
then
    echo "OAuth client id for Firefox:"
    read ALBY_OAUTH_CLIENT_ID_FIREFOX
fi

if [ -z ${ALBY_OAUTH_CLIENT_SECRET_FIREFOX+x} ];
then
    echo "OAuth client secret for Firefox:"
    read ALBY_OAUTH_CLIENT_SECRET_FIREFOX
fi

if [ -z ${ALBY_API_URL+x} ];
then
    ALBY_API_URL="https://api.getalby.com"
fi

echo "Creating the build for v$VERSION"
yarn build

echo "Creating zip packages for v$VERSION"
cd dist/production

cd firefox
# Normalize timestamp to get reproducible zip file
find . -exec touch -t 200810310000 {} +

# Create zip file
zip -rX ../alby-firefox-v$VERSION.xpi *

SHA=$(sha512sum -b ../alby-firefox-v$VERSION.xpi)
echo "Created alby-firefox-v$VERSION.xpi (SHA512: $SHA)"

cd ../chrome
# Normalize timestamp to get reproducible zip file
find . -exec touch -t 200810310000 {} +

# Create zip file
zip -rX ../alby-chrome-v$VERSION.zip *

SHA=$(sha512sum -b ../alby-chrome-v$VERSION.zip)
echo "Created alby-chrome-v$VERSION.zip (SHA512: $SHA)"

cd ../opera
# Normalize timestamp to get reproducible zip file
find . -exec touch -t 200810310000 {} +

# Create zip file
zip -rX ../alby-opera-v$VERSION.crx *

SHA=$(sha512sum -b ../alby-opera-v$VERSION.crx)
echo "Created alby-opera-v$VERSION.crx (SHA512: $SHA)"

echo "done!"

cd ../../../
