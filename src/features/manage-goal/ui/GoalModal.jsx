import { useMemo } from 'react';
import {
  X, Target, Calendar, Check, Save,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck,
  Plane, Home, Car, GraduationCap, Laptop, TrendingUp, PiggyBank
} from 'lucide-react';
import { CurrencyInput } from '../../../shared/ui/CurrencyInput.jsx';
import { parseCurrencyInput, formatCurrency } from '../../../shared/lib/currency.js';
import { GOAL_CATEGORIES, calculateGoalStats } from '../../../entities/finance/lib/goals.js';

const CATEGORY_ICONS = {
  reserva: ShieldCheck,
  viagem: Plane,
  imovel: Home,
  veiculo: Car,
  educacao: GraduationCap,
  eletronicos: Laptop,
  outros: Target
};

const PRESET_DEADLINES = [
  { months: 6, label: '6 meses' },
  { months: 12, label: '1 ano' },
  { months: 24, label: '2 anos' },
  { months: 36, label: '3 anos' },
  { months: 60, label: '5 anos' }
];

export function GoalModal({
  isOpen,
  mode = 'add',
  goalData,
  setGoalData,
  onClose,
  onSubmit,
  financialStats = {}
}) {
  const {
    netSavings = 0,
    totalInvestmentsBalance = 0,
    totalInvestmentMonthly = 0
  } = financialStats;

  const isEdit = mode === 'edit';

  // Extrai dados do formulário para simulação em tempo real
  const currentFormData = goalData?.data || goalData || {};
  const targetVal = parseCurrencyInput(currentFormData.targetAmount);
  const currentVal = parseCurrencyInput(currentFormData.currentAmount);
  const monthsVal = Math.max(1, parseInt(currentFormData.deadlineMonths, 10) || 12);
  const selectedCategory = currentFormData.category || 'outros';

  // Cálculos dinâmicos em tempo real integrando juros compostos e patrimônio da carteira
  const simulation = useMemo(() => {
    const goalDraft = {
      targetAmount: isNaN(targetVal) ? 0 : targetVal,
      currentAmount: (currentFormData.currentAmount != null && currentFormData.currentAmount !== '') ? currentVal : null,
      deadlineMonths: monthsVal,
      category: selectedCategory
    };
    return calculateGoalStats(goalDraft, financialStats);
  }, [targetVal, currentVal, currentFormData.currentAmount, monthsVal, selectedCategory, financialStats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto overscroll-contain hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative my-auto overflow-visible border border-gray-100 dark:border-zinc-800/60 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Meta ou Objetivo' : 'Simular Nova Meta / Objetivo'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Planejamento estratégico integrado à sua carteira de investimentos e juros compostos.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 mt-5">
          {/* Nome do Objetivo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Nome do Objetivo
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Reserva de Emergência, Viagem Europa, Carro Novo..."
              value={currentFormData.title || ''}
              onChange={(e) => setGoalData(prev => ({
                ...prev,
                data: { ...prev.data, title: e.target.value }
              }))}
              className="w-full rounded-xl border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white p-3 border bg-white text-sm"
            />
          </div>

          {/* Seletor de Categoria */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(GOAL_CATEGORIES).map(cat => {
                const isSelected = selectedCategory === cat.id;
                const IconComponent = CATEGORY_ICONS[cat.id] || Target;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setGoalData(prev => ({
                      ...prev,
                      data: { ...prev.data, category: cat.id }
                    }))}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <IconComponent size={13} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid: Valor Alvo Final & Valor Atual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Valor Alvo Final (R$)
              </label>
              <CurrencyInput
                required
                placeholder="0,00"
                value={currentFormData.targetAmount}
                onChange={(val) => setGoalData(prev => ({
                  ...prev,
                  data: { ...prev.data, targetAmount: val }
                }))}
                focusRingColor="focus:border-blue-500 focus:ring-blue-500"
                className="py-2.5 text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Já Acumulado (R$)
                </label>
              </div>
              <CurrencyInput
                placeholder={totalInvestmentsBalance > 0 ? `${formatCurrency(totalInvestmentsBalance)} (carteira)` : '0,00 (opcional)'}
                value={currentFormData.currentAmount}
                onChange={(val) => setGoalData(prev => ({
                  ...prev,
                  data: { ...prev.data, currentAmount: val }
                }))}
                focusRingColor="focus:border-blue-500 focus:ring-blue-500"
                className="py-2.5 text-sm"
              />
              {totalInvestmentsBalance > 0 && !currentFormData.currentAmount && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <PiggyBank size={12} />
                  <span>Abatendo {formatCurrency(totalInvestmentsBalance)} da carteira de investimentos</span>
                </p>
              )}
            </div>
          </div>

          {/* Prazo em Meses com Atalhos */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Prazo Desejado (Meses)
              </label>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Conclusão estimada: {simulation.completionDate?.formatted}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 select-none">
                  <Calendar size={15} />
                </span>
                <input
                  type="number"
                  min="1"
                  max="360"
                  required
                  placeholder="Ex: 12"
                  value={currentFormData.deadlineMonths || ''}
                  onChange={(e) => setGoalData(prev => ({
                    ...prev,
                    data: { ...prev.data, deadlineMonths: e.target.value }
                  }))}
                  className="w-full rounded-xl border-gray-300 dark:border-zinc-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-zinc-900 dark:text-white pl-9 pr-3 py-2.5 border text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="flex gap-1">
                {PRESET_DEADLINES.map(preset => (
                  <button
                    key={preset.months}
                    type="button"
                    onClick={() => setGoalData(prev => ({
                      ...prev,
                      data: { ...prev.data, deadlineMonths: preset.months.toString() }
                    }))}
                    className={`px-2.5 py-2.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      Number(currentFormData.deadlineMonths) === preset.months
                        ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE SIMULATION CARD (Integrado com Investimentos e Juros Compostos) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 via-white/80 to-indigo-50/60 dark:from-zinc-900/90 dark:via-zinc-950/80 dark:to-blue-950/30 backdrop-blur-md border border-blue-100 dark:border-zinc-800/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Simulação Financeira com Rendimento Composto</span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Sobra mensal: <strong className="text-gray-800 dark:text-gray-200">{formatCurrency(netSavings)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800/60">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Aporte Mensal Necessário</p>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {formatCurrency(simulation.monthlyContribution)}
                  <span className="text-xs font-normal text-gray-400 dark:text-gray-500"> /mês</span>
                </p>
                {simulation.compoundInterestBonus > 0 && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium flex items-center gap-1">
                    <TrendingUp size={11} />
                    <span>+{formatCurrency(simulation.compoundInterestBonus)} em juros compostos</span>
                  </p>
                )}
              </div>

              <div className="bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800/60">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Patrimônio Abatido</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(simulation.currentAmount)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                  Faltam {formatCurrency(simulation.remainingAmount)} para o alvo
                </p>
              </div>
            </div>

            {/* Comparativo de Aportes com Investimentos Atuais */}
            {totalInvestmentMonthly > 0 && (
              <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between">
                <span>Aportes já programados em Investimentos:</span>
                <strong className="font-bold">{formatCurrency(totalInvestmentMonthly)}/mês</strong>
              </div>
            )}

            {/* Indicativo de Viabilidade Financeira */}
            <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
              simulation.isCompleted || simulation.viability.isViable
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                : netSavings <= 0
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/70 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
            }`}>
              {simulation.isCompleted || simulation.viability.isViable ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${netSavings <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold">
                  {simulation.viability.label}
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {simulation.viability.message}
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer active:scale-98"
          >
            {isEdit ? <Save size={18} /> : <Check size={18} />}
            <span>{isEdit ? 'Salvar Alterações da Meta' : 'Cadastrar Objetivo & Iniciar Plano'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
