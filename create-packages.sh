#!/bin/bash

# Extract version from package.json
VERSION=$(node -pe "require('./package.json').version")

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