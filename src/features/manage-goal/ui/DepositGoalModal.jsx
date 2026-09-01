import { useState } from 'react';
import { X, Coins, Plus } from 'lucide-react';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';
import { formatCurrency, parseCurrencyInput } from '../../../shared/lib/currency.js';

export function DepositGoalModal({ isOpen, goal, onClose, onDeposit }) {
  const [amount, setAmount] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseCurrencyInput(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    onDeposit(goal.id, parsed);
    setAmount('');
    onClose();
  };

  const remaining = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
            <Coins size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Aportar no Objetivo
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
              {goal.title || goal.name}
            </p>
          </div>
        </div>

        <div className="my-4 p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-100 dark:border-zinc-800/60 text-xs space-y-1">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Já Acumulado:</span>
            <strong className="text-gray-900 dark:text-white">{formatCurrency(goal.currentAmount || 0)}</strong>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Valor Alvo:</span>
            <strong className="text-blue-600 dark:text-blue-400">{formatCurrency(goal.targetAmount || 0)}</strong>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-zinc-800">
            <span>Falta Atingir:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Valor do Aporte
            </label>
            <CurrencyInput
              autoFocus
              required
              placeholder="0,00"
              value={amount}
              onChange={(val) => setAmount(val)}
              focusRingColor="focus:border-emerald-500 focus:ring-emerald-500"
              className="py-3 text-base font-semibold text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus size={18} />
            <span>Confirmar Aporte</span>
          </button>
        </form>
      </div>
    </div>
  );
}
