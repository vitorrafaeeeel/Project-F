const NON_CATEGORY_FILTERS = ['all', 'fixed', 'variable'];

export function computeFilteredExpenses(expenses, expenseFilter) {
  if (!expenses) return [];
  if (expenseFilter === 'all') return expenses;
  if (expenseFilter === 'fixed') return expenses.filter(e => e.type === 'fixed');
  if (expenseFilter === 'variable') return expenses.filter(e => e.type === 'variable');
  if (expenseFilter === 'cartao_credito' || expenseFilter === 'credit') {
    return expenses.filter(e => e.paymentMethod === 'credit' || e.category === 'cartao_credito' || (e.items || []).some(it => it.category === 'cartao_credito'));
  }
  return expenses.filter(e => e.category === expenseFilter || (e.items || []).some(it => it.category === expenseFilter));
}

// Quando o filtro é uma categoria e o gasto é uma fatura com itens, soma só a
// fatia dos itens daquela categoria — não o valor total da fatura (exceto para cartão de crédito onde soma a fatura inteira).
export function computeFilteredImpact(filteredExpenses, projections, expenseFilter = 'all') {
  let impact = 0;
  if (!projections) return 0;
  const isCategoryFilter = !NON_CATEGORY_FILTERS.includes(expenseFilter) && expenseFilter !== 'cartao_credito' && expenseFilter !== 'credit';
  filteredExpenses.forEach(exp => {
      const [ey, em] = exp.date ? exp.date.split('-').map(Number) : [projections.currentYear, projections.currentMonth + 1];
      const msp = (projections.currentYear - ey) * 12 + (projections.currentMonth - (em - 1));
      const inst = exp.installments || 1;
      const hasItems = (exp.items || []).length > 0;
      const baseAmount = isCategoryFilter && hasItems
        ? exp.items.filter(it => it.category === expenseFilter).reduce((acc, it) => acc + (it.amount || 0), 0)
        : exp.amount;
      if (exp.type === 'fixed') {
           if (inst > 1) { if (msp >= 0 && msp < inst) impact += (baseAmount / inst); }
           else impact += baseAmount;
      } else if (msp >= 0 && msp < inst) impact += (baseAmount / inst);
  });
  return impact;
}
