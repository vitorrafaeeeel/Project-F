import { X, Briefcase, Calendar, Check, Save } from 'lucide-react';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';

export function SalaryModal({
  isOpen,
  mode = 'add',
  salaryData,
  setSalaryData,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
            <Briefcase size={18} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Salário / Renda' : 'Novo Salário / Renda'}
          </h3>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          {isEdit
            ? 'Atualize as informações da sua fonte de renda fixa mensal.'
            : 'Adicione uma fonte de salário, pró-labore ou receita recorrente fixa.'}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Nome da Fonte / Empresa
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Emprego CLT, Empresa X, Pró-labore..."
              value={salaryData.name}
              onChange={(e) => setSalaryData(prev => ({
                ...prev,
                data: { ...prev.data, name: e.target.value }
              }))}
              className="w-full rounded-xl border-gray-300 dark:border-zinc-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-white p-3 border bg-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Valor Líquido Mensal
              </label>
              <CurrencyInput
                required
                value={salaryData.amount}
                onChange={(val) => setSalaryData(prev => ({
                  ...prev,
                  data: { ...prev.data, amount: val }
                }))}
                focusRingColor="focus:border-emerald-500 focus:ring-emerald-500"
                className="py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Dia do Pagamento
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 select-none">
                  <Calendar size={14} />
                </span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 5"
                  value={salaryData.paymentDay}
                  onChange={(e) => setSalaryData(prev => ({
                    ...prev,
                    data: { ...prev.data, paymentDay: e.target.value }
                  }))}
                  className="w-full rounded-xl border-gray-300 dark:border-zinc-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white dark:bg-zinc-900 dark:text-white pl-9 pr-3 py-3 border text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            O dia do pagamento é utilizado para destacar a entrada da receita no Calendário.
          </p>

          <button
            type="submit"
            className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer active:scale-98"
          >
            {isEdit ? <Save size={18} /> : <Check size={18} />}
            <span>{isEdit ? 'Salvar Alterações' : 'Cadastrar Salário'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
