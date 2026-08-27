import { X, Edit, Trash2, ListPlus } from 'lucide-react';

const categoryOptions = (
  <>
    <option value="alimentacao">Alimentação / Mercado</option><option value="casa">Casa / Moradia</option><option value="transporte">Transporte / Veículo</option><option value="lazer">Lazer / Viagens</option><option value="saude">Saúde / Farmácia</option><option value="educacao">Educação / Cursos</option><option value="cartao_credito">Cartão de Crédito / Fatura</option><option value="outros">Outros</option>
  </>
);

export function EditExpenseModal({ editExpenseModal, setEditExpenseModal, onClose, onSubmit }) {
  const items = editExpenseModal.data.items || [];
  const hasItems = items.length > 0;
  const itemsTotal = items.reduce((acc, it) => acc + (parseFloat(String(it.amount).replace(',', '.')) || 0), 0);

  const setData = (patch) => setEditExpenseModal({ ...editExpenseModal, data: { ...editExpenseModal.data, ...patch } });
  const addItem = () => setData({ items: [...items, { desc: '', amount: '', category: 'outros' }] });
  const updateItem = (idx, field, value) => setData({ items: items.map((it, i) => i === idx ? { ...it, [field]: value } : it) });
  const removeItem = (idx) => setData({ items: items.filter((_, i) => i !== idx) });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Edit className="text-blue-500" /> Editar Gasto</h3>
        <form onSubmit={onSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required autoFocus value={editExpenseModal.data.desc} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, desc: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                <input type="number" step="0.01" required min="0.01" readOnly={hasItems} value={hasItems ? itemsTotal.toFixed(2) : editExpenseModal.data.amount} onChange={(e) => setData({ amount: e.target.value })} className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700 ${hasItems ? 'opacity-70 cursor-not-allowed' : ''}`}/>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label><select value={editExpenseModal.data.type} onChange={(e) => setData({ type: e.target.value })} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="variable">Variável (Pontual)</option><option value="fixed">Fixo (Recorrente)</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pagamento</label><select value={editExpenseModal.data.paymentMethod} onChange={(e) => setData({ paymentMethod: e.target.value })} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="pix">PIX</option><option value="debit">Débito</option><option value="cash">Dinheiro</option><option value="credit">Crédito</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={editExpenseModal.data.date} onChange={(e) => setData({ date: e.target.value })} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
            </div>
            {!hasItems && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <select value={editExpenseModal.data.category} onChange={(e) => setData({ category: e.target.value })} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700">
                    {categoryOptions}
                  </select>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Itens da Fatura</label>
                <button type="button" onClick={addItem} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><ListPlus size={14} /> Adicionar item</button>
              </div>
              {hasItems && (
                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-900/40 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <input type="text" required placeholder="Descrição" value={it.desc} onChange={(e) => updateItem(idx, 'desc', e.target.value)} className="flex-1 min-w-0 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2 border bg-white dark:bg-gray-700 text-sm"/>
                      <input type="number" step="0.01" min="0.01" required placeholder="0.00" value={it.amount} onChange={(e) => updateItem(idx, 'amount', e.target.value)} className="w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2 border bg-white dark:bg-gray-700 text-sm"/>
                      <select value={it.category} onChange={(e) => updateItem(idx, 'category', e.target.value)} className="w-32 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2 border bg-white dark:bg-gray-700 text-sm">
                        {categoryOptions}
                      </select>
                      <button type="button" onClick={() => removeItem(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">Total dos itens: {itemsTotal.toFixed(2).replace('.', ',')}</p>
                </div>
              )}
            </div>

            {editExpenseModal.data.paymentMethod === 'credit' && (
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parcelas</label><input type="number" min="1" max="48" value={editExpenseModal.data.installments} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, installments: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
            )}
            {editExpenseModal.data.paymentMethod !== 'credit' && (
              <div className="pt-1"><label className="flex items-start gap-3 cursor-pointer group bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors hover:border-blue-300 dark:hover:border-blue-700"><input type="checkbox" checked={editExpenseModal.data.deductFromBalance} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, deductFromBalance: e.target.checked}})} className="mt-0.5 rounded w-4 h-4 text-blue-600 focus:ring-blue-500 bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"/><span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">Descontar do Saldo Atual</span></label></div>
            )}
            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md">Guardar Alterações</button>
        </form>
      </div>
    </div>
  );
}
