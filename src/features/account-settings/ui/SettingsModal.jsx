import { X, Settings } from 'lucide-react';

export function SettingsModal({ onClose, editIncome, setEditIncome, editIncomeDay, setEditIncomeDay, editBalance, setEditBalance, editBudget, setEditBudget, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><Settings className="text-blue-500" /> Dados da Conta</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Renda Mensal Fixa (R$)</label><input type="number" step="0.01" value={editIncome} onChange={(e) => setEditIncome(e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dia do Recebimento do Salário</label><input type="number" min="1" max="31" placeholder="Ex: 5" value={editIncomeDay} onChange={(e) => setEditIncomeDay(e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Usado apenas para mostrar o salário no Calendário — não altera o saldo automaticamente.</p></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saldo Atual em Conta (R$)</label><input type="number" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite Planejado de Gastos/Mês (R$)</label><input type="number" step="0.01" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          <button onClick={onSave} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors">Guardar Alterações</button>
        </div>
      </div>
    </div>
  );
}
