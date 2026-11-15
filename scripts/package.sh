#!/usr/bin/env bash
# Builds the site and bundles it with the PHP API into one zip for cPanel.
# Extract the zip inside public_html. Your local .env and uploaded photos are
# NOT included, so create .env on the server from .env.example.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

out=deploy
rm -rf "$out" cup-tasters-deploy.zip
mkdir -p "$out/storage/photos"
cp -r dist/. "$out/"
cp -r server/api "$out/api"
cp server/bootstrap.php server/setup.php server/schema.sql server/.env.example "$out/"
touch "$out/storage/photos/.gitkeep"

(cd "$out" && zip -qr ../cup-tasters-deploy.zip . -x '.DS_Store' '*.zip')
rm -rf "$out"
echo "✓ cup-tasters-deploy.zip ready ($(du -h cup-tasters-deploy.zip | cut -f1))"
