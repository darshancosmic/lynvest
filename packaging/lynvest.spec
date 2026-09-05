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
