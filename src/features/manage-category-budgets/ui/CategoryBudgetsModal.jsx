import { X, Trash2, Plus, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import { categoryConfig } from '../../../entities/expense/model/categories.js';
import { CustomSelect } from '../../../shared/ui/CustomSelect.jsx';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';
import { formatCurrency, parseCurrencyInput } from '../../../shared/lib/currency.js';

const categoryOptions = Object.entries(categoryConfig)
  .map(([key, cfg]) => ({ value: key, label: cfg.label }));

export function CategoryBudgetsModal({
  onClose,
  rows,
  addRow,
  updateRow,
  removeRow,
  onSave,
  plannedBudget = 0,
  totalAllocated = 0,
  remainingToAllocate = 0,
  isOverBudget = false,
  allocationRatio = 0,
  allocationPercentage = '0',
  onOpenSettings
}) {
  const maxCategoriesReached = rows.length >= Object.keys(categoryConfig).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Orçamento por Categoria</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Distribua a verba total do seu Orçamento Geral entre as categorias desejadas.
        </p>

        {/* Card de Resumo de Distribuição da Verba */}
        {plannedBudget > 0 ? (
          <div className="bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800/80 mb-5 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-gray-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Orçamento Geral</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(plannedBudget)}
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-gray-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Distribuído</p>
                <p className={`text-xs sm:text-sm font-bold mt-0.5 ${
                  isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {formatCurrency(totalAllocated)}
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-gray-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                  {isOverBudget ? 'Excedente' : 'Disponível'}
                </p>
                <p className={`text-xs sm:text-sm font-bold mt-0.5 ${
                  isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {formatCurrency(Math.abs(remainingToAllocate))}
                </p>
              </div>
            </div>

            {/* Barra de Progresso da Distribuição */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                <span>Distribuição do teto</span>
                <span className={`font-semibold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {allocationPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverBudget
                      ? 'bg-red-500'
                      : allocationRatio >= 0.8
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(allocationRatio * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Alerta de Validação de Limite */}
            {isOverBudget && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-500" />
                <p>
                  A soma dos limites das categorias ultrapassa o Orçamento Geral em <strong>{formatCurrency(totalAllocated - plannedBudget)}</strong>. Ajuste os valores para não ultrapassar o teto estipulado.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/40 mb-5 flex items-start justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p>
                Você ainda não definiu um <strong>Orçamento Geral</strong> mensal. Recomendamos definir o teto geral nas configurações para validar a divisão de verbas.
              </p>
            </div>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="shrink-0 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sliders size={12} />
                Definir
              </button>
            )}
          </div>
        )}

        {/* Lista de Categorias */}
        <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1 hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rows.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Nenhum limite cadastrado. Clique no botão abaixo para adicionar categorias.
              </p>
            </div>
          ) : (
            rows.map((row, idx) => {
              const amountVal = parseCurrencyInput(row.amount);
              const shareOfGeneral = (plannedBudget > 0 && !isNaN(amountVal) && amountVal > 0)
                ? ((amountVal / plannedBudget) * 100).toFixed(0)
                : null;

              return (
                <div key={idx} className="flex gap-2 items-center bg-gray-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800/60">
                  <div className="flex-1 min-w-0">
                    <CustomSelect
                      value={row.category}
                      onChange={(val) => updateRow(idx, 'category', val)}
                      options={categoryOptions}
                      buttonClassName="py-2 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="w-32 shrink-0">
                    <CurrencyInput
                      value={row.amount}
                      onChange={(val) => updateRow(idx, 'amount', val)}
                      focusRingColor="focus:border-pink-500 focus:ring-pink-500"
                      className="py-2 text-xs sm:text-sm rounded-lg"
                    />
                  </div>

                  {shareOfGeneral !== null && (
                    <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-1 rounded-md bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 whitespace-nowrap" title="Parcela do Orçamento Geral">
                      {shareOfGeneral}%
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Remover categoria"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={maxCategoriesReached}
          className={`w-full mt-3 border border-dashed text-xs sm:text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
            maxCategoriesReached
              ? 'border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
              : 'border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-pink-400 hover:text-pink-600 dark:hover:text-pink-400 cursor-pointer'
          }`}
        >
          <Plus size={16} />
          {maxCategoriesReached ? 'Todas as categorias adicionadas' : 'Adicionar categoria'}
        </button>

        <button
          onClick={onSave}
          disabled={isOverBudget}
          className={`w-full mt-5 font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
            isOverBudget
              ? 'bg-gray-300 dark:bg-zinc-800 text-gray-500 dark:text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-pink-600 hover:bg-pink-700 text-white cursor-pointer active:scale-98'
          }`}
          title={isOverBudget ? 'Ajuste os valores para não ultrapassar o Orçamento Geral' : 'Salvar alterações'}
        >
          {isOverBudget ? (
            <>
              <AlertTriangle size={16} />
              <span>Orçamento Geral Excedido</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Guardar Orçamentos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
