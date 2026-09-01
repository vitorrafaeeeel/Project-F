import { memo, useState, useRef, useEffect, useMemo } from 'react';
import {
  Trash2, Receipt, Calendar, ArrowRight, Edit2, ChevronDown, Check,
  Briefcase, Plus, ArrowUpCircle, Wallet
} from 'lucide-react';
import { formatDate } from '../../../shared/lib/date.js';
import { formatCurrency } from '../../../shared/lib/currency.js';
import { categoryConfig } from '../../../entities/expense/model/categories.js';
import { getSalaries } from '../../../features/manage-salary/model/useSalaryActions.js';

const filterGroups = [
  {
    title: 'Geral',
    options: [
      { id: 'all', label: 'Todas as Despesas' }
    ]
  },
  {
    title: 'Por Tipo',
    options: [
      { id: 'fixed', label: 'Gastos Fixos' },
      { id: 'variable', label: 'Gastos Variáveis' }
    ]
  },
  {
    title: 'Por Categoria',
    options: [
      { id: 'cartao_credito', label: 'Cartão de Crédito' },
      { id: 'casa', label: 'Casa' },
      { id: 'alimentacao', label: 'Alimentação' },
      { id: 'transporte', label: 'Transporte' },
      { id: 'lazer', label: 'Lazer' },
      { id: 'saude', label: 'Saúde' },
      { id: 'educacao', label: 'Educação' },
      { id: 'outros', label: 'Outros' }
    ]
  }
];

export const ExpensesPage = memo(({
  data,
  expenseFilter,
  setExpenseFilter,
  filteredImpact,
  filteredExpenses,
  setEditIncomeModal,
  handleDeleteExtraIncome,
  setEditExpenseModal,
  handleDeleteExpense,
  onOpenAddIncome,
  onOpenAddSalary,
  onOpenEditSalary,
  handleDeleteSalary
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const selectedOption = filterGroups.flatMap(g => g.options).find(o => o.id === expenseFilter) || { id: 'all', label: 'Todas as Despesas' };

  // Cálculo e gerenciamento de salários e receitas
  const salaries = useMemo(() => getSalaries(data), [data]);
  const totalFixedSalaries = useMemo(() => salaries.reduce((acc, s) => acc + (s.amount || 0), 0), [salaries]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthExtraIncomes = useMemo(() => {
    return (data?.extraIncomes || []).filter(inc => {
      if (!inc.date) return true;
      const parts = inc.date.split('-');
      const iy = Number(parts[0]) || currentYear;
      const im = Number(parts[1]) || (currentMonth + 1);
      return iy === currentYear && (im - 1) === currentMonth;
    });
  }, [data?.extraIncomes, currentYear, currentMonth]);

  const currentMonthExtraTotal = useMemo(() => {
    return currentMonthExtraIncomes.reduce((acc, inc) => acc + (inc.amount || 0), 0);
  }, [currentMonthExtraIncomes]);

  const totalMonthlyIncome = totalFixedSalaries + currentMonthExtraTotal;

  return (
    <div className="w-full space-y-6">
      {/* 1. SEÇÃO: Gestão de Rendas e Salários */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
              <Wallet size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Gestão de Rendas e Salários
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Cadastre e gerencie suas fontes de receitas recorrentes e entradas extras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAddSalary && (
              <button
                type="button"
                onClick={onOpenAddSalary}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Plus size={15} />
                <span>Novo Salário</span>
              </button>
            )}

            {onOpenAddIncome && (
              <button
                type="button"
                onClick={onOpenAddIncome}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 rounded-xl transition-all cursor-pointer"
              >
                <ArrowUpCircle size={15} />
                <span>Receita Extra</span>
              </button>
            )}
          </div>
        </div>

        {/* Cards de Métricas de Renda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Salários & Rendas Fixas</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(totalFixedSalaries)}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">/ mês</span>
            </h4>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              {salaries.length} {salaries.length === 1 ? 'fonte cadastrada' : 'fontes cadastradas'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Receitas Extras (Este Mês)</p>
            <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatCurrency(currentMonthExtraTotal)}
            </h4>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              {currentMonthExtraIncomes.length} {currentMonthExtraIncomes.length === 1 ? 'entrada no mês' : 'entradas no mês'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Renda Total do Mês</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(totalMonthlyIncome)}
            </h4>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Previsão consolidada de entradas
            </p>
          </div>
        </div>

        {/* Lista de Salários Recorrentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Fontes de Salário / Renda Recorrente
            </h4>
            <span className="text-xs text-gray-400">
              Total Fixo: {formatCurrency(totalFixedSalaries)}
            </span>
          </div>

          {salaries.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-900/20">
              <Briefcase className="mx-auto h-8 w-8 text-gray-400 opacity-40 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Nenhum salário ou fonte de renda recorrente cadastrada.
              </p>
              {onOpenAddSalary && (
                <button
                  type="button"
                  onClick={onOpenAddSalary}
                  className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Cadastrar primeiro salário
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {salaries.map((sal) => (
                <div
                  key={sal.id}
                  className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800/60 flex items-center justify-between gap-3 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {sal.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                        {sal.paymentDay ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                            <Calendar size={11} className="text-emerald-600 dark:text-emerald-400" />
                            Dia {sal.paymentDay}
                          </span>
                        ) : (
                          <span className="text-[11px]">Sem dia fixado</span>
                        )}
                        <span>•</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Recorrente
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(sal.amount)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {onOpenEditSalary && (
                        <button
                          type="button"
                          onClick={() => onOpenEditSalary(sal)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Editar salário"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      {handleDeleteSalary && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSalary(sal.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Remover salário"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Receitas Extras */}
        {(data?.extraIncomes || []).length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Receitas Extras Registradas
              </h4>
              <span className="text-xs text-gray-400">
                Total no Mês: +{formatCurrency(currentMonthExtraTotal)}
              </span>
            </div>

            <ul className="divide-y divide-gray-100 dark:divide-zinc-800/50 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl border border-gray-100 dark:border-zinc-800/40 overflow-hidden">
              {(data.extraIncomes || []).map((extra) => {
                const isPending = extra.appliedToBalance === false;
                return (
                  <li
                    key={extra.id}
                    className="p-3.5 flex items-center justify-between hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${isPending ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          {extra.desc}
                          {isPending && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                              Agendado
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Receita Extra</span>
                          {extra.date && (
                            <span className="text-[11px] flex items-center gap-1 text-gray-400">
                              <Calendar size={11} /> {formatDate(extra.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(extra.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        {setEditIncomeModal && (
                          <button
                            type="button"
                            onClick={() => setEditIncomeModal({ isOpen: true, data: { ...extra } })}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Editar receita"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        {handleDeleteExtraIncome && (
                          <button
                            type="button"
                            onClick={() => handleDeleteExtraIncome(extra.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Remover receita"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* 2. SEÇÃO: Histórico de Transações e Despesas */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800/60 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Despesas & Histórico de Gastos</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Acompanhamento de saídas fixas, variáveis e faturas
            </p>

            {/* Dropdown Customizado de Filtros */}
            <div className="relative mt-3" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(prev => !prev)}
                className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-gray-50 dark:bg-zinc-900/90 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium rounded-xl border border-gray-200 dark:border-zinc-800 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                aria-expanded={isFilterOpen}
              >
                <span className="font-semibold">{selectedOption.label}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 max-h-96 overflow-y-auto overscroll-contain bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filterGroups.map((group, gIdx) => (
                    <div key={group.title} className={gIdx > 0 ? 'border-t border-gray-100 dark:border-zinc-800/80 pt-1.5 mt-1.5' : ''}>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                        {group.title}
                      </div>
                      <div className="space-y-0.5">
                        {group.options.map(opt => {
                          const isSelected = expenseFilter === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setExpenseFilter(opt.id);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900/60'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full lg:w-auto">
            <div className="text-sm px-4 py-2 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-xl font-semibold w-full text-center lg:w-auto border border-red-200/50 dark:border-red-900/50">
              {expenseFilter === 'all' ? 'Impacto este Mês: ' : 'Impacto do Filtro: '} {formatCurrency(filteredImpact)}
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <Receipt className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p className="text-sm font-medium">Nenhum gasto encontrado para este filtro.</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800/60">
              Lista de Saídas e Despesas
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800/50">
              {(() => {
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
                    <li key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${isPending ? 'bg-gray-300 dark:bg-zinc-700' : hasItems ? 'bg-indigo-500' : cat.color}`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {expense.desc}
                            {isFutureInstallment && <span className="text-[10px] flex items-center gap-1 text-orange-600 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold"><ArrowRight size={10} /> Parcela {Math.max(1, currentInstallment)}/{expense.installments}</span>}
                            {isPending && <span className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400 px-2 py-0.5 rounded-full">Agendado</span>}
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
                          <button onClick={() => setEditExpenseModal({ isOpen: true, data: { ...expense } })} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer" title="Editar despesa"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer" title="Remover despesa"><Trash2 size={18} /></button>
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
