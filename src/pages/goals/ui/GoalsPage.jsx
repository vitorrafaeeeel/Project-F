import { memo, useMemo } from 'react';
import { GoalsSection } from '../../../features/manage-goal/ui/GoalsSection.jsx';

export const GoalsPage = memo(({
  data,
  projections,
  onNewGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenDepositGoal
}) => {
  const goals = useMemo(() => data?.goals || [], [data?.goals]);

  const currentMonthStats = projections?.currentMonthStats;
  const monthTotalIncome = currentMonthStats?.monthTotalIncome || 0;
  const monthTotalExpenses = currentMonthStats?.monthTotalExpenses || 0;
  const netSavings = monthTotalIncome - monthTotalExpenses;

  const totalInvestmentsBalance = useMemo(
    () => projections?.totalInvestmentsBalance ?? (data?.investments || []).reduce((acc, inv) => acc + (inv.currentBalance || 0), 0),
    [projections?.totalInvestmentsBalance, data?.investments]
  );

  const totalInvestmentMonthly = useMemo(
    () => projections?.totalInvestmentMonthly ?? (data?.investments || []).reduce((acc, inv) => acc + (inv.monthlyAmount || 0), 0),
    [projections?.totalInvestmentMonthly, data?.investments]
  );

  const averageInterestRate = useMemo(() => {
    const invs = data?.investments || [];
    if (invs.length === 0) return 0.008;
    const totalBal = invs.reduce((acc, i) => acc + (i.currentBalance || 0), 0);
    if (totalBal > 0) {
      return invs.reduce((acc, i) => acc + ((i.currentBalance || 0) * (i.interestRate || 0.008)), 0) / totalBal;
    }
    return invs.reduce((acc, i) => acc + (i.interestRate || 0.008), 0) / invs.length;
  }, [data?.investments]);

  const financialStats = useMemo(() => ({
    monthTotalIncome,
    monthTotalExpenses,
    netSavings,
    totalInvestmentsBalance,
    totalInvestmentMonthly,
    averageInterestRate
  }), [monthTotalIncome, monthTotalExpenses, netSavings, totalInvestmentsBalance, totalInvestmentMonthly, averageInterestRate]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      <GoalsSection
        goals={goals}
        financialStats={financialStats}
        onNewGoal={onNewGoal}
        onEditGoal={onEditGoal}
        onDeleteGoal={onDeleteGoal}
        onOpenDeposit={onOpenDepositGoal}
      />
    </div>
  );
});
