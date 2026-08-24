import { getTodayDate } from '../../../shared/lib/date.js';

// Efetivação de transações agendadas cuja data já chegou.
export function computeAutoSettledPatch(data) {
  const today = getTodayDate();
  let needsUpdate = false;
  let updatedBalance = data.currentAccountBalance || 0;

  const updatedIncomes = (data.extraIncomes || []).map(inc => {
    if (inc.appliedToBalance === false && inc.date <= today) {
      updatedBalance += inc.amount; needsUpdate = true; return { ...inc, appliedToBalance: true };
    }
    return inc;
  });

  const updatedExpenses = (data.expenses || []).map(exp => {
    if (exp.deductedFromBalance && exp.appliedToBalance === false && exp.date <= today) {
      updatedBalance -= exp.amount; needsUpdate = true; return { ...exp, appliedToBalance: true };
    }
    return exp;
  });

  if (!needsUpdate) return null;
  return { currentAccountBalance: updatedBalance, extraIncomes: updatedIncomes, expenses: updatedExpenses };
}
