import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Percent,
  X,
  Layers,
} from 'lucide-react';
import { formatIndianDate, formatIndianCurrency } from '../lib/utils';
import { CreateDebtPayload, DebtItem, UpdateDebtPayload } from '../types';

export const DebtsPage: React.FC = () => {
  const debts = useAppStore(state => state.debts);
  const settings = useAppStore(state => state.settings);
  const loadDebts = useAppStore(state => state.loadDebts);
  const createDebt = useAppStore(state => state.createDebt);
  const updateDebt = useAppStore(state => state.updateDebt);
  const deleteDebt = useAppStore(state => state.deleteDebt);

  const baseCurrency = settings?.base_currency || 'INR';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateDebtPayload>({
    name: '',
    principal: 0,
    current_balance: 0,
    interest_rate: 0,
    due_date: '',
    notes: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateDebtPayload>({
    name: '',
    principal: 0,
    current_balance: 0,
    interest_rate: 0,
    due_date: '',
    notes: '',
    is_active: 1,
  });

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const formatCurrency = (val: number) => {
    return formatIndianCurrency(val, baseCurrency);
  };

  const activeDebts = debts.filter((d) => d.is_active === 1);
  const totalOutstanding = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
  const totalPrincipal = activeDebts.reduce((sum, d) => sum + d.principal, 0);

  const openAddModal = () => {
    setFormData({
      name: '',
      principal: 0,
      current_balance: 0,
      interest_rate: 0,
      due_date: '',
      notes: '',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Debt name is required');
      return;
    }
    if (formData.principal < 0 || formData.current_balance < 0) {
      setFormError('Amounts cannot be negative');
      return;
    }

    try {
      await createDebt({
        ...formData,
        name: formData.name.trim(),
        due_date: formData.due_date?.trim() || null,
        notes: formData.notes?.trim() || null,
      });
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  const openEditModal = (debt: DebtItem) => {
    setEditingDebt(debt);
    setEditFormData({
      name: debt.name,
      principal: debt.principal,
      current_balance: debt.current_balance,
      interest_rate: debt.interest_rate,
      due_date: debt.due_date || '',
      notes: debt.notes || '',
      is_active: debt.is_active,
    });
    setFormError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDebt) return;
    setFormError(null);

    if (!editFormData.name.trim()) {
      setFormError('Debt name is required');
      return;
    }

    try {
      await updateDebt(editingDebt.id, {
        ...editFormData,
        name: editFormData.name.trim(),
        due_date: editFormData.due_date?.trim() || null,
        notes: editFormData.notes?.trim() || null,
      });
      setEditingDebt(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleDebtActive = async (debt: DebtItem) => {
    try {
      await updateDebt(debt.id, {
        name: debt.name,
        principal: debt.principal,
        current_balance: debt.current_balance,
        interest_rate: debt.interest_rate,
        due_date: debt.due_date,
        notes: debt.notes,
        is_active: debt.is_active === 1 ? 0 : 1,
      });
    } catch (err: unknown) {
      alert(`Failed to toggle debt status: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-rose-400" />
            Debts & Liabilities
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track loans and credit debts subtracted from your net worth calculation
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Debt
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-medium text-zinc-400">Total Outstanding Debt</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 block">
              {formatCurrency(totalOutstanding)}
            </span>
            <span className="text-[11px] text-zinc-500">Subtracted from Net Worth</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-medium text-zinc-400">Total Principal</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-200 block">
              {formatCurrency(totalPrincipal)}
            </span>
            <span className="text-[11px] text-zinc-500">Original borrowed total</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span className="text-xs font-medium text-zinc-400">Active Debts</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white block">
              {activeDebts.length}
            </span>
            <span className="text-[11px] text-zinc-500">
              {debts.length - activeDebts.length} paid off / closed
            </span>
          </div>
        </div>
      </div>

      {/* Debts Table */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Debt / Loan Name</th>
                <th className="py-3.5 px-4 text-right">Principal</th>
                <th className="py-3.5 px-4 text-right">Current Balance</th>
                <th className="py-3.5 px-4 text-right">Interest Rate</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {debts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <Layers className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                    No debts recorded. You're debt-free!
                  </td>
                </tr>
              ) : (
                debts.map((debt) => (
                  <tr
                    key={debt.id}
                    className={`hover:bg-zinc-800/40 transition-colors ${
                      debt.is_active === 0 ? 'opacity-50 bg-zinc-950/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block text-sm">{debt.name}</span>
                      {debt.notes && (
                        <span className="text-[11px] text-zinc-400">{debt.notes}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                      {formatCurrency(debt.principal)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                      {formatCurrency(debt.current_balance)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-zinc-300">
                      <span className="inline-flex items-center gap-0.5">
                        <Percent className="w-3 h-3 text-zinc-500" />
                        {debt.interest_rate}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {debt.due_date ? (
                        <span className="inline-flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {formatIndianDate(debt.due_date)}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleDebtActive(debt)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          debt.is_active === 1
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {debt.is_active === 1 ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                            Active
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Paid Off
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(debt)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(`Delete debt '${debt.name}'?`)) {
                              try {
                                await deleteDebt(debt.id);
                              } catch (err: unknown) {
                                alert(`Failed to delete debt: ${err instanceof Error ? err.message : String(err)}`);
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Debt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Add Debt or Loan
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="add-debt-form"
              onSubmit={handleCreate}
              className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar"
            >
              {/* Invisible submit button to allow Enter key submission from any input */}
              <button type="submit" className="hidden" aria-hidden="true" />

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Debt Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Loan, Friend Loan, Credit Card Debt"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white transition-all shadow-inner focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Principal Amount *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    placeholder="0.00"
                    value={formData.principal || ''}
                    onChange={(e) => {
                      const p = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        principal: p,
                        current_balance: formData.current_balance === 0 ? p : formData.current_balance,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none font-mono transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Current Balance *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    placeholder="0.00"
                    value={formData.current_balance || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none font-mono transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="0.0"
                    value={formData.interest_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interest_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none font-mono transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, due_date: e.target.value });
                      // Dismiss native calendar popup immediately after picking
                      (e.target as HTMLInputElement).blur();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none cursor-pointer font-mono transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Lender contact, EMI amount, loan term..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none resize-none transition-all shadow-inner"
                />
              </div>
            </form>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-end gap-3 shrink-0 bg-zinc-900/95">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-debt-form"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-purple-950/50 transition-colors"
              >
                Save Debt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Debt Modal */}
      {editingDebt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-400" />
                Edit Debt: {editingDebt.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDebt(null)}
                className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="edit-debt-form"
              onSubmit={handleUpdate}
              className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar"
            >
              {/* Invisible submit button to allow Enter key submission from any input */}
              <button type="submit" className="hidden" aria-hidden="true" />

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Debt Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white transition-all shadow-inner focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Principal Amount *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    value={editFormData.principal}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        principal: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none font-mono transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Current Balance *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    value={editFormData.current_balance}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        current_balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none font-mono transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={editFormData.interest_rate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        interest_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none font-mono transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.due_date || ''}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, due_date: e.target.value });
                      (e.target as HTMLInputElement).blur();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none cursor-pointer font-mono transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Status
                </label>
                <select
                  value={editFormData.is_active}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, is_active: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                >
                  <option value={1}>Active (Subtracts from Net Worth)</option>
                  <option value={0}>Paid Off / Closed (Excluded)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-white focus:outline-none resize-none transition-all shadow-inner"
                />
              </div>
            </form>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-end gap-3 shrink-0 bg-zinc-900/95">
              <button
                type="button"
                onClick={() => setEditingDebt(null)}
                className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-debt-form"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-purple-950/50 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
