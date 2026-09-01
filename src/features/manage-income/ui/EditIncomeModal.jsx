import { X } from 'lucide-react';
import { CustomDatePicker } from '../../../shared/ui/CustomDatePicker.jsx';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';

export function EditIncomeModal({ editIncomeModal, setEditIncomeModal, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"><X size={18} /></button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Editar Receita</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required autoFocus value={editIncomeModal.data.desc} onChange={(e) => setEditIncomeModal({...editIncomeModal, data: {...editIncomeModal.data, desc: e.target.value}})} className="w-full rounded-lg border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white p-3 border bg-white text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
              <CurrencyInput
                required
                value={editIncomeModal.data.amount}
                onChange={(val) => setEditIncomeModal({ ...editIncomeModal, data: { ...editIncomeModal.data, amount: val } })}
                focusRingColor="focus:border-blue-500 focus:ring-blue-500"
                className="p-3 text-sm rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
              <CustomDatePicker
                value={editIncomeModal.data.date}
                onChange={(val) => setEditIncomeModal({ ...editIncomeModal, data: { ...editIncomeModal.data, date: val } })}
              />
            </div>
          </div>
          <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-md">Guardar Alterações</button>
        </form>
      </div>
    </div>
  );
}
