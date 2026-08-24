import { Plus, ArrowUpCircle, Receipt, PiggyBank } from 'lucide-react';

export function QuickActionsFab({ fabOpen, setFabOpen, onNewIncome, onNewExpense, onNewInvestment }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {fabOpen && (
        <div className="flex flex-col gap-3 items-end mb-2 transition-all duration-200">
          <button onClick={() => { onNewIncome(); setFabOpen(false); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-green-700 transition-colors font-medium">
             Nova Receita <ArrowUpCircle size={18} />
          </button>
          <button onClick={() => { onNewExpense(); setFabOpen(false); }} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-red-700 transition-colors font-medium">
             Novo Gasto <Receipt size={18} />
          </button>
          <button onClick={() => { onNewInvestment(); setFabOpen(false); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium">
             Novo Investimento <PiggyBank size={18} />
          </button>
        </div>
      )}
      <button onClick={() => setFabOpen(!fabOpen)} className={`bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform duration-300 flex items-center justify-center ${fabOpen ? 'rotate-45' : 'rotate-0'}`}>
        <Plus size={28} />
      </button>
    </div>
  );
}
