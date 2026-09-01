import { X } from 'lucide-react';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';

export function DepositModal({ depositModal, setDepositModal, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"><X size={18} /></button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Fazer Aporte</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor do Aporte</label>
            <CurrencyInput
              autoFocus
              required
              value={depositModal.amount}
              onChange={(val) => setDepositModal({ ...depositModal, amount: val })}
              focusRingColor="focus:border-green-500 focus:ring-green-500"
              className="p-3 text-lg rounded-lg"
            />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-md">Confirmar</button>
        </form>
      </div>
    </div>
  );
}
