#!/usr/bin/env bash
set -e

echo "Uninstalling Lynvest..."
rm -f "$HOME/.local/bin/lynvest"
rm -f "$HOME/.local/share/applications/lynvest.desktop"
rm -f "$HOME/.local/share/icons/hicolor/"*"/apps/lynvest."* 2>/dev/null || true
rm -f "$HOME/.local/share/pixmaps/lynvest.png" 2>/dev/null || true

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
fi

echo "Lynvest uninstalled successfully."
