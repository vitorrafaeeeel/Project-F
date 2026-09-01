import { memo } from 'react';
import {
  Target, Plus, Edit, Trash2, Coins, CheckCircle2,
  AlertTriangle, Calendar, Sparkles, TrendingUp, PiggyBank,
  ShieldCheck, Plane, Home, Car, GraduationCap, Laptop
} from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';
import { calculateGoalStats, calculateGoalsOverview, GOAL_CATEGORIES } from '../../../entities/finance/lib/goals.js';

const CATEGORY_ICONS = {
  reserva: ShieldCheck,
  viagem: Plane,
  imovel: Home,
  veiculo: Car,
  educacao: GraduationCap,
  eletronicos: Laptop,
  outros: Target
};

export const GoalsSection = memo(({
  goals = [],
  financialStats = {},
  onNewGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenDeposit
}) => {
  const {
    netSavings = 0,
    totalInvestmentsBalance = 0,
    totalInvestmentMonthly = 0
  } = financialStats;

  const overview = calculateGoalsOverview(goals, financialStats);

  return (
    <div className="space-y-6 w-full">
      {/* 1. Métricas Globais das Metas & Carteira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total em Metas */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total em Metas</p>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            {formatCurrency(overview.totalTarget)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
            <Target size={13} className="text-blue-500 shrink-0" />
            <span>{overview.goalsCount} objetivo{overview.goalsCount !== 1 ? 's' : ''} ({overview.activeCount} ativo{overview.activeCount !== 1 ? 's' : ''})</span>
          </p>
        </div>

        {/* Total Acumulado / Patrimônio Investido */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Acumulado</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(overview.totalCurrent)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
            <PiggyBank size={13} className="text-emerald-500 shrink-0" />
            <span>Patrimônio investido: <strong>{formatCurrency(totalInvestmentsBalance)}</strong></span>
          </p>
        </div>

        {/* Aporte Mensal Necessário Total */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aportes Necessários</p>
          <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(overview.totalMonthlyRequired)}
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500"> /mês</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 truncate">
            {totalInvestmentMonthly > 0
              ? `${formatCurrency(totalInvestmentMonthly)}/mês já em investimentos`
              : 'Compromisso mensal total'}
          </p>
        </div>

        {/* Sobra Líquida vs Viabilidade Global */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sobra do Orçamento</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${
            overview.overallDiffFromSavings >= 0 || overview.isCoveredByInvestments
              ? 'text-emerald-600 dark:text-emerald-400'
              : netSavings > 0
                ? 'text-amber-500'
                : 'text-rose-500'
          }`}>
            {formatCurrency(netSavings)}
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500"> /mês</span>
          </h3>
          <p className={`text-xs mt-1.5 font-medium truncate ${
            overview.overallDiffFromSavings >= 0 || overview.isCoveredByInvestments
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {overview.overallViability.label}
          </p>
        </div>
      </div>

      {/* 2. Cabeçalho da Seção com Botão de Criação */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800/60 p-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Simulador de Metas & Objetivos com Prazo
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Projeções com abatimento automático do patrimônio investido, juros compostos e validação de fluxo de caixa.
            </p>
          </div>

          <button
            type="button"
            onClick={onNewGoal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Plus size={16} />
            <span>Novo Objetivo</span>
          </button>
        </div>

        {/* Lista de Metas ou Estado Vazio */}
        {goals.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/30 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Target size={28} />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Nenhum objetivo cadastrado
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
                Descubra quanto você precisa poupar mensalmente considerando seu patrimônio investido atual de <strong>{formatCurrency(totalInvestmentsBalance)}</strong> e seus aportes já programados.
              </p>
            </div>
            <button
              type="button"
              onClick={onNewGoal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Plus size={16} />
              <span>Simular Meu Primeiro Objetivo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goals.map(goal => {
              const stats = calculateGoalStats(goal, financialStats);

              const catInfo = GOAL_CATEGORIES[goal.category] || GOAL_CATEGORIES['outros'];
              const IconComponent = CATEGORY_ICONS[goal.category] || Target;

              return (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-zinc-950 rounded-xl p-5 border border-gray-100 dark:border-zinc-800/60 shadow-sm transition-all flex flex-col justify-between group hover:border-gray-200 dark:hover:border-zinc-700"
                >
                  {/* Topo do Card: Categoria, Título e Viabilidade */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                          <IconComponent size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {catInfo.label}
                          </span>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                            {goal.title || goal.name}
                          </h4>
                        </div>
                      </div>

                      {/* Badge de Viabilidade */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${stats.viability.badgeClass}`}>
                        {stats.isCompleted ? (
                          <>
                            <CheckCircle2 size={12} />
                            Concluído
                          </>
                        ) : stats.viability.isViable ? (
                          <>
                            <CheckCircle2 size={12} />
                            {stats.viability.label}
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={12} />
                            {stats.viability.label}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Barra de Progresso e Percentual */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {stats.progressPct.toFixed(0)}% <span className="font-medium text-gray-500 dark:text-gray-400">concluído</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          <strong>{formatCurrency(stats.currentAmount)}</strong> / {formatCurrency(stats.targetAmount)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 dark:bg-zinc-900 rounded-full h-3 overflow-hidden p-0.5 border border-gray-100 dark:border-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stats.isCompleted
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{ width: `${Math.min(stats.progressPct, 100)}%` }}
                        ></div>
                      </div>

                      {!stats.hasExplicitCurrent && stats.currentAmount > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5">
                          <PiggyBank size={11} />
                          <span>Abatendo {formatCurrency(stats.currentAmount)} da carteira de investimentos</span>
                        </p>
                      )}
                    </div>

                    {/* Bloco de Simulação de Aporte & Prazo */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="p-2.5 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-transparent dark:border-zinc-800/40">
                        <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500">Aporte Necessário</p>
                        <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                          {formatCurrency(stats.monthlyContribution)}
                          <span className="text-xs font-normal text-gray-400 dark:text-gray-500"> /mês</span>
                        </p>
                        {stats.compoundInterestBonus > 0 ? (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-0.5 truncate">
                            <TrendingUp size={10} />
                            <span>+{formatCurrency(stats.compoundInterestBonus)} em juros</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {stats.isCompleted ? 'Objetivo atingido' : `Faltam ${formatCurrency(stats.remainingAmount)}`}
                          </p>
                        )}
                      </div>

                      <div className="p-2.5 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-transparent dark:border-zinc-800/40">
                        <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500">Prazo Estimado</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{stats.deadlineMonths} meses</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                          {stats.completionDate.formatted}
                        </p>
                      </div>
                    </div>

                    {/* Detalhe de Viabilidade Explicativa */}
                    <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                      stats.isCompleted || stats.viability.isViable
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
                    }`}>
                      {stats.isCompleted || stats.viability.isViable ? (
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      )}
                      <span className="leading-snug">{stats.viability.message}</span>
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => onOpenDeposit?.(goal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
                      title="Adicionar valor economizado a esta meta"
                    >
                      <Coins size={14} />
                      <span>Aportar</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditGoal?.(goal)}
                        className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                        title="Editar Meta"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteGoal?.(goal.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Meta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
