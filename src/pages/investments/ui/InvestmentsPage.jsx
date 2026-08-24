import { memo } from 'react';
import { PiggyBank, Edit, Coins, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';

export const InvestmentsPage = memo(({ data, projections, setEditInvModal, setDepositModal, handleDeleteInvestment }) => {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meus Investimentos</h3>
            <div className="text-sm mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium inline-block">
              Metas de Aporte: {formatCurrency(projections.totalInvestmentMonthly)} / mês
            </div>
          </div>
        </div>

        {!(data.investments && data.investments.length > 0) ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <PiggyBank className="mx-auto h-16 w-16 opacity-20 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Nenhum investimento registrado.</p>
            <p className="text-sm mt-1">Comece a planear o seu futuro adicionando as suas metas pelo botão azul (+).</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr><th className="px-6 py-3">Descrição</th><th className="px-6 py-3 text-right">Saldo Atual</th><th className="px-6 py-3 text-right">Meta (Simulador)</th><th className="px-6 py-3 text-center">Taxa/Mês</th><th className="px-6 py-3 text-center">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>{inv.desc}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">{formatCurrency(inv.currentBalance)}</td>
                    <td className="px-6 py-4 text-right font-medium text-blue-600 dark:text-blue-400">{formatCurrency(inv.monthlyAmount)}</td>
                    <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{(inv.interestRate * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button onClick={() => setEditInvModal({ isOpen: true, id: inv.id, desc: inv.desc, monthlyAmount: inv.monthlyAmount, interestRate: inv.interestRate * 100 })} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-600 rounded-md transition-colors flex items-center gap-1" title="Editar Meta"><Edit size={16} /></button>
                    <button onClick={() => setDepositModal({ isOpen: true, invId: inv.id, amount: '' })} className="p-2 text-green-600 hover:text-white hover:bg-green-600 bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-600 rounded-md transition-colors flex items-center gap-1" title="Fazer Aporte"><Coins size={16} /> <span className="text-xs font-semibold hidden sm:inline">Aportar</span></button>
                    <button onClick={() => handleDeleteInvestment(inv.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Remover"><Trash2 size={18} /></button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});
