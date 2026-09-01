import { memo, useMemo } from 'react';
import {
  DollarSign, ArrowDownCircle, Wallet, BarChart3, TrendingUp, ArrowDownRight, ArrowUpRight, Target
} from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';
import { categoryConfig } from '../../../entities/expense/model/categories.js';

export const DashboardPage = memo(({ projections, data, categoryUsage, onOpenCategoryBudgets }) => {
  const maxChartValue = useMemo(() => {
    if (!projections?.timeline || projections.timeline.length === 0) return 100;
    const maxVal = Math.max(...projections.timeline.map(t => Math.max(t.netBalance || 0, t.totalInvestments || 0, 0)));
    return maxVal > 0 ? Math.ceil(maxVal * 1.1) : 100;
  }, [projections?.timeline]);

  const budgetGuidance = useMemo(() => {
    if (!data?.plannedBudget || !projections?.currentMonthStats) return null;
    const totalExpenses = projections.currentMonthStats.monthTotalExpenses || 0;
    if (data.plannedBudget <= totalExpenses) return null;

    const today = new Date().getDate();
    const daysRemaining = Math.max(1, (projections.daysInCurrentMonth || 30) - today + 1);
    const remainingBudget = data.plannedBudget - totalExpenses;
    const safeDaily = remainingBudget / daysRemaining;
    const safeWeekly = safeDaily * 7;

    return { daysRemaining, safeDaily, safeWeekly };
  }, [data?.plannedBudget, projections?.currentMonthStats, projections?.daysInCurrentMonth]);

  const dailyChartMetrics = useMemo(() => {
    if (!data?.plannedBudget || !projections?.daysInCurrentMonth) {
      return { dailyTarget: 0, safeMax: 1, budgetLinePct: 0 };
    }
    const dailyTarget = data.plannedBudget / projections.daysInCurrentMonth;
    const maxDailyVal = Math.max(dailyTarget * 1.5, ...(projections.dailySpending || []).map(d => d.amount || 0));
    const safeMax = maxDailyVal > 0 ? maxDailyVal : 1;
    const budgetLinePct = Math.min((dailyTarget / safeMax) * 100, 100);

    return { dailyTarget, safeMax, budgetLinePct };
  }, [data?.plannedBudget, projections?.daysInCurrentMonth, projections?.dailySpending]);

  if (!projections?.currentMonthStats) return null;

  const currentExpenses = projections.currentMonthStats.monthTotalExpenses || 0;
  const plannedBudget = data?.plannedBudget || 0;
  const budgetRatio = plannedBudget > 0 ? (currentExpenses / plannedBudget) : 0;
  const budgetPctFormatted = (budgetRatio * 100).toFixed(1);
  const categoryBudgets = data?.categoryBudgets || [];
  const totalCategoryBudget = categoryBudgets.reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renda Total (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(projections.currentMonthStats.monthTotalIncome)}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fixo: {formatCurrency(data.income)} | Extras: {formatCurrency(projections.currentMonthStats.monthExtraIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos Totais (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(projections.currentMonthStats.monthTotalExpenses)}</h3>
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fixos: {formatCurrency(projections.currentMonthStats.monthFixedExpenses)} | Variáveis: {formatCurrency(projections.currentMonthStats.monthVariableExpenses)}
                </p>
                {projections.prevMonthStats?.totalExpenses > 0 && (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${
                    projections.currentMonthStats.monthTotalExpenses > projections.prevMonthStats.totalExpenses ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {projections.currentMonthStats.monthTotalExpenses > projections.prevMonthStats.totalExpenses ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{Math.abs(((projections.currentMonthStats.monthTotalExpenses - projections.prevMonthStats.totalExpenses) / projections.prevMonthStats.totalExpenses) * 100).toFixed(1)}% vs Mês Passado</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
              <ArrowDownCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual em Conta</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {formatCurrency(data.currentAccountBalance || 0)}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>


      {/* ALERTA DE ORÇAMENTO */}
      {plannedBudget > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">🎯 Planejamento de Gastos (Mês Atual)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Você gastou {formatCurrency(currentExpenses)} de um limite de {formatCurrency(plannedBudget)}</p>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold ${
                budgetRatio >= 1 ? 'text-red-600 dark:text-red-400' :
                budgetRatio >= 0.8 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'
              }`}>
                {budgetPctFormatted}%
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4 overflow-hidden flex">
            <div
              className={`h-3 transition-all duration-500 ${
                budgetRatio >= 1 ? 'bg-red-500' :
                budgetRatio >= 0.8 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetRatio * 100, 100)}%` }}
            ></div>
          </div>

          {budgetGuidance && (
            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 transition-colors duration-300">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Para não estourar o limite nestes {budgetGuidance.daysRemaining} dias que faltam, você pode gastar:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-blue-600 dark:text-blue-400">Por Semana (aprox.)</p><p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(budgetGuidance.safeWeekly)}</p></div>
                <div><p className="text-xs text-blue-600 dark:text-blue-400">Por Dia</p><p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(budgetGuidance.safeDaily)}</p></div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500" /> Gastos por Dia (Mês Atual)</h4>
              <div className="h-28 flex items-end gap-1 relative w-full mt-2">
                <div className="absolute left-0 w-full border-t border-dashed border-red-400 dark:border-red-600 z-0 flex items-end justify-end" style={{ bottom: `${dailyChartMetrics.budgetLinePct}%` }}>
                    <span className="text-[10px] text-red-500 bg-white dark:bg-gray-800 px-1 -translate-y-1/2 rounded">Média Ideal/Dia</span>
                </div>
                {(projections.dailySpending || []).map((dayData, idx) => {
                    const heightPct = Math.min((dayData.amount / dailyChartMetrics.safeMax) * 100, 100);
                    return (
                        <div key={idx} className="flex-1 flex flex-col justify-end items-center relative group z-10 h-full">
                             {dayData.amount > 0 && (
                               <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg transition-opacity">
                                  Dia {dayData.day}<br/>{formatCurrency(dayData.amount)}
                                </div>
                             )}
                             <div className={`w-full max-w-[12px] rounded-t-[2px] transition-all duration-300 ${dayData.amount > dailyChartMetrics.dailyTarget ? 'bg-red-400 dark:bg-red-500' : 'bg-blue-400 dark:bg-blue-500'}`} style={{ height: `${heightPct}%` }}></div>
                        </div>
                    );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>Dia 1</span><span>Dia 15</span><span>Dia {projections.daysInCurrentMonth}</span>
              </div>
          </div>
        </div>
      )}

      {/* ORÇAMENTO POR CATEGORIA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Target size={18} className="text-pink-500" /> Orçamento por Categoria</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Limites definidos por categoria (mês atual).</p>
          </div>
          <button onClick={onOpenCategoryBudgets} className="text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 whitespace-nowrap cursor-pointer">Editar</button>
        </div>
        {categoryBudgets.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum orçamento por categoria definido ainda.</p>
        ) : (
          <div className="space-y-4">
            {categoryBudgets.map(b => {
              const cat = categoryConfig[b.category] || categoryConfig['outros'];
              const spent = categoryUsage?.[b.category] || 0;
              const ratio = b.amount > 0 ? spent / b.amount : 0;
              return (
                <div key={b.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${cat.color}`}></span>{cat.label}</span>
                    <span className={`text-xs font-semibold ${ratio >= 1 ? 'text-red-600 dark:text-red-400' : ratio >= 0.8 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>{formatCurrency(spent)} / {formatCurrency(b.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 transition-all duration-500 ${ratio >= 1 ? 'bg-red-500' : ratio >= 0.8 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }}></div>
                  </div>
                </div>
              );
            })}
            {totalCategoryBudget > 0 && plannedBudget > 0 && totalCategoryBudget > plannedBudget && (
              <p className="text-xs text-orange-600 dark:text-orange-400 pt-2 border-t border-gray-100 dark:border-gray-700">⚠️ A soma dos orçamentos por categoria ({formatCurrency(totalCategoryBudget)}) ultrapassa o limite planejado de gastos ({formatCurrency(plannedBudget)}).</p>
            )}
          </div>
        )}
      </div>

      {/* Evolutivo Chart & Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> Evolução Projetada (12 Meses)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            A projeção calcula a evolução do seu patrimônio com base na sua receita fixa, investimentos e no teto de gastos mensal.
          </p>
        </div>

        {/* Gráfico 100% Responsivo sem barra de rolagem */}
        <div className="p-5 sm:p-6">
          <div className="w-full h-64 sm:h-72 flex flex-col justify-end relative select-none">
            
            {/* Linhas de Grade de Fundo */}
            <div className="absolute left-16 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none z-0">
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700/60"></div>
              <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700/60"></div>
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            {/* Eixo Y */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400 w-14 text-right pr-2 select-none z-10">
              <span className="truncate">{formatCurrency(maxChartValue).split(',')[0]}</span>
              <span className="truncate">{formatCurrency(maxChartValue / 2).split(',')[0]}</span>
              <span>R$ 0</span>
            </div>

            {/* Área das Colunas do Gráfico */}
            <div className="ml-16 flex-1 flex items-end justify-between h-full pb-8 relative z-10">
              {projections.timeline.map((point, idx) => {
                const balanceHeight = Math.min(Math.max(0, (point.netBalance / maxChartValue) * 100), 100);
                const investHeight = Math.min(Math.max(0, (point.totalInvestments / maxChartValue) * 100), 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative px-0.5 sm:px-1">
                    
                    {/* Tooltip Flutuante Moderno e de Alto Contraste */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-xl p-3 z-40 whitespace-nowrap pointer-events-none shadow-2xl border border-gray-700/80 min-w-[180px]">
                      <div className="flex items-center justify-between border-b border-gray-700/60 pb-1.5 mb-2">
                        <span className="font-bold text-gray-100">{point.label}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-semibold">
                            Atual
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-gray-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            Saldo em Conta:
                          </span>
                          <span className="font-semibold text-white">{formatCurrency(point.netBalance)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-gray-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Investimentos:
                          </span>
                          <span className="font-semibold text-white">{formatCurrency(point.totalInvestments)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-gray-700/50 text-gray-400">
                          <span>Patrimônio Total:</span>
                          <span className="font-bold text-emerald-400">{formatCurrency(point.netBalance + point.totalInvestments)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Barras Lado a Lado */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Barra de Saldo em Conta */}
                      <div
                        className={`flex-1 max-w-[14px] rounded-t-sm transition-all duration-300 group-hover:brightness-110 ${
                          point.netBalance >= 0 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-red-400 dark:bg-red-500'
                        }`}
                        style={{ height: `${balanceHeight}%` }}
                      ></div>
                      {/* Barra de Patrimônio / Investimentos */}
                      <div
                        className="flex-1 max-w-[14px] bg-emerald-500 dark:bg-emerald-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                        style={{ height: `${investHeight}%` }}
                      ></div>
                    </div>

                    {/* Rótulo do Eixo X (Mês) */}
                    <span className="absolute top-full mt-1.5 text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate max-w-full text-center">
                      {point.label.split('/')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda do Gráfico */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 pt-3 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-sm"></div>
              <span>Saldo na Conta (Parado)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-sm"></div>
              <span>Patrimônio (Investimentos)</span>
            </div>
          </div>
        </div>

        {/* Tabela de Projeções */}
        <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Mês</th>
                <th className="px-6 py-3.5 text-right font-semibold">Fluxo do Mês (Conta)</th>
                <th className="px-6 py-3.5 text-right font-semibold">Saldo na Conta (Parado)</th>
                <th className="px-6 py-3.5 text-right font-semibold">Patrimônio Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {projections.timeline.map((point, idx) => (
                <tr key={idx} className="bg-white dark:bg-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-white">
                    {point.label}
                    {idx === 0 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900/40 dark:text-blue-300 font-semibold">Atual</span>}
                  </td>
                  <td className={`px-6 py-3.5 text-right font-semibold ${point.appliedMonthlyBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {idx === 0 ? '-' : formatCurrency(point.appliedMonthlyBalance)}
                  </td>
                  <td className="px-6 py-3.5 text-right text-gray-700 dark:text-gray-300">{formatCurrency(point.netBalance)}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(point.netBalance + point.totalInvestments)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

