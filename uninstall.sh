#!/usr/bin/env bash
set -e

echo "Uninstalling Lynvest..."
rm -f "$HOME/.local/bin/lynvest"
rm -f "$HOME/.local/share/applications/lynvest.desktop"
rm -f "$HOME/.local/share/icons/hicolor/512x512/apps/lynvest.png"

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
fi

echo "Lynvest uninstalled successfully."
