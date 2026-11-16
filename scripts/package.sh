#!/usr/bin/env bash
# Builds the static site into one zip for cPanel (no PHP backend, no admin).
# Registrations and sponsor enquiries are sent by email (EmailJS).
# Extract the zip inside public_html.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

rm -f cup-tasters-deploy.zip
(cd dist && zip -qr ../cup-tasters-deploy.zip . -x '.DS_Store' '*.zip')
echo "✓ cup-tasters-deploy.zip ready ($(du -h cup-tasters-deploy.zip | cut -f1))"
