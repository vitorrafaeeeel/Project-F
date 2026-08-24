import { X, Edit } from 'lucide-react';

export function EditIncomeModal({ editIncomeModal, setEditIncomeModal, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Edit className="text-blue-500" /> Editar Receita</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required autoFocus value={editIncomeModal.data.desc} onChange={(e) => setEditIncomeModal({...editIncomeModal, data: {...editIncomeModal.data, desc: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label><input type="number" inputMode="decimal" step="0.01" required min="0.01" value={editIncomeModal.data.amount} onChange={(e) => setEditIncomeModal({...editIncomeModal, data: {...editIncomeModal.data, amount: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={editIncomeModal.data.date} onChange={(e) => setEditIncomeModal({...editIncomeModal, data: {...editIncomeModal.data, date: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          </div>
          <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2">Guardar Alterações</button>
        </form>
      </div>
    </div>
  );
}
