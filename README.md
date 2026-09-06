# Lynvest

<div align="center">

**Fast, 100% Offline Personal Finance & Investment Tracker for Linux**

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Platform: Linux](https://img.shields.io/badge/Platform-Linux-orange.svg)]()
[![Built with: Tauri v2](https://img.shields.io/badge/Built%20with-Tauri%20v2-24C8D8.svg)](https://tauri.app/)
[![Rust: 1.84+](https://img.shields.io/badge/Rust-1.84%2B-DEA584.svg)](https://www.rust-lang.org/)
[![Ko-fi: Support](https://img.shields.io/badge/Ko--fi-Support%20Creator-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/cosmicdarshan)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donate-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/cosmicdarshan)

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

### One-Line Fast Install (Any Linux Distro)

Run this command in any Linux terminal (Ubuntu, Arch, Fedora, Debian, Mint, Pop!_OS, openSUSE, etc.):

```bash
curl -fsSL https://raw.githubusercontent.com/darshancosmic/lynvest/main/install.sh | bash
```

- **User-Level**: Installs to `~/.local/bin/lynvest` (no `sudo` or root password needed).
- **Desktop Integrated**: Adds high-res icon and application launcher shortcut to your app menu.
- **Zero Dependencies**: Fully compiled standalone binary with SQLite embedded.

### One-Line Clean Uninstall

To completely remove Lynvest at any time:

```bash
curl -fsSL https://raw.githubusercontent.com/darshancosmic/lynvest/main/uninstall.sh | bash
```

- Removes the binary, desktop entry, and icon assets.
- Asks whether you wish to keep or wipe your local database vault.

---

### Build From Source

```bash
git clone https://github.com/darshancosmic/lynvest.git
cd lynvest
npm install
npm run release
```

The compiled binary will be placed at `~/.local/bin/lynvest` and `src-tauri/target/release/lynvest`.

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
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donate-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/cosmicdarshan)

☕ **Ko-fi**: [https://ko-fi.com/cosmicdarshan](https://ko-fi.com/cosmicdarshan) &nbsp;•&nbsp; 💛 **Buy Me a Coffee**: [https://buymeacoffee.com/cosmicdarshan](https://buymeacoffee.com/cosmicdarshan)

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
npx tauri build --bundles deb

# 5. Build distribution packages (.deb, .pkg.tar.zst, .tar.gz)
./packaging/build_packages.sh
```

All generated distribution packages and checksums will be placed in `./dist-packages/`.

---

## License

Lynvest is licensed under a **Dual-Platform License**:
- **Linux Platform**: Exclusively and permanently **100% Free and Open-Source Software** under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE). No fees or subscriptions will ever be charged for Linux.
- **Microsoft Windows Platform**: Free for personal evaluation during the initial **30-day promotional launch period**. Continued usage thereafter requires a one-time commercial license purchase ($5.00 USD / ₹499 INR).

See the full [LICENSE](LICENSE) agreement for details.
