export function computeFilteredExpenses(expenses, expenseFilter) {
  if (!expenses) return [];
  if (expenseFilter === 'all') return expenses;
  if (expenseFilter === 'credit') return expenses.filter(e => e.paymentMethod === 'credit');
  if (expenseFilter === 'fixed') return expenses.filter(e => e.type === 'fixed');
  if (expenseFilter === 'variable') return expenses.filter(e => e.type === 'variable');
  return expenses.filter(e => e.category === expenseFilter);
}

export function computeFilteredImpact(filteredExpenses, projections) {
  let impact = 0;
  if (!projections) return 0;
  filteredExpenses.forEach(exp => {
      const [ey, em] = exp.date ? exp.date.split('-').map(Number) : [projections.currentYear, projections.currentMonth + 1];
      const msp = (projections.currentYear - ey) * 12 + (projections.currentMonth - (em - 1));
      const inst = exp.installments || 1;
      if (exp.type === 'fixed') {
           if (inst > 1) { if (msp >= 0 && msp < inst) impact += (exp.amount / inst); }
           else impact += exp.amount;
      } else if (msp >= 0 && msp < inst) impact += (exp.amount / inst);
  });
  return impact;
}
