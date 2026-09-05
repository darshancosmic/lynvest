#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$ROOT_DIR/src-tauri/target/release/lynvest"
DIST="$ROOT_DIR/dist-packages"
PKG_DIR="$ROOT_DIR/packaging"
VERSION="0.1.0"

if [ ! -f "$BIN" ]; then
    echo "Binary $BIN not found! Run cargo build --release first."
    exit 1
fi

mkdir -p "$DIST"

echo "==> Packaging 1: Universal Portable Tarball with Installer..."
TAR_STAGING="$PKG_DIR/tarball_staging/lynvest-$VERSION"
rm -rf "$TAR_STAGING"
mkdir -p "$TAR_STAGING"

cp "$BIN" "$TAR_STAGING/lynvest"
chmod +x "$TAR_STAGING/lynvest"
cp "$PKG_DIR/lynvest.desktop" "$TAR_STAGING/"
cp "$ROOT_DIR/src-tauri/icons/icon.png" "$TAR_STAGING/lynvest.png"
cp "$ROOT_DIR/LICENSE" "$TAR_STAGING/"

# Write install.sh
cat << 'INSTALL_EOF' > "$TAR_STAGING/install.sh"
#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"

echo "Installing Lynvest to $HOME/.local..."
mkdir -p "$BIN_DIR" "$APP_DIR" "$ICON_DIR"

cp "$DIR/lynvest" "$BIN_DIR/lynvest"
chmod +x "$BIN_DIR/lynvest"
cp "$DIR/lynvest.png" "$ICON_DIR/lynvest.png"

# Install desktop file with absolute or PATH exec
sed 's|^Exec=lynvest %U|Exec='"$BIN_DIR"'/lynvest %U|' "$DIR/lynvest.desktop" > "$APP_DIR/lynvest.desktop"
chmod +x "$APP_DIR/lynvest.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$APP_DIR" 2>/dev/null || true
fi

echo ""
echo "Lynvest installed successfully!"
echo "You can now run 'lynvest' from terminal (make sure ~/.local/bin is in your PATH)"
echo "or find 'Lynvest' in your application launcher menu."
INSTALL_EOF
chmod +x "$TAR_STAGING/install.sh"

# Write uninstall.sh
cat << 'UNINSTALL_EOF' > "$TAR_STAGING/uninstall.sh"
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
UNINSTALL_EOF
chmod +x "$TAR_STAGING/uninstall.sh"

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
  Ko-fi: https://ko-fi.com/cosmicdarshan
README_EOF

tar -czf "$DIST/lynvest-${VERSION}-linux-x86_64.tar.gz" -C "$PKG_DIR/tarball_staging" "lynvest-$VERSION"
echo "Created: $DIST/lynvest-${VERSION}-linux-x86_64.tar.gz"

echo "==> Packaging 2: Debian Package (.deb)..."
DEB_STAGING="$PKG_DIR/deb_staging"
rm -rf "$DEB_STAGING"
mkdir -p "$DEB_STAGING/DEBIAN"
mkdir -p "$DEB_STAGING/usr/bin"
mkdir -p "$DEB_STAGING/usr/share/applications"
mkdir -p "$DEB_STAGING/usr/share/icons/hicolor/512x512/apps"
mkdir -p "$DEB_STAGING/usr/share/icons/hicolor/128x128/apps"
mkdir -p "$DEB_STAGING/usr/share/icons/hicolor/32x32/apps"
mkdir -p "$DEB_STAGING/usr/share/doc/lynvest"

cp "$BIN" "$DEB_STAGING/usr/bin/lynvest"
chmod 755 "$DEB_STAGING/usr/bin/lynvest"

cp "$PKG_DIR/lynvest.desktop" "$DEB_STAGING/usr/share/applications/"
chmod 644 "$DEB_STAGING/usr/share/applications/lynvest.desktop"

cp "$ROOT_DIR/src-tauri/icons/icon.png" "$DEB_STAGING/usr/share/icons/hicolor/512x512/apps/lynvest.png"
cp "$ROOT_DIR/src-tauri/icons/128x128.png" "$DEB_STAGING/usr/share/icons/hicolor/128x128/apps/lynvest.png"
cp "$ROOT_DIR/src-tauri/icons/32x32.png" "$DEB_STAGING/usr/share/icons/hicolor/32x32/apps/lynvest.png"
cp "$ROOT_DIR/LICENSE" "$DEB_STAGING/usr/share/doc/lynvest/copyright"

BIN_SIZE_KB=$(du -sk "$DEB_STAGING" | cut -f1)

cat << DEB_CTRL > "$DEB_STAGING/DEBIAN/control"
Package: lynvest
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: amd64
Installed-Size: ${BIN_SIZE_KB}
Maintainer: Darshan Cosmic <https://github.com/darshancosmic>
Homepage: https://github.com/darshancosmic/lynvest
Depends: libc6 (>= 2.31), libgtk-3-0, libwebkit2gtk-4.1-0 | libwebkit2gtk-4.0-37
Description: Fast, 100% offline personal finance & investment tracker
 Lynvest is a native Linux desktop application for personal money management,
 tracking bank accounts, cash wallets, budgets, bills, and investment portfolios
 (stocks, crypto, mutual funds) with zero telemetry and full privacy.
DEB_CTRL

cat << 'DEB_POSTINST' > "$DEB_STAGING/DEBIAN/postinst"
#!/bin/sh
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database -q /usr/share/applications || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi
exit 0
DEB_POSTINST
chmod 755 "$DEB_STAGING/DEBIAN/postinst"

cat << 'DEB_POSTRM' > "$DEB_STAGING/DEBIAN/postrm"
#!/bin/sh
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database -q /usr/share/applications || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi
exit 0
DEB_POSTRM
chmod 755 "$DEB_STAGING/DEBIAN/postrm"

# Build deb using standard ar + tar
DEB_BUILD="$PKG_DIR/deb_build"
rm -rf "$DEB_BUILD"
mkdir -p "$DEB_BUILD"

echo "2.0" > "$DEB_BUILD/debian-binary"
tar --owner=0 --group=0 -czf "$DEB_BUILD/control.tar.gz" -C "$DEB_STAGING/DEBIAN" .
tar --owner=0 --group=0 -czf "$DEB_BUILD/data.tar.gz" --exclude='./DEBIAN' -C "$DEB_STAGING" .

ar rcs "$DIST/lynvest_${VERSION}_amd64.deb" "$DEB_BUILD/debian-binary" "$DEB_BUILD/control.tar.gz" "$DEB_BUILD/data.tar.gz"
echo "Created: $DIST/lynvest_${VERSION}_amd64.deb"

echo "==> Packaging 3: Arch Linux Package (.pkg.tar.zst)..."
ARCH_STAGING="$PKG_DIR/arch_staging"
rm -rf "$ARCH_STAGING"
mkdir -p "$ARCH_STAGING/usr/bin"
mkdir -p "$ARCH_STAGING/usr/share/applications"
mkdir -p "$ARCH_STAGING/usr/share/icons/hicolor/512x512/apps"
mkdir -p "$ARCH_STAGING/usr/share/licenses/lynvest"

cp "$BIN" "$ARCH_STAGING/usr/bin/lynvest"
chmod 755 "$ARCH_STAGING/usr/bin/lynvest"
cp "$PKG_DIR/lynvest.desktop" "$ARCH_STAGING/usr/share/applications/"
cp "$ROOT_DIR/src-tauri/icons/icon.png" "$ARCH_STAGING/usr/share/icons/hicolor/512x512/apps/lynvest.png"
cp "$ROOT_DIR/LICENSE" "$ARCH_STAGING/usr/share/licenses/lynvest/LICENSE"

TOTAL_SIZE_BYTES=$(du -sb "$ARCH_STAGING" | cut -f1)
BUILD_DATE=$(date +%s)

cat << ARCH_INFO > "$ARCH_STAGING/.PKGINFO"
pkgname = lynvest
pkgbase = lynvest
pkgver = ${VERSION}-1
pkgdesc = Fast, offline personal finance and investment manager
url = https://github.com/darshancosmic/lynvest
builddate = ${BUILD_DATE}
packager = Darshan Cosmic <https://github.com/darshancosmic>
size = ${TOTAL_SIZE_BYTES}
arch = x86_64
license = GPL-3.0-or-later
depend = gtk3
depend = webkit2gtk-4.1
ARCH_INFO

tar --owner=0 --group=0 -cf - -C "$ARCH_STAGING" . | zstd -T0 -19 - > "$DIST/lynvest-${VERSION}-1-x86_64.pkg.tar.zst"
echo "Created: $DIST/lynvest-${VERSION}-1-x86_64.pkg.tar.zst"

# Generate PKGBUILD for Arch / AUR users
cat << PKGBUILD_EOF > "$PKG_DIR/PKGBUILD"
# Maintainer: Darshan Cosmic <https://github.com/darshancosmic>
pkgname=lynvest
pkgver=0.1.0
pkgrel=1
pkgdesc="Fast, 100% offline personal finance & investment manager"
arch=('x86_64')
url="https://github.com/darshancosmic/lynvest"
license=('GPL-3.0-or-later')
depends=('gtk3' 'webkit2gtk-4.1')
makedepends=('cargo' 'npm' 'nodejs')
source=("\$pkgname-\$pkgver.tar.gz::https://github.com/darshancosmic/lynvest/archive/v\$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
    cd "\$srcdir/\$pkgname-\$pkgver"
    npm install
    npm run build
    cd src-tauri
    cargo build --release --locked
}

package() {
    cd "\$srcdir/\$pkgname-\$pkgver"
    install -Dm755 "src-tauri/target/release/lynvest" "\$pkgdir/usr/bin/lynvest"
    install -Dm644 "packaging/lynvest.desktop" "\$pkgdir/usr/share/applications/lynvest.desktop"
    install -Dm644 "src-tauri/icons/icon.png" "\$pkgdir/usr/share/icons/hicolor/512x512/apps/lynvest.png"
    install -Dm644 "LICENSE" "\$pkgdir/usr/share/licenses/\$pkgname/LICENSE"
}
PKGBUILD_EOF

# Generate Fedora/RHEL lynvest.spec
cat << SPEC_EOF > "$PKG_DIR/lynvest.spec"
Name:           lynvest
Version:        0.1.0
Release:        1%{?dist}
Summary:        Fast, 100%% offline personal finance & investment manager
License:        GPLv3+
URL:            https://github.com/darshancosmic/lynvest
Source0:        lynvest-%{version}.tar.gz

BuildRequires:  rust
BuildRequires:  cargo
BuildRequires:  nodejs
BuildRequires:  npm
BuildRequires:  gtk3-devel
BuildRequires:  webkit2gtk4.1-devel
BuildRequires:  openssl-devel
BuildRequires:  desktop-file-utils

Requires:       gtk3
Requires:       webkit2gtk4.1

%description
Lynvest is a native Linux desktop personal money management application.
Tracks bank accounts, cash wallets, budgets, bills, and investment portfolios
(stocks, crypto, mutual funds) completely offline with zero telemetry.

%prep
%autosetup

%build
npm install
npm run build
cd src-tauri
cargo build --release

%install
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_datadir}/applications
mkdir -p %{buildroot}%{_datadir}/icons/hicolor/512x512/apps

install -m 755 src-tauri/target/release/lynvest %{buildroot}%{_bindir}/lynvest
install -m 644 packaging/lynvest.desktop %{buildroot}%{_datadir}/applications/lynvest.desktop
install -m 644 src-tauri/icons/icon.png %{buildroot}%{_datadir}/icons/hicolor/512x512/apps/lynvest.png

%check
desktop-file-validate %{buildroot}%{_datadir}/applications/lynvest.desktop

%files
%license LICENSE
%{_bindir}/lynvest
%{_datadir}/applications/lynvest.desktop
%{_datadir}/icons/hicolor/512x512/apps/lynvest.png

%changelog
* Sat Sep 05 2026 Darshan Cosmic <https://github.com/darshancosmic> - 0.1.0-1
- Initial release of Lynvest
SPEC_EOF

# Generate SHA256 checksums file
cd "$DIST"
find . -maxdepth 1 -type f ! -name SHA256SUMS -exec sha256sum {} + > SHA256SUMS
cat SHA256SUMS

echo "==> All packages built successfully!"
ls -lh "$DIST"
