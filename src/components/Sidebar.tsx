import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { NotificationBell } from './NotificationBell';
import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  TrendingUp,
  ReceiptText,
  BarChart3,
  Settings,
  Coins,
  FolderTree,
  Repeat,
  ShoppingCart,
  ShieldCheck,
  FileSpreadsheet,
  CreditCard,
  Plus,
  Target,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  onOpenQuickTransaction?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'accounts', label: 'Accounts', icon: WalletCards },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'goals', label: 'Financial Goals', icon: Target },
  { id: 'bills', label: 'Bills', icon: ReceiptText },
  { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
  { id: 'warranties', label: 'Warranties', icon: ShieldCheck },
  { id: 'csv_import', label: 'CSV Import', icon: FileSpreadsheet },
  { id: 'recurring', label: 'Recurring Rules', icon: Repeat },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'debts', label: 'Debts & Loans', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickTransaction }) => {
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const billReminders = useAppStore(state => state.billReminders);
  const settings = useAppStore(state => state.settings);
  const theme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between select-none h-full shrink-0 z-30 shadow-xl">
      {/* Brand Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm shadow-purple-950/50">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight leading-tight">
              Lynvest
            </h1>
            <p className="text-[10px] text-purple-400 font-medium tracking-wide flex items-center gap-1">
              <span>{settings?.base_currency || 'USD'} Mode</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </p>
          </div>
        </div>
        <NotificationBell />
      </div>

      {/* Quick Action Button */}
      <div className="p-3 pb-1 shrink-0">
        <button
          type="button"
          onClick={onOpenQuickTransaction}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/60 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
          <kbd className="ml-auto text-[10px] bg-purple-700/60 px-1.5 py-0.5 rounded text-purple-200 font-mono">
            Ctrl+N
          </kbd>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-950/40 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.id === 'bills' && billReminders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/25 text-purple-300 border border-purple-500/40">
                  {billReminders.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle & Footer */}
      <div className="p-3 border-t border-zinc-800/80 shrink-0 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700/80 active:scale-[0.98]"
          title={theme === 'light' ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Apple Light)'}
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-zinc-950 font-black">Day Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-zinc-200 font-bold">Night Mode</span>
            </>
          )}
        </button>

        <span className="font-mono text-xs text-purple-400 bg-purple-950/50 px-2.5 py-2 rounded-xl border border-purple-800/50 font-black shrink-0">
          {settings?.base_currency || 'USD'}
        </span>
      </div>
    </aside>
  );
};
