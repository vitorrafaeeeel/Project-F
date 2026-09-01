import { X, Edit } from 'lucide-react';

export function EditInvestmentModal({ editInvModal, setEditInvModal, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 rounded-full p-1 cursor-pointer"><X size={20} /></button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Edit className="text-blue-500" /> Editar Investimento</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome / Objetivo</label><input type="text" required value={editInvModal.desc} onChange={(e) => setEditInvModal({...editInvModal, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-950 dark:text-white p-3 border bg-white"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Meta (R$/mês)</label><input type="number" step="0.01" required min="0" value={editInvModal.monthlyAmount} onChange={(e) => setEditInvModal({...editInvModal, monthlyAmount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-950 dark:text-white p-3 border bg-white"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rendimento (%/mês)</label><input type="number" step="0.01" value={editInvModal.interestRate} onChange={(e) => setEditInvModal({...editInvModal, interestRate: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-950 dark:text-white p-3 border bg-white"/></div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer">Guardar Alterações</button>
        </form>
      </div>
    </div>
  );
}
