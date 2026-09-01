import { memo } from 'react';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';

export const CalendarPage = memo(({ calendarData, calendarOffset, setCalendarOffset, setEditExpenseModal, setEditIncomeModal }) => {
  const today = new Date();
  const isCurrentMonthView = (calendarData.targetYear === today.getFullYear() && calendarData.targetMonth === today.getMonth()) || calendarOffset === 0;

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800/60 overflow-hidden transition-colors p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Calendário Financeiro
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Visualize entradas, saídas e lançamentos diários ao longo do tempo
          </p>
        </div>

        <div className="flex items-center gap-2">
          {calendarOffset !== 0 && (
            <button
              onClick={() => setCalendarOffset(0)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
              title="Voltar para o mês atual"
            >
              Mês Atual
            </button>
          )}

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900/50 p-1.5 rounded-lg border border-gray-100 dark:border-zinc-800/60">
            <button
              onClick={() => setCalendarOffset(calendarOffset - 1)}
              className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-sm text-gray-800 dark:text-white min-w-[140px] text-center uppercase tracking-wide">
              {calendarData.monthName} {calendarData.year}
            </span>
            <button
              onClick={() => setCalendarOffset(calendarOffset + 1)}
              className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
        <div className="min-w-[520px] sm:min-w-0 grid grid-cols-7 gap-px bg-gray-200 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800/60 rounded-lg overflow-hidden">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="bg-gray-50 dark:bg-zinc-900 text-center py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{day}</div>
          ))}
        {calendarData.grid.map((cell, idx) => {
          let dailyIncome = 0, dailyExpense = 0;
          (cell.events || []).forEach(ev => {
              if (ev.type === 'income') dailyIncome += ev.amount;
              if (ev.type === 'expense') dailyExpense += ev.amount;
          });
          const dailyBalance = dailyIncome - dailyExpense;
          const isToday = cell.day === today.getDate() && isCurrentMonthView;

          return (
          <div key={idx} className={`min-h-[100px] p-2 flex flex-col transition-colors group relative ${!cell.day ? 'bg-gray-50 dark:bg-zinc-900/30' : 'bg-white dark:bg-zinc-950 hover:bg-blue-50/50 dark:hover:bg-zinc-900/40'}`}>
            {cell.day && (
              <>
                <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 dark:bg-black text-white text-xs rounded-lg p-2.5 shadow-xl border border-gray-700 dark:border-zinc-800">
                   <p className="font-bold border-b border-gray-700 dark:border-zinc-800 pb-1 mb-1">Resumo do Dia {cell.day}</p>
                   <p className="text-green-400 dark:text-green-400">Entradas: +{formatCurrency(dailyIncome)}</p>
                   <p className="text-red-400 dark:text-red-400">Saídas: -{formatCurrency(dailyExpense)}</p>
                   <p className={`font-semibold mt-1 pt-1 border-t border-gray-700 dark:border-zinc-800 ${dailyBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>Saldo do Dia: {formatCurrency(dailyBalance)}</p>
                </div>
                <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                        {dailyExpense > 0 && <span className="text-[10px] text-red-500 font-semibold leading-tight">-{formatCurrency(dailyExpense).replace('R$','')}</span>}
                        {dailyIncome > 0 && <span className="text-[10px] text-green-500 font-semibold leading-tight">+{formatCurrency(dailyIncome).replace('R$','')}</span>}
                    </div>
                    <span className={`text-xs font-bold text-right mb-1 ${isToday ? 'text-white bg-blue-500 w-5 h-5 flex items-center justify-center rounded-full self-end' : 'text-gray-500 dark:text-gray-400'}`}>{cell.day}</span>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto hide-scrollbar flex-1 relative z-10">
                  {cell.events.map((ev, eIdx) => (
                    <div key={eIdx} className={`group/event text-[10px] px-1.5 py-1 rounded font-medium relative ${ev.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'}`}>
                      <div className="truncate pr-4">
                        {ev.type === 'income' ? '+' : '-'} {formatCurrency(ev.amount).replace('R$', '').trim()}
                        <span className="block opacity-75 font-normal truncate">{ev.desc}</span>
                      </div>
                      {!ev.synthetic && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ev.type === 'expense') setEditExpenseModal({ isOpen: true, data: ev.raw });
                            if (ev.type === 'income') setEditIncomeModal({ isOpen: true, data: ev.raw });
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded bg-white/50 dark:bg-black/40 hover:bg-white dark:hover:bg-black/70 hidden group-hover/event:block transition-colors"
                        ><Pencil size={10} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )})}
        </div>
      </div>
    </div>
  );
});
