import { memo, useMemo } from 'react';
import {
  DollarSign, ArrowDownCircle, Wallet, ArrowDownRight, ArrowUpRight,
  Target, PiggyBank, ShieldCheck, AlertTriangle, Plus, Sliders, CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';
import { categoryConfig } from '../../../entities/expense/model/categories.js';

export const DashboardPage = memo(({ projections, data, categoryUsage, onOpenCategoryBudgets, onOpenSettings }) => {
  const currentMonthStats = projections?.currentMonthStats;

  const plannedBudget = data?.plannedBudget || 0;
  const categoryBudgets = useMemo(() => data?.categoryBudgets || [], [data?.categoryBudgets]);
  const totalCategoryBudget = useMemo(() => categoryBudgets.reduce((acc, b) => acc + (b.amount || 0), 0), [categoryBudgets]);

  const investments = useMemo(() => data?.investments || [], [data?.investments]);
  const totalInvestmentsBalance = useMemo(
    () => projections?.totalInvestmentsBalance ?? investments.reduce((acc, inv) => acc + (inv.currentBalance || 0), 0),
    [projections?.totalInvestmentsBalance, investments]
  );
  const totalMonthlyInvestments = useMemo(
    () => projections?.totalInvestmentMonthly ?? investments.reduce((acc, inv) => acc + (inv.monthlyAmount || 0), 0),
    [projections?.totalInvestmentMonthly, investments]
  );

  const monthTotalIncome = currentMonthStats?.monthTotalIncome || 0;
  const monthTotalExpenses = currentMonthStats?.monthTotalExpenses || 0;
  const netSavings = monthTotalIncome - monthTotalExpenses;
  const savingsRate = monthTotalIncome > 0 ? (netSavings / monthTotalIncome) * 100 : 0;
  const expenseRatio = monthTotalIncome > 0 ? (monthTotalExpenses / monthTotalIncome) * 100 : 0;

  const budgetRatio = plannedBudget > 0 ? (monthTotalExpenses / plannedBudget) : 0;
  const budgetPct = (budgetRatio * 100).toFixed(1);
  const remainingBudget = plannedBudget - monthTotalExpenses;

  if (!currentMonthStats) return null;

  return (
    <div className="space-y-6">
      {/* 1. Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Renda Total */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renda Total (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(monthTotalIncome)}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fixo: {formatCurrency(data?.income || 0)} | Extras: {formatCurrency(currentMonthStats.monthExtraIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-full">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Gastos Totais */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos Totais (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(monthTotalExpenses)}</h3>
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fixos: {formatCurrency(currentMonthStats.monthFixedExpenses)} | Variáveis: {formatCurrency(currentMonthStats.monthVariableExpenses)}
                </p>
                {projections.prevMonthStats?.totalExpenses > 0 && (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${
                    monthTotalExpenses > projections.prevMonthStats.totalExpenses ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {monthTotalExpenses > projections.prevMonthStats.totalExpenses ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{Math.abs(((monthTotalExpenses - projections.prevMonthStats.totalExpenses) / projections.prevMonthStats.totalExpenses) * 100).toFixed(1)}% vs Mês Passado</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full">
              <ArrowDownCircle size={24} />
            </div>
          </div>
        </div>

        {/* Saldo Atual */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual em Conta</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {formatCurrency(data?.currentAccountBalance || 0)}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seção de Metas, Progresso Financeiro e Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna da Esquerda: Saúde do Orçamento e Taxa de Poupança */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Indicador de Saúde de Gastos */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                    Saúde do Orçamento
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Consumo do limite planejado para o mês
                  </p>
                </div>
              </div>

              {plannedBudget > 0 && (
                <button
                  onClick={() => onOpenSettings?.('finance')}
                  className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Ajustar teto de gastos"
                >
                  <Sliders size={13} />
                  <span>Ajustar</span>
                </button>
              )}
            </div>

            {plannedBudget > 0 ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {budgetPct}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">
                      utilizado
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    budgetRatio >= 1
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                      : budgetRatio >= 0.8
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}>
                    {budgetRatio >= 1 ? (
                      <>
                        <AlertTriangle size={12} />
                        Limite Excedido
                      </>
                    ) : budgetRatio >= 0.8 ? (
                      <>
                        <AlertTriangle size={12} />
                        Atenção (&gt;80%)
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} />
                        Dentro da Meta
                      </>
                    )}
                  </span>
                </div>

                {/* Barra de Progresso do Orçamento Geral */}
                <div className="w-full bg-gray-100 dark:bg-zinc-950 rounded-full h-3 overflow-hidden p-0.5 border border-gray-100 dark:border-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetRatio >= 1
                        ? 'bg-gradient-to-r from-red-500 to-rose-600'
                        : budgetRatio >= 0.8
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${Math.min(budgetRatio * 100, 100)}%` }}
                  ></div>
                </div>

                {/* Detalhes de Valores */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-gray-50 dark:bg-zinc-950/60 p-2.5 rounded-lg border border-transparent dark:border-zinc-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Gasto Atual</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {formatCurrency(monthTotalExpenses)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-950/60 p-2.5 rounded-lg text-right border border-transparent dark:border-zinc-800/50">
                    <p className="text-gray-500 dark:text-gray-400">
                      {remainingBudget >= 0 ? 'Disponível no Teto' : 'Valor Excedido'}
                    </p>
                    <p className={`font-semibold mt-0.5 ${
                      remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(Math.abs(remainingBudget))}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 text-center space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Você ainda não definiu um teto de gastos mensal para monitorar o seu progresso.
                </p>
                <button
                  onClick={() => onOpenSettings?.('finance')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Definir Limite de Gastos
                </button>
              </div>
            )}
          </div>

          {/* Card: Taxa de Poupança / Retenção */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <PiggyBank size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                    Taxa de Retenção & Poupança
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Superávit e alocação de investimentos do mês
                  </p>
                </div>
              </div>

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                savingsRate >= 30
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : savingsRate >= 15
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                    : savingsRate > 0
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
              }`}>
                {savingsRate >= 30 ? 'Superávit Forte' : savingsRate >= 15 ? 'Poupança Saudável' : savingsRate > 0 ? 'Saldo Positivo' : 'Déficit no Mês'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-extrabold ${
                    savingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {savingsRate > 0 ? `${savingsRate.toFixed(1)}%` : savingsRate < 0 ? `-${Math.abs(savingsRate).toFixed(1)}%` : '0%'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {savingsRate >= 0 ? 'da renda total retida' : 'gasto além da renda'}
                  </span>
                </div>
              </div>

              {/* Barra de Distribuição da Renda: Gastos vs Aportes vs Reserva Líquida */}
              <div className="space-y-1.5">
                <div className="w-full bg-gray-100 dark:bg-zinc-950 rounded-full h-3 overflow-hidden flex">
                  {/* Gastos */}
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                    title={`Gastos: ${Math.min(expenseRatio, 100).toFixed(1)}%`}
                  ></div>

                  {/* Aportes / Metas de Investimentos */}
                  {totalMonthlyInvestments > 0 && monthTotalIncome > 0 && (
                    <div
                      className="bg-purple-500 dark:bg-purple-400 h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (totalMonthlyInvestments / monthTotalIncome) * 100,
                          Math.max(0, 100 - Math.min(expenseRatio, 100))
                        )}%`
                      }}
                      title={`Aportes: ${((totalMonthlyInvestments / monthTotalIncome) * 100).toFixed(1)}%`}
                    ></div>
                  )}

                  {/* Saldo Líquido Livre */}
                  {savingsRate > 0 && netSavings > totalMonthlyInvestments && (
                    <div
                      className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          0,
                          savingsRate - (monthTotalIncome > 0 ? (totalMonthlyInvestments / monthTotalIncome) * 100 : 0)
                        )}%`
                      }}
                      title={`Reserva Livre: ${(
                        savingsRate - (monthTotalIncome > 0 ? (totalMonthlyInvestments / monthTotalIncome) * 100 : 0)
                      ).toFixed(1)}%`}
                    ></div>
                  )}
                </div>

                <div className="flex flex-wrap justify-between text-[11px] text-gray-500 dark:text-gray-400 px-0.5 gap-y-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                    Gastos ({Math.min(expenseRatio, 100).toFixed(0)}%)
                  </span>

                  {totalMonthlyInvestments > 0 && monthTotalIncome > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"></span>
                      Aportes ({((totalMonthlyInvestments / monthTotalIncome) * 100).toFixed(0)}%)
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                    Retido ({Math.max(0, savingsRate).toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Grid de Detalhamento Unificado */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-gray-50 dark:bg-zinc-950/60 p-2 rounded-lg text-center border border-transparent dark:border-zinc-800/50">
                  <p className="text-gray-500 dark:text-gray-400 text-[10px]">Economia no Mês</p>
                  <p className={`font-bold mt-0.5 text-xs ${
                    netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {netSavings >= 0 ? `+${formatCurrency(netSavings)}` : formatCurrency(netSavings)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-950/60 p-2 rounded-lg text-center border border-transparent dark:border-zinc-800/50">
                  <p className="text-gray-500 dark:text-gray-400 text-[10px]">Metas de Aporte</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5 text-xs">
                    {formatCurrency(totalMonthlyInvestments)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-950/60 p-2 rounded-lg text-center border border-transparent dark:border-zinc-800/50">
                  <p className="text-gray-500 dark:text-gray-400 text-[10px]">Total Investido</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5 text-xs">
                    {formatCurrency(totalInvestmentsBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Orçamento por Categoria */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 rounded-lg">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                    Orçamento por Categoria
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {categoryBudgets.length > 0
                      ? `${categoryBudgets.length} categoria${categoryBudgets.length > 1 ? 's com teto' : ' com teto'} no mês`
                      : 'Limites definidos por categoria'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenCategoryBudgets}
                className="text-xs font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/50 dark:hover:bg-pink-900/50 transition-colors cursor-pointer"
              >
                {categoryBudgets.length === 0 ? 'Configurar' : 'Editar'}
              </button>
            </div>

            {categoryBudgets.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 text-center space-y-3">
                <div className="p-3 bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 rounded-full w-fit mx-auto">
                  <Target size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Nenhum limite por categoria cadastrado</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                    Defina limites específicos para alimentação, transporte, lazer e acompanhe seu consumo diário.
                  </p>
                </div>
                <button
                  onClick={onOpenCategoryBudgets}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  Cadastrar Orçamentos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBudgets.map(b => {
                  const cat = categoryConfig[b.category] || categoryConfig['outros'];
                  const spent = categoryUsage?.[b.category] || 0;
                  const ratio = b.amount > 0 ? spent / b.amount : 0;
                  const catRemaining = b.amount - spent;

                  return (
                    <div
                      key={b.category}
                      className="p-3 rounded-lg bg-gray-50/80 dark:bg-zinc-950/60 border border-gray-100 dark:border-zinc-800/60 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {cat.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            ratio >= 1
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                              : ratio >= 0.8
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {(ratio * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {formatCurrency(spent)} <span className="text-gray-400 dark:text-gray-500 font-normal">/ {formatCurrency(b.amount)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Barra de Progresso da Categoria */}
                      <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            ratio >= 1
                              ? 'bg-red-500 dark:bg-red-400'
                              : ratio >= 0.8
                                ? 'bg-amber-500 dark:bg-amber-400'
                                : 'bg-emerald-500 dark:bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        <span>{ratio >= 1 ? 'Limite atingido' : 'Dentro do limite'}</span>
                        <span className={catRemaining < 0 ? 'text-red-500 font-medium' : ''}>
                          {catRemaining >= 0 ? `${formatCurrency(catRemaining)} restante` : `${formatCurrency(Math.abs(catRemaining))} excedido`}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {totalCategoryBudget > 0 && plannedBudget > 0 && totalCategoryBudget > plannedBudget && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <p>
                      A soma dos orçamentos por categoria (<strong>{formatCurrency(totalCategoryBudget)}</strong>) ultrapassa o limite planejado de gastos mensal (<strong>{formatCurrency(plannedBudget)}</strong>).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

