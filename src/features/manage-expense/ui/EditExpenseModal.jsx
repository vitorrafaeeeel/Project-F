import { X, Trash2, ListPlus } from 'lucide-react';
import { CustomSelect } from '../../../shared/ui/CustomSelect.jsx';
import { CustomDatePicker } from '../../../shared/ui/CustomDatePicker.jsx';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';
import { formatCurrency, parseCurrencyInput } from '../../../shared/lib/currency.js';

const categoryList = [
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'casa', label: 'Casa' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'outros', label: 'Outros' }
];

const typeList = [
  { value: 'variable', label: 'Variável (Pontual)' },
  { value: 'fixed', label: 'Fixo (Recorrente)' }
];

const paymentList = [
  { value: 'pix', label: 'PIX' },
  { value: 'debit', label: 'Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit', label: 'Crédito' }
];

export function EditExpenseModal({ editExpenseModal, setEditExpenseModal, onClose, onSubmit }) {
  const items = editExpenseModal.data.items || [];
  const hasItems = items.length > 0;
  const itemsTotal = items.reduce((acc, it) => acc + (parseCurrencyInput(it.amount) || 0), 0);

  const setData = (patch) => setEditExpenseModal({ ...editExpenseModal, data: { ...editExpenseModal.data, ...patch } });
  const addItem = () => setData({ items: [...items, { desc: '', amount: '', category: 'outros' }] });
  const updateItem = (idx, field, value) => setData({ items: items.map((it, i) => i === idx ? { ...it, [field]: value } : it) });
  const removeItem = (idx) => setData({ items: items.filter((_, i) => i !== idx) });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"><X size={18} /></button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Editar Gasto</h3>
        <form onSubmit={onSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required autoFocus value={editExpenseModal.data.desc} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, desc: e.target.value}})} className="w-full rounded-lg border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white p-2.5 border bg-white text-sm"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                <CurrencyInput
                  required
                  readOnly={hasItems}
                  value={hasItems ? itemsTotal : editExpenseModal.data.amount}
                  onChange={(val) => setData({ amount: val })}
                  focusRingColor="focus:border-blue-500 focus:ring-blue-500"
                  className="p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                <CustomSelect
                  value={editExpenseModal.data.type}
                  onChange={(val) => setData({ type: val })}
                  options={typeList}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pagamento</label>
                <CustomSelect
                  value={editExpenseModal.data.paymentMethod}
                  onChange={(val) => setData({ paymentMethod: val })}
                  options={paymentList}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                <CustomDatePicker
                  value={editExpenseModal.data.date}
                  onChange={(val) => setData({ date: val })}
                />
              </div>
            </div>
            {!hasItems && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <CustomSelect
                  value={editExpenseModal.data.category}
                  onChange={(val) => setData({ category: val })}
                  options={categoryList}
                />
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-zinc-800/60 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Itens da Fatura</label>
                <button type="button" onClick={addItem} className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"><ListPlus size={14} /> Adicionar item</button>
              </div>
              {hasItems && (
                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-xl border border-gray-200 dark:border-zinc-800/60">
                      <input type="text" required placeholder="Descrição" value={it.desc} onChange={(e) => updateItem(idx, 'desc', e.target.value)} className="flex-1 min-w-0 rounded-lg border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white p-2 border bg-white text-sm"/>
                      <div className="w-28">
                        <CurrencyInput
                          required
                          value={it.amount}
                          onChange={(val) => updateItem(idx, 'amount', val)}
                          focusRingColor="focus:border-blue-500 focus:ring-blue-500"
                          className="p-2 text-xs"
                        />
                      </div>
                      <div className="w-32">
                        <CustomSelect
                          value={it.category}
                          onChange={(val) => updateItem(idx, 'category', val)}
                          options={categoryList}
                          buttonClassName="py-2 text-xs"
                        />
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">Total dos itens: {formatCurrency(itemsTotal)}</p>
                </div>
              )}
            </div>

            {editExpenseModal.data.paymentMethod === 'credit' && (
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parcelas</label><input type="number" min="1" max="48" value={editExpenseModal.data.installments} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, installments: e.target.value}})} className="w-full rounded-lg border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white p-2.5 border bg-white text-sm"/></div>
            )}
            {editExpenseModal.data.paymentMethod !== 'credit' && (
              <div className="pt-1"><label className="flex items-start gap-3 cursor-pointer group bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-gray-200 dark:border-zinc-800/60 transition-colors hover:border-blue-300 dark:hover:border-blue-700"><input type="checkbox" checked={editExpenseModal.data.deductFromBalance} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, deductFromBalance: e.target.checked}})} className="mt-0.5 rounded w-4 h-4 text-blue-600 focus:ring-blue-500 bg-white border-gray-300 dark:bg-zinc-950 dark:border-zinc-700"/><span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">Descontar do Saldo Atual</span></label></div>
            )}
            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-md cursor-pointer">Guardar Alterações</button>
        </form>
      </div>
    </div>
  );
}
