import { memo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/currency.js';

export const CalendarPage = memo(({ calendarData, calendarOffset, setCalendarOffset, setEditExpenseModal, setEditIncomeModal }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="text-blue-500" /> Calendário Financeiro
        </h3>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
          <button onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 1))} disabled={calendarOffset === 0} className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 transition-colors shadow-sm disabled:shadow-none">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-sm text-gray-800 dark:text-white min-w-[130px] text-center uppercase tracking-wide">
            {calendarData.monthName} {calendarData.year}
          </span>
          <button onClick={() => setCalendarOffset(Math.min(11, calendarOffset + 1))} disabled={calendarOffset === 11} className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 transition-colors shadow-sm disabled:shadow-none">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-800 text-center py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{day}</div>
        ))}
        {calendarData.grid.map((cell, idx) => {
          let dailyIncome = 0, dailyExpense = 0;
          (cell.events || []).forEach(ev => {
              if (ev.type === 'income') dailyIncome += ev.amount;
              if (ev.type === 'expense') dailyExpense += ev.amount;
          });
          const dailyBalance = dailyIncome - dailyExpense;
          return (
          <div key={idx} className={`bg-white dark:bg-gray-900 min-h-[100px] p-2 flex flex-col transition-colors group relative ${!cell.day ? 'bg-gray-50 dark:bg-gray-800/30' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}>
            {cell.day && (
              <>
                <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded p-2 shadow-xl border border-gray-700 dark:border-gray-300">
                   <p className="font-bold border-b border-gray-700 dark:border-gray-300 pb-1 mb-1">Resumo do Dia {cell.day}</p>
                   <p className="text-green-400 dark:text-green-600">Entradas: +{formatCurrency(dailyIncome)}</p>
                   <p className="text-red-400 dark:text-red-600">Saídas: -{formatCurrency(dailyExpense)}</p>
                   <p className={`font-semibold mt-1 pt-1 border-t border-gray-700 dark:border-gray-300 ${dailyBalance >= 0 ? 'text-blue-400 dark:text-blue-600' : 'text-orange-400 dark:text-orange-600'}`}>Saldo do Dia: {formatCurrency(dailyBalance)}</p>
                </div>
                <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                        {dailyExpense > 0 && <span className="text-[10px] text-red-500 font-semibold leading-tight">-{formatCurrency(dailyExpense).replace('R$','')}</span>}
                        {dailyIncome > 0 && <span className="text-[10px] text-green-500 font-semibold leading-tight">+{formatCurrency(dailyIncome).replace('R$','')}</span>}
                    </div>
                    <span className={`text-xs font-bold text-right mb-1 ${cell.day === new Date().getDate() && calendarOffset === 0 ? 'text-white bg-blue-500 w-5 h-5 flex items-center justify-center rounded-full self-end' : 'text-gray-500 dark:text-gray-400'}`}>{cell.day}</span>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto hide-scrollbar flex-1 relative z-10">
                  {cell.events.map((ev, eIdx) => (
                    <div key={eIdx} className={`group/event text-[10px] px-1.5 py-1 rounded font-medium relative ${ev.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
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
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/50 hidden group-hover/event:block transition-colors"
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
  );
});
