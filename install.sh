#!/usr/bin/env bash
# ==============================================================================
# Lynvest One-Command Installer for Linux (x86_64)
# https://github.com/darshancosmic/lynvest
# ==============================================================================
set -e

APP_NAME="lynvest"
DISPLAY_NAME="Lynvest"
GITHUB_REPO="darshancosmic/lynvest"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
PIXMAP_DIR="$HOME/.local/share/pixmaps"

echo "=========================================================="
echo " Installing $DISPLAY_NAME — Personal Finance & Investments "
echo "=========================================================="

mkdir -p "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR" "$PIXMAP_DIR"

# Detect if running from local file or piped via curl
SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]:-}" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

TEMP_DIR=""
SOURCE_BIN=""
SOURCE_ICON=""
SOURCE_DESKTOP=""

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/src-tauri/target/release/lynvest" ]; then
    SOURCE_BIN="$SCRIPT_DIR/src-tauri/target/release/lynvest"
    SOURCE_ICON="$SCRIPT_DIR/src-tauri/icons/icon.png"
    SOURCE_DESKTOP="$SCRIPT_DIR/packaging/lynvest.desktop"
elif [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/lynvest" ]; then
    SOURCE_BIN="$SCRIPT_DIR/lynvest"
    SOURCE_ICON="$SCRIPT_DIR/lynvest.png"
    SOURCE_DESKTOP="$SCRIPT_DIR/lynvest.desktop"
elif [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/dist-packages/lynvest-0.1.0-linux-x86_64.tar.gz" ]; then
    TEMP_DIR=$(mktemp -d)
    tar -xzf "$SCRIPT_DIR/dist-packages/lynvest-0.1.0-linux-x86_64.tar.gz" -C "$TEMP_DIR"
    SOURCE_BIN="$TEMP_DIR/lynvest-0.1.0/lynvest"
    SOURCE_ICON="$TEMP_DIR/lynvest-0.1.0/lynvest.png"
    SOURCE_DESKTOP="$TEMP_DIR/lynvest-0.1.0/lynvest.desktop"
else
    echo "Downloading latest release package from GitHub..."
    TEMP_DIR=$(mktemp -d)
    TARBALL_URL="https://github.com/$GITHUB_REPO/releases/download/v0.1.0/lynvest-0.1.0-linux-x86_64.tar.gz"
    curl -fSL --progress-bar "$TARBALL_URL" -o "$TEMP_DIR/lynvest.tar.gz"
    tar -xzf "$TEMP_DIR/lynvest.tar.gz" -C "$TEMP_DIR"
    SOURCE_BIN="$TEMP_DIR/lynvest-0.1.0/lynvest"
    SOURCE_ICON="$TEMP_DIR/lynvest-0.1.0/lynvest.png"
    SOURCE_DESKTOP="$TEMP_DIR/lynvest-0.1.0/lynvest.desktop"
fi

echo "Installing binary to $BIN_DIR/lynvest..."
install -m 755 "$SOURCE_BIN" "$BIN_DIR/lynvest"

echo "Installing application icons..."
cp -f "$SOURCE_ICON" "$ICON_DIR/lynvest.png"
cp -f "$SOURCE_ICON" "$PIXMAP_DIR/lynvest.png"

for size in 16 24 32 48 64 96 128 256; do
    mkdir -p "$HOME/.local/share/icons/hicolor/${size}x${size}/apps"
    cp -f "$SOURCE_ICON" "$HOME/.local/share/icons/hicolor/${size}x${size}/apps/lynvest.png" 2>/dev/null || true
done

echo "Configuring desktop launcher..."
sed -e 's|^Exec=lynvest %U|Exec='"$BIN_DIR"'/lynvest %U|' \
    -e 's|^Icon=.*|Icon='"$ICON_DIR"'/lynvest.png|' \
    "$SOURCE_DESKTOP" > "$DESKTOP_DIR/lynvest.desktop"
chmod +x "$DESKTOP_DIR/lynvest.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
fi

touch "$DESKTOP_DIR/lynvest.desktop"

if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

echo ""
echo "=========================================================="
echo " [✓] $DISPLAY_NAME installed successfully with new logo!"
echo "=========================================================="
echo "• Launch '$DISPLAY_NAME' from your application menu or terminal."
echo ""
echo "Support the project on Ko-fi:"
echo "https://ko-fi.com/cosmicdarshan"
echo ""
