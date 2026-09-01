import { X, Target, Trash2, Plus } from 'lucide-react';
import { categoryConfig } from '../../../entities/expense/model/categories.js';

export function CategoryBudgetsModal({ onClose, rows, addRow, updateRow, removeRow, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 rounded-full p-1 cursor-pointer"><X size={20} /></button>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2"><Target className="text-pink-500" /> Orçamento por Categoria</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Defina um limite por categoria (ex: R$ 100 para Lazer, R$ 100 para Saúde).</p>

        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-gray-50 dark:bg-zinc-950/60 p-2 rounded-lg border border-gray-200 dark:border-zinc-800">
              <select value={row.category} onChange={(e) => updateRow(idx, 'category', e.target.value)} className="flex-1 rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-950 dark:text-white p-2 border bg-white text-sm">
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <input type="number" step="0.01" min="0.01" placeholder="0.00" value={row.amount} onChange={(e) => updateRow(idx, 'amount', e.target.value)} className="w-28 rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-950 dark:text-white p-2 border bg-white text-sm"/>
              <button type="button" onClick={() => removeRow(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className="w-full mt-3 border border-dashed border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 text-sm font-medium py-2 rounded-md hover:border-pink-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Plus size={16} /> Adicionar categoria
        </button>

        <button onClick={onSave} className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-md transition-colors cursor-pointer">Guardar Orçamentos</button>
      </div>
    </div>
  );
}
