// Quanto foi gasto em cada categoria no mês atual, para comparar com os
// orçamentos por categoria (envelopes). Segue as mesmas regras de
// fixo/variável/parcelas usadas em projections.js e filters.js, mas soma por
// categoria em vez de um total único. Faturas com itens (`items[]`) têm seu
// valor rateado proporcionalmente entre as categorias dos itens.
export function computeCategoryUsage(data, projections) {
  const usage = {};
  if (!data || !projections) return usage;

  const { currentYear, currentMonth } = projections;
  const add = (category, amount) => {
    if (!amount) return;
    usage[category] = (usage[category] || 0) + amount;
  };

  (data.expenses || []).forEach(exp => {
    let ey = currentYear;
    let em = currentMonth + 1;
    if (exp.date) {
      const parts = exp.date.split('-');
      ey = Number(parts[0]) || currentYear;
      em = Number(parts[1]) || (currentMonth + 1);
    }
    const msp = (currentYear - ey) * 12 + (currentMonth - (em - 1));
    const inst = exp.installments || 1;

    let included = 0;
    if (exp.type === 'fixed') {
      if (inst > 1) {
        if (msp >= 0 && msp < inst) included = exp.amount / inst;
      } else if (msp >= 0) {
        included = exp.amount;
      }
    } else if (msp >= 0 && msp < inst) {
      included = exp.amount / inst;
    }

    if (!included) return;

    const items = exp.items || [];
    if (items.length > 0 && exp.amount > 0) {
      items.forEach(it => add(it.category, included * (it.amount / exp.amount)));
    } else {
      add(exp.category, included);
    }
  });

  return usage;
}
