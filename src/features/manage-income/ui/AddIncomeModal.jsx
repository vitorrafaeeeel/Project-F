import { X, ArrowUpCircle, Plus } from 'lucide-react';

export function AddIncomeModal({ onClose, newExtraIncome, setNewExtraIncome, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 rounded-full p-1 cursor-pointer"><X size={20} /></button>
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><ArrowUpCircle className="text-green-500" /> Adicionar Receita</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required placeholder="Ex: Freelance, Vendas..." autoFocus value={newExtraIncome.desc} onChange={(e) => setNewExtraIncome({...newExtraIncome, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-950 dark:text-white p-3 border bg-white"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label><input type="number" step="0.01" required min="0.01" placeholder="0.00" value={newExtraIncome.amount} onChange={(e) => setNewExtraIncome({...newExtraIncome, amount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-950 dark:text-white p-3 border bg-white"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={newExtraIncome.date} onChange={(e) => setNewExtraIncome({...newExtraIncome, date: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-zinc-950 dark:text-white p-3 border bg-white"/></div>
          </div>
          <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 cursor-pointer"><Plus size={18} /> Adicionar à Conta</button>
        </form>
      </div>
    </div>
  );
}
