export function computeCalendarData(data, projections, calendarOffset) {
  if (!data || !projections) return { grid: [], monthName: '', year: '' };
  const monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const targetMonthRaw = projections.currentMonth + calendarOffset;
  const targetMonth = targetMonthRaw % 12;
  const targetYear = projections.currentYear + Math.floor(targetMonthRaw / 12);
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(targetYear, targetMonth, 1).getDay();

  const eventsByDay = {};
  const addEvent = (d, ev) => { const sd = Math.min(d, daysInMonth); if (!eventsByDay[sd]) eventsByDay[sd] = []; eventsByDay[sd].push(ev); };

  (data.extraIncomes || []).forEach(inc => {
      if (!inc.date) return; const [iy, im, id] = inc.date.split('-').map(Number);
      if (iy === targetYear && (im - 1) === targetMonth) addEvent(id, { type: 'income', desc: inc.desc, amount: inc.amount, raw: inc });
  });

  (data.expenses || []).forEach(exp => {
      if (!exp.date) return; const [ey, em, ed] = exp.date.split('-').map(Number);
      const msp = (targetYear - ey) * 12 + (targetMonth - (em - 1));
      const inst = exp.installments || 1;
      if (exp.type === 'fixed') {
          if (inst > 1) { if (msp >= 0 && msp < inst) addEvent(ed, { type: 'expense', desc: exp.desc, amount: exp.amount / inst, raw: exp }); }
          else { if (msp >= 0) addEvent(ed, { type: 'expense', desc: exp.desc, amount: exp.amount, raw: exp }); }
      } else {
          if (msp >= 0 && msp < inst) addEvent(ed, { type: 'expense', desc: exp.desc, amount: exp.amount / inst, raw: exp });
      }
  });

  const grid = [];
  for (let i = 0; i < firstDayOfWeek; i++) grid.push({ day: null, events: [] });
  for (let day = 1; day <= daysInMonth; day++) grid.push({ day, events: eventsByDay[day] || [] });

  return { grid, monthName: monthsNames[targetMonth], year: targetYear };
}
