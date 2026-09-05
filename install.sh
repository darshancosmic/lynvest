#!/usr/bin/env bash
# ==============================================================================
# Lynvest One-Command Installer for Linux (x86_64)
# https://github.com/darshancosmic/lynvest
# ==============================================================================
set -euo pipefail

APP_NAME="lynvest"
DISPLAY_NAME="Lynvest"
GITHUB_REPO="darshancosmic/lynvest"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"

echo "=========================================================="
echo " Installing $DISPLAY_NAME — Personal Finance & Investments "
echo "=========================================================="

mkdir -p "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR"

# Check if we are running from inside the cloned repo or dist-packages
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_BIN=""
SOURCE_ICON=""
SOURCE_DESKTOP=""

if [ -f "$SCRIPT_DIR/src-tauri/target/release/lynvest" ]; then
    SOURCE_BIN="$SCRIPT_DIR/src-tauri/target/release/lynvest"
    SOURCE_ICON="$SCRIPT_DIR/src-tauri/icons/icon.png"
    SOURCE_DESKTOP="$SCRIPT_DIR/packaging/lynvest.desktop"
elif [ -f "$SCRIPT_DIR/lynvest" ]; then
    SOURCE_BIN="$SCRIPT_DIR/lynvest"
    SOURCE_ICON="$SCRIPT_DIR/lynvest.png"
    SOURCE_DESKTOP="$SCRIPT_DIR/lynvest.desktop"
elif [ -f "$SCRIPT_DIR/dist-packages/lynvest-0.1.0-linux-x86_64.tar.gz" ]; then
    TEMP_DIR=$(mktemp -d)
    tar -xzf "$SCRIPT_DIR/dist-packages/lynvest-0.1.0-linux-x86_64.tar.gz" -C "$TEMP_DIR"
    SOURCE_BIN="$TEMP_DIR/lynvest-0.1.0/lynvest"
    SOURCE_ICON="$TEMP_DIR/lynvest-0.1.0/lynvest.png"
    SOURCE_DESKTOP="$TEMP_DIR/lynvest-0.1.0/lynvest.desktop"
else
    # Fallback to downloading latest release from GitHub
    echo "Fetching latest release binary from GitHub..."
    TEMP_DIR=$(mktemp -d)
    TARBALL_URL="https://github.com/$GITHUB_REPO/releases/latest/download/lynvest-0.1.0-linux-x86_64.tar.gz"
    curl -fsSL "$TARBALL_URL" -o "$TEMP_DIR/lynvest.tar.gz"
    tar -xzf "$TEMP_DIR/lynvest.tar.gz" -C "$TEMP_DIR"
    SOURCE_BIN="$TEMP_DIR/lynvest-0.1.0/lynvest"
    SOURCE_ICON="$TEMP_DIR/lynvest-0.1.0/lynvest.png"
    SOURCE_DESKTOP="$TEMP_DIR/lynvest-0.1.0/lynvest.desktop"
fi

echo "Copying executable to $BIN_DIR/lynvest..."
cp "$SOURCE_BIN" "$BIN_DIR/lynvest"
chmod +x "$BIN_DIR/lynvest"

echo "Copying icon to $ICON_DIR/lynvest.png..."
cp "$SOURCE_ICON" "$ICON_DIR/lynvest.png"

echo "Configuring desktop launcher in $DESKTOP_DIR/lynvest.desktop..."
sed 's|^Exec=lynvest %U|Exec='"$BIN_DIR"'/lynvest %U|' "$SOURCE_DESKTOP" > "$DESKTOP_DIR/lynvest.desktop"
chmod +x "$DESKTOP_DIR/lynvest.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -q "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
fi

echo ""
echo "=========================================================="
echo " [✓] $DISPLAY_NAME installed successfully!"
echo "=========================================================="
echo "• Run '$APP_NAME' from terminal (ensure ~/.local/bin is in your PATH)"
echo "• Or launch '$DISPLAY_NAME' directly from your application menu / rofi / wofi."
echo ""
echo "Enjoying Lynvest? Consider supporting the project on Ko-fi:"
echo "https://ko-fi.com/cosmicdarshan"
echo ""
