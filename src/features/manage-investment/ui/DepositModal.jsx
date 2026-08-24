import { X, Coins } from 'lucide-react';

export function DepositModal({ depositModal, setDepositModal, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Coins className="text-green-500" /> Fazer Aporte</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor do Aporte (R$)</label><input type="number" step="0.01" required min="0.01" value={depositModal.amount} onChange={(e) => setDepositModal({...depositModal, amount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white p-3 border text-lg bg-white dark:bg-gray-700" autoFocus/></div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">Confirmar</button>
        </form>
      </div>
    </div>
  );
}
