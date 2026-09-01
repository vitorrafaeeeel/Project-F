import { formatCurrency } from '../../../shared/lib/currency.js';

export const GOAL_CATEGORIES = {
  reserva: { id: 'reserva', label: 'Reserva de Emergência', icon: 'ShieldCheck', color: 'emerald' },
  viagem: { id: 'viagem', label: 'Viagem & Lazer', icon: 'Plane', color: 'sky' },
  imovel: { id: 'imovel', label: 'Casa & Imóvel', icon: 'Home', color: 'indigo' },
  veiculo: { id: 'veiculo', label: 'Carro / Veículo', icon: 'Car', color: 'blue' },
  educacao: { id: 'educacao', label: 'Educação & Cursos', icon: 'GraduationCap', color: 'purple' },
  eletronicos: { id: 'eletronicos', label: 'Tecnologia & Bens', icon: 'Laptop', color: 'pink' },
  outros: { id: 'outros', label: 'Outro Objetivo', icon: 'Target', color: 'amber' }
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Calcula a data estimada de conclusão a partir de hoje + meses informados.
 */
export function getEstimatedCompletionDate(months) {
  const numMonths = Math.max(1, parseInt(months, 10) || 1);
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + numMonths, 1);
  return {
    monthName: MONTH_NAMES[targetDate.getMonth()],
    year: targetDate.getFullYear(),
    formatted: `${MONTH_NAMES[targetDate.getMonth()]} de ${targetDate.getFullYear()}`
  };
}

/**
 * Motor de cálculo financeiro integrado para objetivos, carteira de investimentos e juros compostos.
 */
export function calculateGoalStats(goal, financialStats = {}) {
  const {
    monthTotalIncome = 0,
    netSavings = 0,
    totalInvestmentsBalance = 0,
    totalInvestmentMonthly = 0,
    averageInterestRate = 0.008
  } = financialStats;

  const targetAmount = Math.max(0, Number(goal?.targetAmount) || 0);

  // Considera o valor explicitamente poupado no objetivo; se ausente/zerado, desconta o patrimônio investido na carteira
  const hasExplicitCurrent = goal?.currentAmount != null && goal?.currentAmount !== '' && Number(goal?.currentAmount) > 0;
  const currentAmount = hasExplicitCurrent
    ? Math.max(0, Number(goal.currentAmount))
    : (totalInvestmentsBalance > 0 ? totalInvestmentsBalance : 0);

  const deadlineMonths = Math.max(1, parseInt(goal?.deadlineMonths, 10) || 12);
  const isCompleted = targetAmount > 0 && currentAmount >= targetAmount;

  // Taxa de juros mensal média (limitada por segurança entre 0% e 3% a.m.)
  let rate = typeof averageInterestRate === 'number' && averageInterestRate > 0 ? averageInterestRate : 0.008;
  if (rate > 0.15) rate = rate / 100;
  rate = Math.min(Math.max(rate, 0), 0.03);

  // Projeção com juros compostos:
  // FV_inicial = PV * (1 + i)^n
  const initialFutureValue = isCompleted ? currentAmount : currentAmount * Math.pow(1 + rate, deadlineMonths);
  const remainingToTarget = Math.max(0, targetAmount - initialFutureValue);

  // Fator de acumulação mensal: ((1 + i)^n - 1) / i
  const annuityFactor = rate > 0 ? (Math.pow(1 + rate, deadlineMonths) - 1) / rate : deadlineMonths;

  // Aporte mensal necessário considerando rendimento composto sobre os aportes e sobre o saldo inicial
  const monthlyContribution = isCompleted
    ? 0
    : (remainingToTarget > 0 ? remainingToTarget / annuityFactor : 0);

  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPct = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

  // Rendimento estimado gerado pelos juros compostos
  const totalContributed = currentAmount + (monthlyContribution * deadlineMonths);
  const compoundInterestBonus = Math.max(0, targetAmount - totalContributed);

  // Integração com aportes mensais já configurados em Investimentos
  const isCoveredByCurrentInvestments = !isCompleted && totalInvestmentMonthly > 0 && totalInvestmentMonthly >= monthlyContribution;
  const additionalMonthlyNeeded = Math.max(0, monthlyContribution - totalInvestmentMonthly);

  // Prazo estimado se mantiver os aportes atuais da carteira
  let estimatedMonthsWithCurrentInvestments = deadlineMonths;
  if (totalInvestmentMonthly > 0 && targetAmount > currentAmount) {
    const num = (targetAmount * rate) + totalInvestmentMonthly;
    const den = (currentAmount * rate) + totalInvestmentMonthly;
    if (num > 0 && den > 0 && num > den) {
      estimatedMonthsWithCurrentInvestments = Math.max(1, Math.ceil(Math.log(num / den) / Math.log(1 + rate)));
    }
  }

  // Análise de viabilidade financeira e fluxo de caixa
  let viability;
  const diffFromSavings = netSavings - monthlyContribution;

  if (isCompleted) {
    viability = {
      status: 'completed',
      isViable: true,
      label: 'Meta Concluída',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      color: 'emerald',
      message: 'Parabéns! O patrimônio acumulado já cobre 100% do valor estipulado.'
    };
  } else if (isCoveredByCurrentInvestments) {
    viability = {
      status: 'covered_by_investments',
      isViable: true,
      label: 'Aporte Atual Cobre a Meta',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      color: 'emerald',
      message: `Seus aportes atuais em investimentos (${formatCurrency(totalInvestmentMonthly)}/mês) já cobrem o aporte necessário (${formatCurrency(monthlyContribution)}/mês) com juros compostos.`
    };
  } else if (netSavings <= 0) {
    viability = {
      status: 'deficit',
      isViable: false,
      label: 'Sem Sobra no Mês',
      badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      color: 'rose',
      message: 'Seus gastos mensais superam ou empatam com sua renda. Reduza despesas para liberar capacidade de aporte.'
    };
  } else if (diffFromSavings >= 0) {
    viability = {
      status: 'viable',
      isViable: true,
      label: 'Meta Viável',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      color: 'emerald',
      message: totalInvestmentMonthly > 0
        ? `Você já aporta ${formatCurrency(totalInvestmentMonthly)}/mês. Incrementando ${formatCurrency(additionalMonthlyNeeded)}/mês na sobra mensal (${formatCurrency(netSavings)}), a meta será alcançada em ${deadlineMonths} meses.`
        : `Aporte de ${formatCurrency(monthlyContribution)}/mês com juros compostos está 100% coberto pela sua sobra mensal (${formatCurrency(netSavings)}).`
    };
  } else {
    viability = {
      status: 'tight',
      isViable: false,
      label: 'Excede a Sobra Mensal',
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      color: 'amber',
      message: `O aporte necessário excede sua sobra líquida em ${formatCurrency(Math.abs(diffFromSavings))}/mês. Considere estender o prazo para ${estimatedMonthsWithCurrentInvestments} meses.`
    };
  }

  const capacityImpactPct = netSavings > 0 ? (monthlyContribution / netSavings) * 100 : 0;
  const incomeImpactPct = monthTotalIncome > 0 ? (monthlyContribution / monthTotalIncome) * 100 : 0;
  const completionDate = getEstimatedCompletionDate(deadlineMonths);
  const paceCompletionDate = getEstimatedCompletionDate(estimatedMonthsWithCurrentInvestments);

  return {
    ...goal,
    targetAmount,
    currentAmount,
    hasExplicitCurrent,
    deadlineMonths,
    remainingAmount,
    monthlyContribution,
    initialFutureValue,
    compoundInterestBonus,
    rate,
    isCoveredByCurrentInvestments,
    additionalMonthlyNeeded,
    estimatedMonthsWithCurrentInvestments,
    paceCompletionDate,
    progressPct,
    isCompleted,
    viability,
    diffFromSavings,
    capacityImpactPct,
    incomeImpactPct,
    completionDate
  };
}

/**
 * Motor de cálculo agregado para múltiplos objetivos com integração de investimentos.
 */
export function calculateGoalsOverview(goals = [], financialStats = {}) {
  const {
    netSavings = 0,
    totalInvestmentsBalance = 0,
    totalInvestmentMonthly = 0
  } = financialStats;

  const calculatedItems = (goals || []).map(g => calculateGoalStats(g, financialStats));

  const totalTarget = calculatedItems.reduce((acc, g) => acc + g.targetAmount, 0);

  // Total acumulado considera o patrimônio investido na carteira caso não haja metas com saldo explícito superior
  const sumExplicitGoalsCurrent = calculatedItems.reduce((acc, g) => acc + (g.hasExplicitCurrent ? g.currentAmount : 0), 0);
  const totalCurrent = Math.max(sumExplicitGoalsCurrent, totalInvestmentsBalance);

  const totalRemaining = Math.max(0, totalTarget - totalCurrent);
  const totalMonthlyRequired = calculatedItems.reduce((acc, g) => acc + g.monthlyContribution, 0);

  const activeGoals = calculatedItems.filter(g => !g.isCompleted);
  const completedGoals = calculatedItems.filter(g => g.isCompleted);

  const overallProgressPct = totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;
  const overallDiffFromSavings = netSavings - totalMonthlyRequired;

  const isCoveredByInvestments = totalMonthlyRequired > 0 && totalInvestmentMonthly >= totalMonthlyRequired;

  let overallViability;
  if (calculatedItems.length === 0) {
    overallViability = {
      status: 'empty',
      isViable: true,
      label: 'Sem Metas',
      message: 'Nenhum objetivo cadastrado no momento.'
    };
  } else if (activeGoals.length === 0) {
    overallViability = {
      status: 'completed',
      isViable: true,
      label: 'Todas as Metas Atingidas',
      message: 'Todas as metas cadastradas foram alcançadas com sucesso!'
    };
  } else if (isCoveredByInvestments) {
    overallViability = {
      status: 'covered_by_investments',
      isViable: true,
      label: 'Aportes em Investimentos Cobrem as Metas',
      message: `Seus aportes programados (${formatCurrency(totalInvestmentMonthly)}/mês) cobrem a soma dos aportes das metas (${formatCurrency(totalMonthlyRequired)}/mês).`
    };
  } else if (netSavings <= 0) {
    overallViability = {
      status: 'deficit',
      isViable: false,
      label: 'Déficit no Fluxo',
      message: 'Sua capacidade de poupança atual está zerada ou negativa.'
    };
  } else if (overallDiffFromSavings >= 0) {
    overallViability = {
      status: 'viable',
      isViable: true,
      label: 'Planejamento 100% Viável',
      message: `A soma de todos os aportes (${formatCurrency(totalMonthlyRequired)}/mês) cabe na sua sobra líquida (${formatCurrency(netSavings)}/mês).`
    };
  } else {
    overallViability = {
      status: 'tight',
      isViable: false,
      label: 'Aportes Totais Excedem Sobra',
      message: `O conjunto de metas exige ${formatCurrency(totalMonthlyRequired)}/mês, ultrapassando sua sobra líquida em ${formatCurrency(Math.abs(overallDiffFromSavings))}.`
    };
  }

  return {
    items: calculatedItems,
    activeGoals,
    completedGoals,
    totalTarget,
    totalCurrent,
    totalRemaining,
    totalMonthlyRequired,
    totalInvestmentMonthly,
    totalInvestmentsBalance,
    isCoveredByInvestments,
    overallProgressPct,
    overallDiffFromSavings,
    overallViability,
    goalsCount: calculatedItems.length,
    activeCount: activeGoals.length,
    completedCount: completedGoals.length
  };
}
