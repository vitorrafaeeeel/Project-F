export function computeProjections(data) {
  if (!data) return null;
  const totalInvestmentMonthly = (data.investments || []).reduce((acc, curr) => acc + curr.monthlyAmount, 0);
  let currentAccumulatedBalance = data.currentAccountBalance || 0;
  let runningInvestments = (data.investments || []).map(inv => ({ ...inv }));

  const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  let prevFixedExpenses = 0, prevVariableExpenses = 0;

  (data.expenses || []).forEach(exp => {
    const [ey, em] = exp.date ? exp.date.split('-').map(Number) : [prevYear, prevMonth + 1];
    const monthsSincePurchase = (prevYear - ey) * 12 + (prevMonth - (em - 1));
    const inst = exp.installments || 1;
    if (exp.type === 'fixed') {
      if (inst > 1) { if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) prevFixedExpenses += (exp.amount / inst); }
      else prevFixedExpenses += exp.amount;
    } else {
      if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) prevVariableExpenses += (exp.amount / inst);
    }
  });

  const timeline = [];
  let currentMonthStats = null;
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyExpensesRaw = Array(daysInCurrentMonth).fill(0);

  for (let i = 0; i < 12; i++) {
    const monthIdx = (currentMonth + i) % 12;
    const year = currentYear + Math.floor((currentMonth + i) / 12);

    let monthExtraIncome = 0;
    (data.extraIncomes || []).forEach(inc => {
      if (!inc.date) return;
      const [iy, im] = inc.date.split('-').map(Number);
      if (iy === year && (im - 1) === monthIdx) monthExtraIncome += inc.amount;
    });
    const monthTotalIncome = (data.income || 0) + monthExtraIncome;

    let monthFixedExpenses = 0, monthVariableExpenses = 0, expensesAlreadyDeducted = 0;

    (data.expenses || []).forEach(exp => {
      const [ey, em, ed] = exp.date ? exp.date.split('-').map(Number) : [currentYear, currentMonth + 1, 1];
      const monthsSincePurchase = (year - ey) * 12 + (monthIdx - (em - 1));
      const inst = exp.installments || 1;

      if (exp.type === 'fixed') {
        if (inst > 1) {
          if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) {
            const instAmt = exp.amount / inst; monthFixedExpenses += instAmt;
            if (i === 0 && exp.deductedFromBalance && monthsSincePurchase === 0 && (exp.appliedToBalance === true || exp.appliedToBalance === undefined)) expensesAlreadyDeducted += instAmt;
            if (i === 0) dailyExpensesRaw[Math.min(ed, daysInCurrentMonth) - 1] += instAmt;
          }
        } else {
          monthFixedExpenses += exp.amount;
          if (i === 0 && exp.deductedFromBalance && monthsSincePurchase === 0 && (exp.appliedToBalance === true || exp.appliedToBalance === undefined)) expensesAlreadyDeducted += exp.amount;
          if (i === 0 && monthsSincePurchase === 0) dailyExpensesRaw[Math.min(ed, daysInCurrentMonth) - 1] += exp.amount;
        }
      } else {
        if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) {
          const instAmt = exp.amount / inst; monthVariableExpenses += instAmt;
          if (i === 0 && exp.deductedFromBalance && monthsSincePurchase === 0 && (exp.appliedToBalance === true || exp.appliedToBalance === undefined)) expensesAlreadyDeducted += instAmt;
          if (i === 0) dailyExpensesRaw[Math.min(ed, daysInCurrentMonth) - 1] += instAmt;
        }
      }
    });

    const monthTotalExpenses = monthFixedExpenses + monthVariableExpenses;
    let projectedExpenses = i > 0 ? Math.max(monthTotalExpenses, data.plannedBudget || 0) : monthTotalExpenses;

    let appliedMonthlyBalance = 0;
    if (i === 0) {
      appliedMonthlyBalance = monthTotalIncome - monthTotalExpenses;
      currentAccumulatedBalance = data.currentAccountBalance || 0;
    } else {
      appliedMonthlyBalance = monthTotalIncome - projectedExpenses - totalInvestmentMonthly;
      currentAccumulatedBalance += appliedMonthlyBalance;
    }

    let monthTotalInvestments = 0;
    runningInvestments = runningInvestments.map(inv => {
      let newBalance = i === 0 ? inv.currentBalance * (1 + inv.interestRate) : (inv.currentBalance * (1 + inv.interestRate)) + inv.monthlyAmount;
      monthTotalInvestments += newBalance; return { ...inv, currentBalance: newBalance };
    });

    const point = { label: `${monthsNames[monthIdx]}/${year.toString().slice(-2)}`, netBalance: currentAccumulatedBalance, totalInvestments: monthTotalInvestments, totalAssets: monthTotalInvestments, appliedMonthlyBalance, monthTotalIncome, monthExtraIncome, monthFixedExpenses, monthVariableExpenses, monthTotalExpenses };
    timeline.push(point);
    if (i === 0) currentMonthStats = point;
  }

  return {
    totalInvestmentMonthly, currentMonthStats, prevMonthStats: { totalExpenses: prevFixedExpenses + prevVariableExpenses },
    dailySpending: dailyExpensesRaw.map((val, idx) => ({ day: idx + 1, amount: val })), timeline,
    currentMonth, currentYear, daysInCurrentMonth
  };
}
