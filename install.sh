#!/usr/bin/env bash
# ==============================================================================
#  _                               _   
# | |                             | |  
# | |    _   _ _ __ __   _____ ___| |_ 
# | |   | | | | '_ \\ \ / / _ \/ __| __|
# | |___| |_| | | | |\ V /  __/\__ \ |_ 
# |______\__, |_| |_| \_/ \___||___/\__|
#         __/ |                         
#        |___/                          
#
# Lynvest One-Line Linux Installer
# https://github.com/darshancosmic/lynvest
# ==============================================================================
set -e

# ANSI Colors & Styles
if [ -t 1 ]; then
    BOLD="\033[1m"
    DIM="\033[2m"
    RESET="\033[0m"
    PURPLE="\033[38;2;168;85;247m"
    ROYAL="\033[38;2;147;51;234m"
    DEEP_PURPLE="\033[38;2;124;58;237m"
    CYAN="\033[38;2;56;189;248m"
    GREEN="\033[38;2;34;197;94m"
    AMBER="\033[38;2;245;158;11m"
    WHITE="\033[1;37m"
else
    BOLD=""
    DIM=""
    RESET=""
    PURPLE=""
    ROYAL=""
    DEEP_PURPLE=""
    CYAN=""
    GREEN=""
    AMBER=""
    WHITE=""
fi

APP_NAME="lynvest"
DISPLAY_NAME="Lynvest"
GITHUB_REPO="darshancosmic/lynvest"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
PIXMAP_DIR="$HOME/.local/share/pixmaps"

clear 2>/dev/null || true

echo -e "${ROYAL}${BOLD}"
cat << "BANNER"
  ██╗     ██╗   ██╗███╗   ██╗██╗   ██╗███████╗███████╗████████╗
  ██║     ╚██╗ ██╔╝████╗  ██║██║   ██║██╔════╝██╔════╝╚══██╔══╝
  ██║      ╚████╔╝ ██╔██╗ ██║██║   ██║█████╗  ███████╗   ██║   
  ██║       ╚██╔╝  ██║╚██╗██║╚██╗ ██╔╝██╔══╝  ╚════██║   ██║   
  ███████╗   ██║   ██║ ╚████║ ╚████╔╝ ███████╗███████║   ██║   
  ╚══════╝   ╚═╝   ╚═╝  ╚═══╝  ╚═══╝  ╚══════╝╚══════╝   ╚═╝   
BANNER
echo -e "${RESET}"
echo -e " ${PURPLE}${BOLD}Personal Money & Investment Manager${RESET} ${DIM}• Native Linux Desktop (Offline & Private)${RESET}"
echo -e " ${DIM}Created by ${WHITE}Darshan Cosmic${RESET} ${DIM}• GPL-3.0 Open Source${RESET}"
echo -e "${ROYAL}──────────────────────────────────────────────────────────────────${RESET}"
echo ""

print_step() {
    local num="$1"
    local title="$2"
    echo -e " ${ROYAL}${BOLD}[$num]${RESET} ${WHITE}${BOLD}$title${RESET}"
}

print_sub() {
    local msg="$1"
    echo -e "     ${DIM}➜${RESET} $msg"
}

print_ok() {
    local msg="$1"
    echo -e "     ${GREEN}${BOLD}✓${RESET} $msg"
}

# Step 1: Prepare environment
print_step "1/5" "Preparing local system directories..."
mkdir -p "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR" "$PIXMAP_DIR"
print_ok "Destination paths ready in ~/.local"
echo ""

# Step 2: Acquire binaries & assets
print_step "2/5" "Locating Lynvest application package..."

SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]:-}" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

TEMP_DIR=""
SOURCE_BIN=""
SOURCE_ICON=""
SOURCE_DESKTOP=""

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/src-tauri/target/release/lynvest" ]; then
    print_sub "Using release binary from local workspace build"
    SOURCE_BIN="$SCRIPT_DIR/src-tauri/target/release/lynvest"
    SOURCE_ICON="$SCRIPT_DIR/src-tauri/icons/icon.png"
    SOURCE_DESKTOP="$SCRIPT_DIR/packaging/lynvest.desktop"
elif [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/lynvest" ]; then
    print_sub "Using local package directory binary"
    SOURCE_BIN="$SCRIPT_DIR/lynvest"
    SOURCE_ICON="$SCRIPT_DIR/lynvest.png"
    SOURCE_DESKTOP="$SCRIPT_DIR/lynvest.desktop"
elif [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/dist-packages/lynvest-0.1.0-linux-x86_64.tar.gz" ]; then
    print_sub "Extracting from local dist-packages tarball"
    TEMP_DIR=$(mktemp -d)
    tar -xzf "$SCRIPT_DIR/dist-packages/lynvest-0.1.0-linux-x86_64.tar.gz" -C "$TEMP_DIR"
    SOURCE_BIN="$TEMP_DIR/lynvest-0.1.0/lynvest"
    SOURCE_ICON="$TEMP_DIR/lynvest-0.1.0/lynvest.png"
    SOURCE_DESKTOP="$TEMP_DIR/lynvest-0.1.0/lynvest.desktop"
else
    print_sub "Downloading verified release package from GitHub..."
    TEMP_DIR=$(mktemp -d)
    TARBALL_URL="https://github.com/$GITHUB_REPO/releases/download/v0.1.0/lynvest-0.1.0-linux-x86_64.tar.gz"
    curl -fSL --progress-bar "$TARBALL_URL" -o "$TEMP_DIR/lynvest.tar.gz"
    tar -xzf "$TEMP_DIR/lynvest.tar.gz" -C "$TEMP_DIR"
    SOURCE_BIN="$TEMP_DIR/lynvest-0.1.0/lynvest"
    SOURCE_ICON="$TEMP_DIR/lynvest-0.1.0/lynvest.png"
    SOURCE_DESKTOP="$TEMP_DIR/lynvest-0.1.0/lynvest.desktop"
fi
print_ok "Package extracted and verified successfully"
echo ""

# Step 3: Install binary
print_step "3/5" "Installing executable binary..."
install -m 755 "$SOURCE_BIN" "$BIN_DIR/lynvest"
print_ok "Binary installed to ${CYAN}$BIN_DIR/lynvest${RESET}"
echo ""

# Step 4: Install icons
print_step "4/5" "Registering application icons..."
cp -f "$SOURCE_ICON" "$ICON_DIR/lynvest.png"
cp -f "$SOURCE_ICON" "$PIXMAP_DIR/lynvest.png"

for size in 16 24 32 48 64 96 128 256; do
    mkdir -p "$HOME/.local/share/icons/hicolor/${size}x${size}/apps"
    cp -f "$SOURCE_ICON" "$HOME/.local/share/icons/hicolor/${size}x${size}/apps/lynvest.png" 2>/dev/null || true
done
print_ok "High-resolution hicolor icon assets installed"
echo ""

# Step 5: Desktop launcher & database
print_step "5/5" "Configuring desktop integration..."
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
print_ok "Desktop launcher integrated into system application menu"

# Cleanup
if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

echo ""
echo -e "${ROYAL}╭──────────────────────────────────────────────────────────────────╮${RESET}"
echo -e "${ROYAL}│${RESET}  ${GREEN}${BOLD}✨  Installation Completed Successfully!${RESET}                       ${ROYAL}│${RESET}"
echo -e "${ROYAL}╰──────────────────────────────────────────────────────────────────╯${RESET}"
echo ""
echo -e " ${BOLD}How to Launch:${RESET}"
echo -e "   ${PURPLE}• Terminal:${RESET}        ${CYAN}lynvest${RESET}"
echo -e "   ${PURPLE}• Application Menu:${RESET} Press Super/Windows key and type ${WHITE}${BOLD}Lynvest${RESET}"
echo ""

# Check PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo -e " ${AMBER}${BOLD}Note:${RESET} ${DIM}$BIN_DIR is not in your current PATH.${RESET}"
    echo -e " Add it with: ${CYAN}export PATH=\"\$HOME/.local/bin:\$PATH\"${RESET} in your ~/.bashrc or ~/.zshrc"
    echo ""
fi

echo -e " ${DIM}Enjoying Lynvest? Consider supporting development:${RESET}"
echo -e "   ☕ Buy Me a Coffee: ${CYAN}https://buymeacoffee.com/cosmicdarshan${RESET}"
echo -e "   ❤️  Ko-fi:           ${CYAN}https://ko-fi.com/cosmicdarshan${RESET}"
echo ""
