import { memo } from 'react';
import { Trash2, Receipt, Calendar, ArrowRight, Edit2 } from 'lucide-react';
import { formatDate } from '../../../shared/lib/date.js';
import { formatCurrency } from '../../../shared/lib/currency.js';
import { categoryConfig } from '../../../entities/expense/model/categories.js';

export const ExpensesPage = memo(({ data, expenseFilter, setExpenseFilter, filteredImpact, filteredExpenses, setEditIncomeModal, handleDeleteExtraIncome, setEditExpenseModal, handleDeleteExpense }) => {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Transações</h3>
            <div className="mt-3">
              <select value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)} className="rounded-md border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-950 dark:text-white py-1.5 px-3 border text-sm cursor-pointer bg-white">
                <option value="all">Mostrar Todos</option>
                <optgroup label="Por Tipo"><option value="credit">Só Crédito</option><option value="fixed">Fixos</option><option value="variable">Variáveis</option></optgroup>
                <optgroup label="Por Categoria">
                  <option value="casa">Casa</option><option value="alimentacao">Alimentação</option><option value="transporte">Transporte</option><option value="lazer">Lazer</option><option value="saude">Saúde</option><option value="educacao">Educação</option><option value="cartao_credito">Cartão de Crédito</option><option value="outros">Outros</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 w-full lg:w-auto">
             <div className="text-sm px-4 py-2 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-lg font-medium w-full text-center lg:w-auto">
              {expenseFilter === 'all' ? 'Impacto este Mês: ' : 'Impacto do Filtro: '} {formatCurrency(filteredImpact)}
             </div>
          </div>
        </div>

        {(data.extraIncomes || []).length > 0 && expenseFilter === 'all' && (
          <div className="bg-green-50/50 dark:bg-green-950/20 border-b border-gray-100 dark:border-zinc-800">
            <div className="px-6 py-2 text-xs font-semibold text-green-600 dark:text-green-500 uppercase tracking-wider">Receitas</div>
            <ul className="divide-y divide-green-100 dark:divide-green-950/40">
              {(data.extraIncomes || []).map(extra => {
                const isPending = extra.appliedToBalance === false;
                return (
                <li key={extra.id} className="p-4 flex items-center justify-between hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${isPending ? 'bg-green-300 dark:bg-green-700' : 'bg-green-500'}`}></div>
                    <div>
                       <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">{extra.desc}{isPending && <span className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400 px-2 py-0.5 rounded-full">Agendado</span>}</p>
                       <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                         <span className="text-xs text-green-600 dark:text-green-400 font-medium">Entrada</span>
                         {extra.date && <span className="text-[10px] flex items-center gap-1 text-gray-400 ml-1"><Calendar size={10} /> {formatDate(extra.date)}</span>}
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-semibold text-green-600 dark:text-green-400">+{formatCurrency(extra.amount)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditIncomeModal({ isOpen: true, data: { ...extra } })} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteExtraIncome(extra.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </li>
              )})}
            </ul>
          </div>
        )}

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400"><Receipt className="mx-auto h-12 w-12 opacity-20 mb-3" /><p>Nenhum gasto encontrado.</p></div>
        ) : (
          <>
            <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-zinc-950/80">Saídas e Gastos</div>
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
              {(() => {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();

                return filteredExpenses.map((expense) => {
                  let ey = currentYear;
                  let em = currentMonth + 1;
                  if (expense.date) {
                    const parts = expense.date.split('-');
                    ey = Number(parts[0]) || currentYear;
                    em = Number(parts[1]) || (currentMonth + 1);
                  }
                  const monthsSincePurchase = (currentYear - ey) * 12 + (currentMonth - (em - 1));
                  const isFutureInstallment = expense.installments > 1 && monthsSincePurchase < expense.installments;
                  const currentInstallment = monthsSincePurchase + 1;
                  const hasItems = (expense.items || []).length > 0;
                  const cat = categoryConfig[expense.category] || categoryConfig['outros'];
                  const isPending = expense.appliedToBalance === false;

                  return (
                    <li key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${isPending ? 'bg-gray-300 dark:bg-zinc-700' : hasItems ? 'bg-indigo-500' : cat.color}`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {expense.desc}
                            {isFutureInstallment && <span className="text-[10px] flex items-center gap-1 text-orange-600 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold"><ArrowRight size={10} /> Parcela {Math.max(1, currentInstallment)}/{expense.installments}</span>}
                            {isPending && <span className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 px-2 py-0.5 rounded-full">Agendado</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {hasItems ? (
                              <span className="text-[10px] font-medium bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">Fatura • {expense.items.length} itens</span>
                            ) : (
                              <span className="text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{cat.label}</span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">• {expense.type === 'fixed' ? 'Fixo' : 'Variável'} • {expense.paymentMethod === 'credit' ? ' Crédito' : expense.paymentMethod === 'debit' ? ' Débito' : expense.paymentMethod === 'cash' ? ' Dinheiro' : ' PIX'}{expense.deductedFromBalance && !isPending && <span className="text-blue-500 font-medium ml-1"> (Descontado)</span>}</span>
                            {expense.date && <span className="text-[10px] flex items-center gap-1 text-gray-400 ml-1"><Calendar size={10} /> {formatDate(expense.date)}</span>}
                          </div>
                          {hasItems && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {expense.items.map((it, iIdx) => {
                                const itCat = categoryConfig[it.category] || categoryConfig['outros'];
                                return (
                                  <span key={iIdx} className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white/90 ${itCat.color}`}>{it.desc} • {formatCurrency(it.amount)}</span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</span>
                          {expense.installments > 1 && <p className="text-xs text-gray-500 dark:text-gray-400">{expense.installments}x de {formatCurrency(expense.amount / expense.installments)}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditExpenseModal({ isOpen: true, data: { ...expense } })} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </li>
                  );
                });
              })()}
            </ul>
          </>
        )}
      </div>
    </div>
  );
});
