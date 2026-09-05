import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { RecurringRulesPage } from './pages/RecurringRulesPage';
import { GoalsPage } from './pages/GoalsPage';
import { BillsPage } from './pages/BillsPage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { WarrantiesPage } from './pages/WarrantiesPage';
import { CsvImportPage } from './pages/CsvImportPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { DebtsPage } from './pages/DebtsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionModal } from './components/TransactionModal';
import { RefreshCw, Coins } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const isLoading = useAppStore(state => state.isLoading);
  const activeTab = useAppStore(state => state.activeTab);
  const initApp = useAppStore(state => state.initApp);
  const loadTransactions = useAppStore(state => state.loadTransactions);
  const loadMonthSummary = useAppStore(state => state.loadMonthSummary);
  const loadAccounts = useAppStore(state => state.loadAccounts);
  const loadNetWorthSummary = useAppStore(state => state.loadNetWorthSummary);

  const [isQuickTxnOpen, setIsQuickTxnOpen] = React.useState(false);

  useEffect(() => {
    initApp();
  }, [initApp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N opens New Transaction
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsQuickTxnOpen(true);
      }
      // Escape closes quick transaction
      if (e.key === 'Escape' && isQuickTxnOpen) {
        setIsQuickTxnOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickTxnOpen]);

  const handleQuickTxnSaved = React.useCallback(async () => {
    await Promise.all([
      loadTransactions(),
      loadMonthSummary(),
      loadAccounts(false),
      loadNetWorthSummary(),
    ]);
  }, [loadTransactions, loadMonthSummary, loadAccounts, loadNetWorthSummary]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white select-none">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400 shadow-xl shadow-purple-950/40">
          <Coins className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Starting Lynvest...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex">
      <Sidebar onOpenQuickTransaction={() => setIsQuickTxnOpen(true)} />
      <main className="flex-1 h-full overflow-y-auto p-8 max-w-7xl">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'accounts' && <AccountsPage />}
        {activeTab === 'transactions' && <TransactionsPage />}
        {activeTab === 'categories' && <CategoriesPage />}
        {activeTab === 'recurring' && <RecurringRulesPage />}
        {activeTab === 'goals' && <GoalsPage />}
        {activeTab === 'bills' && <BillsPage />}
        {activeTab === 'shopping' && <ShoppingListPage />}
        {activeTab === 'warranties' && <WarrantiesPage />}
        {activeTab === 'csv_import' && <CsvImportPage />}
        {activeTab === 'investments' && <InvestmentsPage />}
        {activeTab === 'debts' && <DebtsPage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Global Quick Transaction Modal accessible via Ctrl+N or Sidebar button */}
      <TransactionModal
        isOpen={isQuickTxnOpen}
        onClose={() => setIsQuickTxnOpen(false)}
        onSaved={handleQuickTxnSaved}
      />
    </div>
  );
};

export default App;
