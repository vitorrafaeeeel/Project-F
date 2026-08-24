import { X, Receipt, Plus } from 'lucide-react';

export function AddExpenseModal({
  onClose, newExpense, setNewExpense, onSubmit
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><Receipt className="text-red-500" /> Adicionar Gasto</h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required placeholder="Ex: Aluguel, Mercado..." autoFocus value={newExpense.desc} onChange={(e) => setNewExpense({...newExpense, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label><input type="number" step="0.01" required min="0.01" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label><select value={newExpense.type} onChange={(e) => setNewExpense({...newExpense, type: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="variable">Variável (Pontual)</option><option value="fixed">Fixo (Recorrente)</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pagamento</label><select value={newExpense.paymentMethod} onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="pix">PIX</option><option value="debit">Débito</option><option value="cash">Dinheiro</option><option value="credit">Crédito</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={newExpense.date} onChange={(e) => setNewExpense({...newExpense, date: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700">
                <option value="alimentacao">Alimentação / Mercado</option><option value="casa">Casa / Moradia</option><option value="transporte">Transporte / Veículo</option><option value="lazer">Lazer / Viagens</option><option value="saude">Saúde / Farmácia</option><option value="educacao">Educação / Cursos</option><option value="cartao_credito">Cartão de Crédito / Fatura</option><option value="outros">Outros</option>
              </select>
          </div>
          {newExpense.paymentMethod === 'credit' && (
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parcelas</label><input type="number" min="1" max="48" value={newExpense.installments} onChange={(e) => setNewExpense({...newExpense, installments: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
          )}
          {newExpense.paymentMethod !== 'credit' && (
            <div className="pt-1"><label className="flex items-start gap-3 cursor-pointer group bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors hover:border-red-300 dark:hover:border-red-700"><input type="checkbox" checked={newExpense.deductFromBalance} onChange={(e) => setNewExpense({...newExpense, deductFromBalance: e.target.checked})} className="mt-0.5 rounded w-4 h-4 text-red-600 focus:ring-red-500 bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"/><span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">Descontar do Saldo Atual (Ocultará no futuro caso a data escolhida for posterior a de hoje)</span></label></div>
          )}
          <button type="submit" className="w-full mt-4 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md"><Plus size={18} /> Registrar Gasto</button>
        </form>
      </div>
    </div>
  );
}
