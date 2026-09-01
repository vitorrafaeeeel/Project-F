import { X, Plus } from 'lucide-react';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';

export function AddInvestmentModal({ onClose, newInvestment, setNewInvestment, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"><X size={18} /></button>
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Novo Investimento</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Ativo</label>
            <input type="text" required placeholder="Ex: Tesouro Selic, Reserva..." autoFocus value={newInvestment.desc} onChange={(e) => setNewInvestment({...newInvestment, desc: e.target.value})} className="w-full rounded-lg border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white p-3 border bg-white text-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta de Aporte Mensal</label>
            <CurrencyInput
              value={newInvestment.monthlyAmount}
              onChange={(val) => setNewInvestment({ ...newInvestment, monthlyAmount: val })}
              focusRingColor="focus:border-blue-500 focus:ring-blue-500"
              className="p-3 text-sm rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saldo Inicial</label>
              <CurrencyInput
                value={newInvestment.currentBalance}
                onChange={(val) => setNewInvestment({ ...newInvestment, currentBalance: val })}
                focusRingColor="focus:border-blue-500 focus:ring-blue-500"
                className="p-3 text-sm rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rendimento (% a.m.)</label>
              <input type="number" inputMode="decimal" step="0.01" placeholder="0.8" value={newInvestment.interestRate} onChange={(e) => setNewInvestment({...newInvestment, interestRate: e.target.value})} className="w-full rounded-lg border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white p-3 border bg-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
            </div>
          </div>
          <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-md"><Plus size={18} /> Criar Investimento</button>
        </form>
      </div>
    </div>
  );
}
