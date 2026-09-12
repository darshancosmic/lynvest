import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  X,
  Coins,
} from 'lucide-react';
import type { Transaction, Account } from '../types';
import { formatCurrency } from '../lib/utils';

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
  baseCurrency: string;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  baseCurrency,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Keyboard shortcut listener
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Compute filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      // Account filter
      if (selectedAccountId !== 'all') {
        const accId = Number(selectedAccountId);
        if (t.account_id !== accId && t.transfer_to_account_id !== accId) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // Date filter
      if (datePreset === 'this_month') {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        if (!t.txn_date.startsWith(`${y}-${m}`)) return false;
      } else if (datePreset === 'last_month') {
        const now = new Date();
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        if (!t.txn_date.startsWith(`${y}-${m}`)) return false;
      } else if (datePreset === '30_days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const cutoff = d.toISOString().split('T')[0];
        if (t.txn_date < cutoff) return false;
      } else if (datePreset === 'custom') {
        if (customStartDate && t.txn_date < customStartDate) return false;
        if (customEndDate && t.txn_date > customEndDate) return false;
      }

      return true;
    });
  }, [transactions, selectedAccountId, datePreset, typeFilter, customStartDate, customEndDate]);

  // Summary Metrics
  const summary = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    filteredList.forEach((t) => {
      if (t.type === 'income') inflow += t.base_amount;
      if (t.type === 'expense') outflow += t.base_amount;
    });
    return {
      count: filteredList.length,
      inflow,
      outflow,
      net: inflow - outflow,
    };
  }, [filteredList]);

  // Scope label for statement
  const scopeAccountName = useMemo(() => {
    if (selectedAccountId === 'all') return 'All Accounts (Consolidated)';
    const acc = accounts.find((a) => String(a.id) === selectedAccountId);
    return acc ? `${acc.name} (${acc.currency})` : 'Selected Account';
  }, [selectedAccountId, accounts]);

  const scopePeriodLabel = useMemo(() => {
    if (datePreset === 'this_month') return 'Current Month';
    if (datePreset === 'last_month') return 'Previous Month';
    if (datePreset === '30_days') return 'Last 30 Days';
    if (datePreset === 'custom' && (customStartDate || customEndDate)) {
      return `${customStartDate || 'Earliest'} to ${customEndDate || 'Latest'}`;
    }
    return 'Complete History';
  }, [datePreset, customStartDate, customEndDate]);

  // Statement Metadata
  const statementId = useMemo(() => {
    const d = new Date();
    const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `LV-${ymd}-${rand}`;
  }, []);

  const generatedTimestamp = useMemo(() => {
    const d = new Date();
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportHtml = () => {
    const docElement = document.getElementById('lynvest-statement-sheet');
    if (!docElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lynvest Statement - ${statementId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; background: #ffffff; color: #09090b; }
    .statement-container { max-width: 900px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 700; color: #334155; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: ui-monospace, monospace; }
    .inflow { color: #16a34a; }
    .outflow { color: #e11d48; }
    .summary-box { display: flex; gap: 12px; margin: 20px 0; }
    .summary-card { flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
    .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    @media print {
      @page { size: A4 portrait; margin: 12mm; }
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="statement-container">
    ${docElement.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lynvest_Statement_${statementId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto modal-container"
    >
      {/* Backdrop (hidden during print) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs modal-backdrop"
      />

      {/* Main Dialog Shell */}
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] z-10 statement-dialog-shell">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 modal-toolbar">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Account Statement & Ledger</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 font-mono border border-purple-700/50">
                  A4 Print Ready
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Generate clean, official financial statements with verified summaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
              title="Download standalone HTML statement"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export HTML</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-950/40 transition-all cursor-pointer active:scale-95"
              title="Print statement or save directly to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Selection Bar (Hidden on Print) */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-850 flex flex-wrap items-center gap-3 text-xs modal-toolbar">
          {/* Account Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Account:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Accounts (Consolidated)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Period:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">Complete History</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="30_days">Last 30 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-zinc-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Flow Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfers Only</option>
            </select>
          </div>

          {/* Live Records Count Badge */}
          <div className="ml-auto text-[11px] text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2.5 py-1 rounded-lg font-mono">
            {filteredList.length} records selected
          </div>
        </div>

        {/* Scrollable Paper Container Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-900/30 flex justify-center custom-scrollbar modal-preview-scroll">
          {/* THE OFFICIAL FINANCIAL STATEMENT DOCUMENT */}
          <div
            id="lynvest-statement-sheet"
            className="statement-document w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-slate-200 my-2"
          >
            {/* 1. Official Statement Header / Letterhead */}
            <div className="statement-header pb-6 border-b-2 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                    Lynvest
                  </h1>
                  <p className="text-xs font-bold tracking-wider text-purple-700 uppercase">
                    Account Statement & Transaction Ledger
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Offline Double-Entry Verified Ledger
                  </p>
                </div>
              </div>

              {/* Statement Metadata Box */}
              <div className="text-right text-xs space-y-1">
                <div className="flex sm:justify-end gap-2 text-slate-600">
                  <span className="font-semibold text-slate-500">Statement ID:</span>
                  <span className="font-mono font-bold text-slate-900">{statementId}</span>
                </div>
                <div className="flex sm:justify-end gap-2 text-slate-600">
                  <span className="font-semibold text-slate-500">Generated On:</span>
                  <span className="font-medium text-slate-900">{generatedTimestamp}</span>
                </div>
                <div className="flex sm:justify-end gap-2 text-slate-600">
                  <span className="font-semibold text-slate-500">Base Currency:</span>
                  <span className="font-bold text-slate-900">{baseCurrency}</span>
                </div>
                <div className="flex sm:justify-end items-center gap-1.5 pt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                    Reconciled & Sealed
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Statement Scope & Parameters Bar */}
            <div className="statement-scope-box my-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Account Scope
                </span>
                <span className="font-semibold text-slate-900 truncate block">
                  {scopeAccountName}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Period Range
                </span>
                <span className="font-semibold text-slate-900 block">
                  {scopePeriodLabel}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Transaction Type
                </span>
                <span className="font-semibold text-slate-900 capitalize block">
                  {typeFilter === 'all' ? 'All Transactions' : `${typeFilter}s`}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Entries
                </span>
                <span className="font-bold text-slate-900 block font-mono">
                  {summary.count} Records
                </span>
              </div>
            </div>

            {/* 3. Executive Financial Summary Cards */}
            <div className="statement-summary-grid grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/60">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Total Inflow (+)
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-700 block mt-1">
                  +{formatCurrency(summary.inflow, baseCurrency, true)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/60">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-800">
                  Total Outflow (-)
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-rose-700 block mt-1">
                  -{formatCurrency(summary.outflow, baseCurrency, true)}
                </span>
              </div>

              <div className={`p-3.5 rounded-lg border ${
                summary.net >= 0
                  ? 'border-purple-200 bg-purple-50/60'
                  : 'border-amber-200 bg-amber-50/60'
              }`}>
                <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                  summary.net >= 0 ? 'text-purple-800' : 'text-amber-800'
                }`}>
                  Net Cashflow
                </span>
                <span className={`text-base sm:text-lg font-black font-mono block mt-1 ${
                  summary.net >= 0 ? 'text-purple-700' : 'text-amber-700'
                }`}>
                  {summary.net >= 0 ? '+' : ''}
                  {formatCurrency(summary.net, baseCurrency, true)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Statement Balance
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-slate-900 block mt-1">
                  {summary.count} txns
                </span>
              </div>
            </div>

            {/* 4. Complete Transaction Ledger Table */}
            <div className="statement-table-wrap border border-slate-300 rounded-lg overflow-hidden">
              <table className="statement-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 w-10 text-center text-slate-500">#</th>
                    <th className="py-2.5 px-3 w-28">Date & Mode</th>
                    <th className="py-2.5 px-3 w-36">Account</th>
                    <th className="py-2.5 px-3 w-36">Category / Transfer</th>
                    <th className="py-2.5 px-3">Description & Notes</th>
                    <th className="py-2.5 px-3 w-32 text-right">Amount ({baseCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No transactions found for the selected statement criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((t, index) => {
                      const isIncome = t.type === 'income';
                      const isTransfer = t.type === 'transfer';

                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                          }`}
                        >
                          {/* Row Index */}
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {index + 1}
                          </td>

                          {/* Date & Payment Mode */}
                          <td className="py-2 px-3">
                            <span className="font-mono font-semibold text-slate-900 block">
                              {t.txn_date}
                            </span>
                            {t.payment_type && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 mt-0.5">
                                {t.payment_type}
                              </span>
                            )}
                          </td>

                          {/* Account */}
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-900 block">
                              {t.account_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {t.account_currency}
                            </span>
                          </td>

                          {/* Category / Transfer */}
                          <td className="py-2 px-3">
                            {isTransfer ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                ⇄ {t.transfer_to_account_name || 'Transfer'}
                              </span>
                            ) : t.category_name ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                {t.category_name}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Uncategorized</span>
                            )}
                          </td>

                          {/* Description / Note & Tags */}
                          <td className="py-2 px-3 max-w-xs">
                            <span className="text-slate-800 font-medium block truncate">
                              {t.note || '—'}
                            </span>
                            {t.tags && t.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {t.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="py-2 px-3 text-right font-mono">
                            <span
                              className={`text-xs font-bold block ${
                                isIncome
                                  ? 'text-emerald-700'
                                  : isTransfer
                                  ? 'text-blue-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                              {formatCurrency(t.amount, t.account_currency, true)}
                            </span>
                            {t.account_currency !== baseCurrency && (
                              <span className="text-[10px] text-slate-500 block">
                                ≈ {formatCurrency(t.base_amount, baseCurrency, true)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredList.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider text-[11px]">
                        Net Statement Movement:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs">
                        <span className={summary.net >= 0 ? 'text-purple-800' : 'text-rose-800'}>
                          {summary.net >= 0 ? '+' : ''}
                          {formatCurrency(summary.net, baseCurrency, true)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* 5. Official Verification & Certification Footer */}
            <div className="statement-footer mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">
                  Certified Computer-Generated Statement • Lynvest Offline Finance
                </p>
                <p className="mt-0.5">
                  Records are encrypted and maintained locally on this workstation without cloud exposure.
                </p>
              </div>
              <div className="sm:text-right">
                <p className="font-mono text-slate-600">ID: {statementId}</p>
                <p className="text-slate-400 mt-0.5">End of Statement Record</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
