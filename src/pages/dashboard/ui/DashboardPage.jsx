import { memo, useMemo } from 'react';
import {
  DollarSign, ArrowDownCircle, Wallet, Sparkles, Bot, BarChart3, TrendingUp, ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';

export const DashboardPage = memo(({ projections, data, aiInsight, aiInsightLoading, handleGenerateInsight }) => {
  const maxChartValue = useMemo(() => {
    if (!projections?.timeline || projections.timeline.length === 0) return 100;
    const maxVal = Math.max(...projections.timeline.map(t => Math.max(t.netBalance || 0, t.totalInvestments || 0, 0)));
    return maxVal > 0 ? maxVal : 100;
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

      {/* AI ADVISOR */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-blue-800/30 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-full shadow-md">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">Consultor Inteligente ✨</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300/80">Análise baseada nos seus dados deste mês com Inteligência Artificial.</p>
            </div>
          </div>
          {!aiInsight && !aiInsightLoading && (
            <button
              onClick={() => handleGenerateInsight(projections.currentMonthStats)}
              className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <Bot size={18} /> Gerar Insight
            </button>
          )}
        </div>

        {aiInsightLoading && (
          <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">A IA está analisando suas finanças...</span>
          </div>
        )}

        {aiInsight && !aiInsightLoading && (
          <div className="mt-4 p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/50">
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed italic">"{aiInsight}"</p>
            <div className="mt-3 text-right">
              <button onClick={() => handleGenerateInsight(projections.currentMonthStats)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Gerar nova análise
              </button>
            </div>
          </div>
        )}
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

      {/* Evolutivo Chart & Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> Evolução Projetada (12 Meses)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A projeção assume que nos meses futuros você atingirá o seu Planejamento de Gastos.</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[600px] h-64 flex items-end gap-2 pb-6 relative">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 pr-2 border-r border-gray-200 dark:border-gray-700 w-16 text-right">
              <span>{formatCurrency(maxChartValue).split(',')[0]}</span>
              <span>{formatCurrency(maxChartValue / 2).split(',')[0]}</span>
              <span>R$ 0</span>
            </div>
            <div className="ml-16 flex-1 flex items-end justify-between h-full relative">
              <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700 bottom-0"></div>
              {projections.timeline.map((point, idx) => {
                const balanceHeight = Math.max(0, (point.netBalance / maxChartValue) * 100);
                const investHeight = Math.max(0, (point.totalInvestments / maxChartValue) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="flex gap-1 items-end h-[200px] w-full justify-center relative">
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded p-2 z-10 whitespace-nowrap pointer-events-none shadow-lg">
                        <p className="font-bold mb-1">{point.label}</p>
                        <p>Conta: {formatCurrency(point.netBalance)}</p>
                        <p>Patrimônio: {formatCurrency(point.totalInvestments)}</p>
                      </div>
                      <div className={`w-1/3 max-w-[20px] rounded-t-sm transition-all duration-500 ${point.netBalance >= 0 ? 'bg-blue-400 dark:bg-blue-500' : 'bg-red-400 dark:bg-red-500'}`} style={{ height: `${balanceHeight}%` }}></div>
                      <div className="w-1/3 max-w-[20px] bg-green-400 dark:bg-green-500 rounded-t-sm transition-all duration-500" style={{ height: `${investHeight}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-sm"></div><span>Saldo na Conta (Parado)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-sm"></div><span>Patrimônio (Investimentos)</span></div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3">Mês</th>
                <th className="px-6 py-3 text-right">Fluxo do Mês (Conta)</th>
                <th className="px-6 py-3 text-right">Saldo na Conta (Parado)</th>
                <th className="px-6 py-3 text-right">Patrimônio Total (Investimentos)</th>
              </tr>
            </thead>
            <tbody>
              {projections.timeline.map((point, idx) => (
                <tr key={idx} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {point.label}
                    {idx === 0 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300">Atual</span>}
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${point.appliedMonthlyBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {idx === 0 ? '-' : formatCurrency(point.appliedMonthlyBalance)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(point.netBalance)}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(point.totalAssets)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

