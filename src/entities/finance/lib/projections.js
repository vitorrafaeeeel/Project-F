export function computeProjections(data) {
  if (!data) return null;
  const totalInvestmentMonthly = (data.investments || []).reduce((acc, curr) => acc + (curr.monthlyAmount || 0), 0);
  let currentAccumulatedBalance = data.currentAccountBalance || 0;
  let runningInvestments = (data.investments || []).map(inv => ({ ...inv }));

  const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  let prevFixedExpenses = 0;
  let prevVariableExpenses = 0;

  // Pré-processamento O(N) para evitar split de strings e cálculos repetidos
  const parsedExpenses = (data.expenses || []).map(exp => {
    let ey = currentYear;
    let em = currentMonth + 1;
    let ed = 1;
    if (exp.date) {
      const parts = exp.date.split('-');
      ey = Number(parts[0]) || currentYear;
      em = Number(parts[1]) || (currentMonth + 1);
      ed = Number(parts[2]) || 1;
    }
    const inst = exp.installments || 1;
    const instAmt = exp.amount / inst;
    return {
      amount: exp.amount,
      type: exp.type,
      ey,
      em,
      ed,
      inst,
      instAmt,
      isFixed: exp.type === 'fixed'
    };
  });

  const parsedIncomes = (data.extraIncomes || []).map(inc => {
    let iy = currentYear;
    let im = currentMonth + 1;
    if (inc.date) {
      const parts = inc.date.split('-');
      iy = Number(parts[0]) || currentYear;
      im = Number(parts[1]) || (currentMonth + 1);
    }
    return {
      amount: inc.amount || 0,
      iy,
      im
    };
  });

  parsedExpenses.forEach(exp => {
    const monthsSincePurchase = (prevYear - exp.ey) * 12 + (prevMonth - (exp.em - 1));
    if (exp.isFixed) {
      if (exp.inst > 1) {
        if (monthsSincePurchase >= 0 && monthsSincePurchase < exp.inst) prevFixedExpenses += exp.instAmt;
      } else {
        if (monthsSincePurchase >= 0) prevFixedExpenses += exp.amount;
      }
    } else {
      if (monthsSincePurchase >= 0 && monthsSincePurchase < exp.inst) prevVariableExpenses += exp.instAmt;
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
    parsedIncomes.forEach(inc => {
      if (inc.iy === year && (inc.im - 1) === monthIdx) {
        monthExtraIncome += inc.amount;
      }
    });

    const totalFixedSalary = (data.salaries && Array.isArray(data.salaries) && data.salaries.length > 0)
      ? data.salaries.reduce((sum, s) => sum + (s.amount || 0), 0)
      : (data.income || 0);
    const monthTotalIncome = totalFixedSalary + monthExtraIncome;

    let monthFixedExpenses = 0;
    let monthVariableExpenses = 0;

    parsedExpenses.forEach(exp => {
      const monthsSincePurchase = (year - exp.ey) * 12 + (monthIdx - (exp.em - 1));

      if (exp.isFixed) {
        if (exp.inst > 1) {
          if (monthsSincePurchase >= 0 && monthsSincePurchase < exp.inst) {
            monthFixedExpenses += exp.instAmt;
            if (i === 0) dailyExpensesRaw[Math.min(exp.ed, daysInCurrentMonth) - 1] += exp.instAmt;
          }
        } else {
          if (monthsSincePurchase >= 0) {
            monthFixedExpenses += exp.amount;
            if (i === 0 && monthsSincePurchase === 0) dailyExpensesRaw[Math.min(exp.ed, daysInCurrentMonth) - 1] += exp.amount;
          }
        }
      } else {
        if (monthsSincePurchase >= 0 && monthsSincePurchase < exp.inst) {
          monthVariableExpenses += exp.instAmt;
          if (i === 0) dailyExpensesRaw[Math.min(exp.ed, daysInCurrentMonth) - 1] += exp.instAmt;
        }
      }
    });

    const monthTotalExpenses = monthFixedExpenses + monthVariableExpenses;
    const projectedExpenses = i > 0 ? Math.max(monthTotalExpenses, data.plannedBudget || 0) : monthTotalExpenses;

    const appliedMonthlyBalance = i === 0
      ? (monthTotalIncome - monthTotalExpenses)
      : (monthTotalIncome - projectedExpenses - totalInvestmentMonthly);

    if (i === 0) {
      currentAccumulatedBalance = data.currentAccountBalance || 0;
    } else {
      currentAccumulatedBalance += appliedMonthlyBalance;
    }

    let monthTotalInvestments = 0;
    runningInvestments = runningInvestments.map(inv => {
      let rate = Number(inv.interestRate) || 0;
      // Normaliza se estiver em percentual (ex: 0.8 para 0.8% a.m. ou 10 para 10%)
      if (rate > 0.15) {
        rate = rate / 100;
      }
      // Limite de segurança de rendimento mensal (max 3% ao mês)
      rate = Math.min(Math.max(rate, 0), 0.03);

      const monthly = Number(inv.monthlyAmount) || 0;
      const current = Number(inv.currentBalance) || 0;
      const newBalance = i === 0 ? current * (1 + rate) : (current * (1 + rate)) + monthly;
      monthTotalInvestments += newBalance;
      return { ...inv, currentBalance: newBalance };
    });

    const point = {
      label: `${monthsNames[monthIdx]}/${year.toString().slice(-2)}`,
      netBalance: currentAccumulatedBalance,
      totalInvestments: monthTotalInvestments,
      totalAssets: monthTotalInvestments,
      appliedMonthlyBalance,
      monthTotalIncome,
      monthExtraIncome,
      monthFixedExpenses,
      monthVariableExpenses,
      monthTotalExpenses
    };
    timeline.push(point);
    if (i === 0) currentMonthStats = point;
  }

  const totalInvestmentsBalance = (data.investments || []).reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

  return {
    totalInvestmentMonthly,
    totalInvestmentsBalance,
    currentMonthStats,
    prevMonthStats: { totalExpenses: prevFixedExpenses + prevVariableExpenses },
    dailySpending: dailyExpensesRaw.map((val, idx) => ({ day: idx + 1, amount: val })),
    timeline,
    currentMonth,
    currentYear,
    daysInCurrentMonth
  };
}

