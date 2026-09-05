# Lynvest

<div align="center">

**Fast, 100% Offline Personal Finance & Investment Tracker for Linux**

[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Platform: Linux](https://img.shields.io/badge/Platform-Linux%20x86__64-orange.svg)]()
[![Built with: Tauri v2](https://img.shields.io/badge/Built%20with-Tauri%20v2-24C8D8.svg)](https://tauri.app/)
[![Rust: 1.84+](https://img.shields.io/badge/Rust-1.84%2B-DEA584.svg)](https://www.rust-lang.org/)
[![Ko-fi: Support](https://img.shields.io/badge/Ko--fi-Support%20Creator-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/cosmicdarshan)

*Modeled on the productivity of top personal finance suites, built completely local, private, and bloat-free.*

</div>

---

## Highlights

- **100% Offline & Private**: Zero telemetry, zero cloud synchronizations, and zero bank logins. Your financial data stays exclusively on your machine in a local SQLite database with WAL durability.
- **Double-Entry Style Ledger Math**: Account balances are never directly overwritten. Every balance is mathematically derived from atomic ledger rows (`account_ledger`), guaranteeing auditability and consistency.
- **International Number & Currency Support**:
  - Toggle between **International Millions** (`$1,234,567.89`) and **Indian Lakhs/Crores** (`₹12,34,567.89`).
  - Customizable Base Currency (`USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`, `JPY`, `CHF`, etc.) with offline exchange rates.
  - Flexible date formats (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`).
- **Investment Portfolio Tracker**: Track stocks, cryptocurrencies, mutual funds, and custom assets. Manage cost basis, manual price updates with historical pricing records, and real-time unrealized P&L.
- **Live Budget Pace Projections**: Know whether you will overshoot your budget *before* the month ends with automatic velocity pace warnings.
- **Consolidated Net Worth Engine**: Automated daily snapshots plotting your combined net worth (Bank + Cash + Investments - Debts) over time.
- **PIN Lock Protection**: 6-digit PIN protection hashed securely with bcrypt.
- **Automated Daily Backups**: Automated snapshot rotation keeping the newest 10 backups, plus one-click export to external USB storage.

---

## Installation

### 1. One-Line Fast Install (Any Linux distro)

Run in your terminal (installs to `~/.local/bin` and adds application shortcut — no root password needed):

```bash
curl -fsSL https://raw.githubusercontent.com/darshancosmic/lynvest/main/install.sh | bash
```

To uninstall at any time:
```bash
curl -fsSL https://raw.githubusercontent.com/darshancosmic/lynvest/main/uninstall.sh | bash
```

---

### 2. Distro-Specific Packages

Download the pre-built packages from the [Releases](https://github.com/darshancosmic/lynvest/releases) page or build locally:

#### Debian, Ubuntu, Linux Mint, Pop!_OS (`.deb`)
```bash
sudo apt install ./lynvest_0.1.0_amd64.deb
```

#### Arch Linux, Manjaro, EndeavourOS (`.pkg.tar.zst`)
```bash
sudo pacman -U lynvest-0.1.0-1-x86_64.pkg.tar.zst
```
*(Or compile from source using `packaging/PKGBUILD` with `makepkg -si`)*

#### Universal Portable Archive (`.tar.gz`)
Works on Fedora, openSUSE, Debian, Arch, Void, Alpine, or any Linux distribution:
```bash
tar -xzf lynvest-0.1.0-linux-x86_64.tar.gz
cd lynvest-0.1.0
./install.sh
```
Or run directly without installing:
```bash
./lynvest
```

#### Fedora / RHEL (`.spec`)
For Fedora/RHEL users who prefer building their own native RPM:
```bash
rpmbuild -ba packaging/lynvest.spec
```

---

## Key Features Breakdown

### 1. Account & Multi-Currency Engine
- Multiple account types: Bank accounts, physical cash wallets, investment accounts, credit cards, and loans.
- Multi-currency conversions: Every transaction retains its native account currency and records a converted base currency amount (`base_amount`) calculated using your configured offline exchange rates.

### 2. Transaction Management & Ledger
- Supports Income, Expense, and atomic Transfers (`transfer_out` on source, `transfer_in` on target).
- Transaction verification flag (Confirmed vs Pending).
- One-click **Clone** button on past transactions to duplicate entries with today's date.
- Category hierarchy with custom icons and color pickers.
- Multi-tag tagging system.

### 3. Recurring Payments & Smart Catch-Up
- Daily, weekly, monthly, and yearly recurring transaction engine.
- **Smart catch-up**: If Lynvest is not opened for weeks or months, it automatically computes and posts all missed recurring cycles sequentially without skipping or corrupting ledger state.

### 4. Budgets & Pace Warnings
- Period options: Weekly, Monthly, or Custom Date Ranges.
- Visual progress meters, category filters, and rollover support.
- Mathematical pace projection: `(spent / days_elapsed) * total_days` alerts you early if spending velocity exceeds budget limits.

### 5. Upcoming Bills & Reminders
- Bill tracking with due-date countdowns and overdue badges.
- One-click "Mark as Paid" that records a verified, ledger-backed transaction in your selected account.

### 6. Shopping List & Warranty Vault
- Interactive quick-check shopping checklist with instant toggle and clear.
- Warranty organizer: Records purchase date, warranty duration, auto-calculates expiration, and alerts when warranties expire in less than 30 days.

### 7. Bank Statement CSV Importer
- Import bank transactions from any CSV statement offline.
- Automatic column matching, multi-format date parser (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`), duplicate detection, and import summary reports.

### 8. Investment Portfolio
- Track holdings across Stocks, Cryptos, Mutual Funds, and ETFs.
- Manual price updates (single asset or bulk price matrix) with historical price tracking over time.
- Calculates cost basis, current market value, unrealized P&L, and percentage returns.

### 9. Deep Financial Analytics & CSV Export
- **Spending by Category**: Donut chart + Ranked horizontal bar chart + detailed breakdown.
- **Income vs Expense Trend**: Grouped bar charts showing net savings rate.
- **Net Worth Trend**: Historical growth trajectory.
- **Investment Performance**: Individual holding returns and asset allocation.
- **CSV Export**: Clean spreadsheet export buttons on every report.

### 10. Security & Durability
- 6-digit security PIN hashed with bcrypt.
- Automated daily backup snapshots rotated to keep the last 10 versions.
- Off-machine USB export to back up your database to physical drives.

---

## Support & Sponsorship

If Lynvest helps you take control of your financial privacy and simplifies your personal accounting, please consider buying a coffee to support continued development and maintenance:

<div align="center">

[![Support on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20on%20Ko--fi-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/cosmicdarshan)

**[https://ko-fi.com/cosmicdarshan](https://ko-fi.com/cosmicdarshan)**

</div>

---

## Building from Source

### Prerequisites
- Node.js 18+ and npm
- Rust 1.77+ and Cargo
- Linux development libraries:
  - **Arch Linux**: `sudo pacman -S webkit2gtk-4.1 gtk3 base-devel openssl`
  - **Debian / Ubuntu**: `sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev build-essential libssl-dev`
  - **Fedora**: `sudo dnf install webkit2gtk4.1-devel gtk3-devel openssl-devel @development-tools`

### Build Steps
```bash
# 1. Clone repository
git clone https://github.com/darshancosmic/lynvest.git
cd lynvest

# 2. Install frontend dependencies
npm install

# 3. Run development build
npm run tauri dev

# 4. Build optimized release binary
npm run build
cd src-tauri && cargo build --release && cd ..

# 5. Build distribution packages (.deb, .pkg.tar.zst, .tar.gz)
./packaging/build_packages.sh
```

All generated distribution packages and checksums will be placed in `./dist-packages/`.

---

## License

This project is licensed under the **GNU General Public License v3.0** (`GPL-3.0-or-later`).
See the [LICENSE](LICENSE) file for complete terms and permissions.
