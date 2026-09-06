#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$ROOT_DIR/src-tauri/target/release/lynvest"
DIST="$ROOT_DIR/dist-packages"
PKG_DIR="$ROOT_DIR/packaging"
VERSION="0.1.0"

if [ ! -f "$BIN" ]; then
    echo "Binary $BIN not found! Run npm run release first."
    exit 1
fi

mkdir -p "$DIST"

echo "==> Packaging Universal Portable Tarball with Installer..."
TAR_STAGING="$PKG_DIR/tarball_staging/lynvest-$VERSION"
rm -rf "$PKG_DIR/tarball_staging"
mkdir -p "$TAR_STAGING"

cp "$BIN" "$TAR_STAGING/lynvest"
chmod +x "$TAR_STAGING/lynvest"
cp "$PKG_DIR/lynvest.desktop" "$TAR_STAGING/"
cp "$ROOT_DIR/src-tauri/icons/icon.png" "$TAR_STAGING/lynvest.png"
cp "$ROOT_DIR/LICENSE" "$TAR_STAGING/"

cp "$ROOT_DIR/install.sh" "$TAR_STAGING/install.sh"
cp "$ROOT_DIR/uninstall.sh" "$TAR_STAGING/uninstall.sh"
chmod +x "$TAR_STAGING/install.sh" "$TAR_STAGING/uninstall.sh"

cat << 'README_EOF' > "$TAR_STAGING/README.txt"
Lynvest — Personal Finance & Investments (v0.1.0)
==================================================

Lynvest is a 100% offline, privacy-first personal finance tracker for Linux.

QUICK START:
  To run immediately without installing:
    ./lynvest

PERMANENT INSTALL (User-level, no sudo required):
    ./install.sh

UNINSTALL:
    ./uninstall.sh

Support & Sponsorship:
  Buy Me a Coffee: https://buymeacoffee.com/cosmicdarshan
  Ko-fi:           https://ko-fi.com/cosmicdarshan
README_EOF

tar -czf "$DIST/lynvest-${VERSION}-linux-x86_64.tar.gz" -C "$PKG_DIR/tarball_staging" "lynvest-$VERSION"
rm -rf "$PKG_DIR/tarball_staging"

cd "$DIST"
sha256sum "lynvest-${VERSION}-linux-x86_64.tar.gz" > SHA256SUMS
cat SHA256SUMS

echo "==> Distribution package ready!"
ls -lh "$DIST"
