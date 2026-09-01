import { memo } from 'react';
import { ArrowRight, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';
import { calculateGoalStats } from '../../../entities/finance/lib/goals.js';

export const DashboardGoalCard = memo(({
  goals = [],
  financialStats = {},
  onOpenNewGoal,
  onOpenGoalsTab
}) => {
  // Seleciona a meta prioritária ativa (primeira não concluída, ou a primeira da lista)
  const primaryGoal = goals.find(g => (g.currentAmount || 0) < (g.targetAmount || 0)) || goals[0] || null;

  const stats = primaryGoal ? calculateGoalStats(primaryGoal, financialStats) : null;

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
            Meta & Objetivo Principal
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {primaryGoal ? (primaryGoal.title || primaryGoal.name) : 'Acompanhamento do objetivo em andamento'}
          </p>
        </div>

        {primaryGoal ? (
          <button
            type="button"
            onClick={onOpenGoalsTab}
            className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
            title="Ver todas as metas no simulador"
          >
            <span>{goals.length > 1 ? `Ver Todas (${goals.length})` : 'Simulador'}</span>
            <ArrowRight size={13} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenNewGoal}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            + Nova Meta
          </button>
        )}
      </div>

      {stats ? (
        <div className="space-y-4">
          {/* Indicador de Percentual e Status */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats.progressPct.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">
                concluído
              </span>
            </div>

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              stats.isCompleted
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : stats.viability.isViable
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
            }`}>
              {stats.isCompleted ? (
                <>
                  <CheckCircle2 size={12} />
                  Concluído
                </>
              ) : stats.viability.isViable ? (
                <>
                  <CheckCircle2 size={12} />
                  Meta Viável
                </>
              ) : (
                <>
                  <AlertTriangle size={12} />
                  Excede Sobra
                </>
              )}
            </span>
          </div>

          {/* Barra de Progresso Minimalista */}
          <div className="w-full bg-gray-100 dark:bg-zinc-900 rounded-full h-3 overflow-hidden p-0.5 border border-gray-100 dark:border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
              style={{ width: `${Math.min(stats.progressPct, 100)}%` }}
            />
          </div>

          {/* Detalhes de Valores em Grid 2 colunas como o Orçamento Geral */}
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-gray-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-transparent dark:border-zinc-800/40">
              <p className="text-gray-500 dark:text-gray-400">Acumulado / Alvo</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(stats.currentAmount)} <span className="text-gray-400 dark:text-gray-500 font-normal">/ {formatCurrency(stats.targetAmount)}</span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-900/50 p-2.5 rounded-lg text-right border border-transparent dark:border-zinc-800/40">
              <p className="text-gray-500 dark:text-gray-400">Aporte Necessário</p>
              <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {formatCurrency(stats.monthlyContribution)} <span className="text-gray-400 dark:text-gray-500 font-normal">/mês ({stats.deadlineMonths}m)</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 text-center space-y-3">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Você ainda não cadastrou um objetivo com prazo para acompanhar seu progresso.
          </p>
          <button
            type="button"
            onClick={onOpenNewGoal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Simular Objetivo
          </button>
        </div>
      )}
    </div>
  );
});
