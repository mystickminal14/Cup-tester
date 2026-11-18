#!/usr/bin/env bash
# Builds the static site into one zip for cPanel / WordPress hosting
# (no PHP backend, no admin). Registrations and sponsor enquiries are sent by
# email (EmailJS), photos go to Cloudinary.
#
#   scripts/package.sh              → site at the domain root; extract in public_html
#   scripts/package.sh /cuptester/  → site in a subfolder; extract in public_html/cuptester
set -euo pipefail
cd "$(dirname "$0")/.."

base="${1:-/}"
[[ "$base" == /* ]] || base="/$base"
[[ "$base" == */ ]] || base="$base/"

BASE_PATH="$base" npm run build

# Folder-aware .htaccess: unknown paths fall back to this site's index.html,
# never to WordPress or another site on the same domain.
cat > dist/.htaccess <<HT
# Cup Tasters Championship site, served from ${base}
Options -Indexes
DirectoryIndex index.html

RewriteEngine On
RewriteBase ${base}
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
HT

name="cup-tasters-deploy"
[[ "$base" == "/" ]] || name="cup-tasters-$(basename "$base")"
rm -f "$name.zip"
(cd dist && zip -qr "../$name.zip" . -x '.DS_Store' '*.zip')
echo "✓ $name.zip ready ($(du -h "$name.zip" | cut -f1)) for base path $base"
