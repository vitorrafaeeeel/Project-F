import { memo } from 'react';
import {
  DollarSign, ArrowDownCircle, Wallet, ArrowDownRight, ArrowUpRight, Target
} from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';
import { categoryConfig } from '../../../entities/expense/model/categories.js';

export const DashboardPage = memo(({ projections, data, categoryUsage, onOpenCategoryBudgets }) => {
  if (!projections?.currentMonthStats) return null;

  const plannedBudget = data?.plannedBudget || 0;
  const categoryBudgets = data?.categoryBudgets || [];
  const totalCategoryBudget = categoryBudgets.reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Renda Total */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renda Total (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(projections.currentMonthStats.monthTotalIncome)}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fixo: {formatCurrency(data?.income || 0)} | Extras: {formatCurrency(projections.currentMonthStats.monthExtraIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Gastos Totais */}
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

        {/* Saldo Atual */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual em Conta</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {formatCurrency(data?.currentAccountBalance || 0)}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Base para Novos Componentes: Orçamento por Categoria, Gráficos e Transações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ORÇAMENTO POR CATEGORIA */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-pink-500" /> Orçamento por Categoria
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Limites definidos por categoria (mês atual).</p>
            </div>
            <button
              onClick={onOpenCategoryBudgets}
              className="text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 whitespace-nowrap cursor-pointer transition-colors"
            >
              Editar
            </button>
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                        {cat.label}
                      </span>
                      <span className={`text-xs font-semibold ${ratio >= 1 ? 'text-red-600 dark:text-red-400' : ratio >= 0.8 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatCurrency(spent)} / {formatCurrency(b.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 transition-all duration-500 ${ratio >= 1 ? 'bg-red-500' : ratio >= 0.8 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {totalCategoryBudget > 0 && plannedBudget > 0 && totalCategoryBudget > plannedBudget && (
                <p className="text-xs text-orange-600 dark:text-orange-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                  ⚠️ A soma dos orçamentos por categoria ({formatCurrency(totalCategoryBudget)}) ultrapassa o limite planejado de gastos ({formatCurrency(plannedBudget)}).
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

