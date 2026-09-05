#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/../.." && pwd)"
BUILD_DIR="$DIR/build_dir"
REPO_DIR="$DIR/repo_dir"
BUNDLE_OUT="$ROOT_DIR/dist-packages/lynvest-0.1.0.flatpak"

echo "==> Preparing local Flatpak build..."
rm -rf "$BUILD_DIR" "$REPO_DIR"

# Initialize flatpak build directory
flatpak build-init "$BUILD_DIR" com.lynvest.desktop org.freedesktop.Platform org.freedesktop.Platform 25.08

install -Dm755 "$ROOT_DIR/src-tauri/target/release/lynvest" "$BUILD_DIR/files/bin/lynvest"
install -Dm644 "$DIR/com.lynvest.desktop.desktop" "$BUILD_DIR/files/share/applications/com.lynvest.desktop.desktop"
install -Dm644 "$DIR/com.lynvest.desktop.metainfo.xml" "$BUILD_DIR/files/share/metainfo/com.lynvest.desktop.metainfo.xml"
install -Dm644 "$DIR/lynvest.png" "$BUILD_DIR/files/share/icons/hicolor/512x512/apps/com.lynvest.desktop.png"
install -Dm644 "$DIR/lynvest.svg" "$BUILD_DIR/files/share/icons/hicolor/scalable/apps/com.lynvest.desktop.svg"

echo "==> Finalizing Flatpak build permissions..."
flatpak build-finish \
  --command=lynvest \
  --share=ipc \
  --socket=fallback-x11 \
  --socket=wayland \
  --device=dri \
  --filesystem=xdg-data/com.lynvest.desktop:create \
  "$BUILD_DIR"

echo "==> Initializing OSTree Flatpak repo..."
ostree init --mode=archive-z2 --repo="$REPO_DIR"
flatpak build-export "$REPO_DIR" "$BUILD_DIR"

echo "==> Creating single-file Flatpak bundle: $BUNDLE_OUT..."
flatpak build-bundle "$REPO_DIR" "$BUNDLE_OUT" com.lynvest.desktop

echo "==> Flatpak bundle created successfully!"
ls -lh "$BUNDLE_OUT"

rm -rf "$BUILD_DIR" "$REPO_DIR"
