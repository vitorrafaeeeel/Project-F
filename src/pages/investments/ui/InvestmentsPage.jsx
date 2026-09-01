import { memo, useMemo } from 'react';
import { Edit, Coins, Trash2, Plus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';

export const InvestmentsPage = memo(({
  data,
  projections,
  onNewInvestment,
  setEditInvModal,
  setDepositModal,
  handleDeleteInvestment
}) => {
  const investments = useMemo(() => data?.investments || [], [data?.investments]);

  const totalInvestmentsBalance = useMemo(
    () => projections?.totalInvestmentsBalance ?? investments.reduce((acc, inv) => acc + (inv.currentBalance || 0), 0),
    [projections?.totalInvestmentsBalance, investments]
  );

  const totalInvestmentMonthly = useMemo(
    () => projections?.totalInvestmentMonthly ?? investments.reduce((acc, inv) => acc + (inv.monthlyAmount || 0), 0),
    [projections?.totalInvestmentMonthly, investments]
  );

  const currentMonthStats = projections?.currentMonthStats;
  const monthTotalIncome = currentMonthStats?.monthTotalIncome || 0;
  const monthTotalExpenses = currentMonthStats?.monthTotalExpenses || 0;
  const netSavings = monthTotalIncome - monthTotalExpenses;

  const totalEstimatedMonthlyReturn = useMemo(
    () => investments.reduce((acc, inv) => acc + ((inv.currentBalance || 0) * (inv.interestRate || 0.008)), 0),
    [investments]
  );

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Cards de Resumo & Sincronização de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total em Investimentos */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patrimônio Investido</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5">
            {formatCurrency(totalInvestmentsBalance)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Rendimento est.: {formatCurrency(totalEstimatedMonthlyReturn)} / mês
          </p>
        </div>

        {/* Meta de Aporte Mensal */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Meta Mensal de Aportes</p>
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1.5">
            {formatCurrency(totalInvestmentMonthly)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {monthTotalIncome > 0
              ? `${((totalInvestmentMonthly / monthTotalIncome) * 100).toFixed(1)}% da renda mensal`
              : 'Compromisso de aportes'}
          </p>
        </div>

        {/* Capacidade de Aporte / Sobra do Planejamento */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Capacidade de Aporte</p>
          <h3 className={`text-2xl font-bold mt-1.5 ${
            netSavings >= totalInvestmentMonthly
              ? 'text-emerald-600 dark:text-emerald-400'
              : netSavings > 0
                ? 'text-amber-500'
                : 'text-red-500'
          }`}>
            {formatCurrency(netSavings)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {netSavings >= totalInvestmentMonthly
              ? 'Meta coberta pela sobra mensal'
              : netSavings > 0
                ? 'Meta supera a sobra líquida'
                : 'Déficit no fluxo de caixa'}
          </p>
        </div>
      </div>

      {/* 2. Tabela de Investimentos e Ações */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800/60 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meus Investimentos</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Gerencie seus ativos, faça aportes e ajuste suas metas mensais
            </p>
          </div>

          <button
            type="button"
            onClick={onNewInvestment}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Novo Investimento</span>
          </button>
        </div>

        {investments.length === 0 ? (
          <div className="p-12 text-center">
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Nenhum investimento registrado
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Comece a planejar o seu futuro financeiro adicionando suas metas de aportes e ativos.
            </p>
            <button
              type="button"
              onClick={onNewInvestment}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Criar Primeiro Investimento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800/60">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Ativo</th>
                  <th className="px-6 py-3.5 text-right font-semibold">Saldo Atual</th>
                  <th className="px-6 py-3.5 text-right font-semibold">Meta de Aporte</th>
                  <th className="px-6 py-3.5 text-center font-semibold">Taxa Estimada</th>
                  <th className="px-6 py-3.5 text-right font-semibold">Rendimento Est.</th>
                  <th className="px-6 py-3.5 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                {investments.map((inv) => {
                  const ratePct = ((inv.interestRate || 0.008) * 100).toFixed(2);
                  const estReturn = (inv.currentBalance || 0) * (inv.interestRate || 0.008);

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                          <span>{inv.desc}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(inv.currentBalance || 0)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(inv.monthlyAmount || 0)} <span className="text-xs text-gray-400 font-normal">/mês</span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                          {ratePct}% a.m.
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(estReturn)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDepositModal({ isOpen: true, invId: inv.id, amount: '' })}
                            className="px-2.5 py-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:hover:bg-emerald-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Fazer Aporte"
                          >
                            <Coins size={14} />
                            <span>Aportar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditInvModal({
                              isOpen: true,
                              id: inv.id,
                              desc: inv.desc,
                              monthlyAmount: inv.monthlyAmount,
                              interestRate: (inv.interestRate * 100).toFixed(2)
                            })}
                            className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Editar Meta"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInvestment(inv.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remover Investimento"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dica / Alerta Integrado caso meta supere sobra */}
      {totalInvestmentMonthly > 0 && netSavings > 0 && totalInvestmentMonthly > netSavings && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-800/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            Sua meta total de aportes mensais (<strong>{formatCurrency(totalInvestmentMonthly)}</strong>) é superior à sua capacidade líquida estimada de poupança (<strong>{formatCurrency(netSavings)}</strong>). Considere revisar suas despesas ou redistribuir seus aportes para manter um fluxo de caixa saudável.
          </p>
        </div>
      )}
    </div>
  );
});
