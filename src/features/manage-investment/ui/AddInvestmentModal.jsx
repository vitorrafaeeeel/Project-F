import { X, PiggyBank, Plus } from 'lucide-react';

export function AddInvestmentModal({ onClose, newInvestment, setNewInvestment, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><PiggyBank className="text-blue-500" /> Novo Investimento</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome / Objetivo</label><input type="text" required placeholder="Ex: Tesouro Selic, Reserva..." autoFocus value={newInvestment.desc} onChange={(e) => setNewInvestment({...newInvestment, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta de Aporte Mensal (Simulador)</label><input type="number" step="0.01" required min="0" placeholder="0.00" value={newInvestment.monthlyAmount} onChange={(e) => setNewInvestment({...newInvestment, monthlyAmount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saldo Inicial</label><input type="number" step="0.01" min="0" placeholder="0.00" value={newInvestment.currentBalance} onChange={(e) => setNewInvestment({...newInvestment, currentBalance: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rendimento (%/mês)</label><input type="number" step="0.01" placeholder="0.8" value={newInvestment.interestRate} onChange={(e) => setNewInvestment({...newInvestment, interestRate: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
          </div>
          <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2"><Plus size={18} /> Criar Investimento</button>
        </form>
      </div>
    </div>
  );
}
