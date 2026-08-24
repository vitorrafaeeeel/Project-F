import { useState, useRef } from 'react';
import {
  X, User, Camera, Sun, Moon, Mail, CreditCard,
  Calendar, Phone, DollarSign, Wallet, PiggyBank,
  Check, Save, Sparkles
} from 'lucide-react';

export function SettingsModal({
  onClose,
  initialSection = 'profile',
  // Dados financeiros
  editIncome, setEditIncome,
  editBalance, setEditBalance,
  editBudget, setEditBudget,
  // Dados de perfil
  fullName, setFullName,
  email,
  cpf, setCpf,
  birthDate, setBirthDate,
  phone, setPhone,
  avatarUrl, setAvatarUrl,
  // Tema
  isDarkMode, setIsDarkMode,
  // Ações
  onSave, isSaving
}) {
  const [activeSection, setActiveSection] = useState(initialSection); // 'profile' | 'finance' | 'appearance'
  const fileInputRef = useRef(null);


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Por favor, selecione uma imagem de até 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const initialLetter = (fullName || 'U').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl relative max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Perfil & Configurações</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gerencie sua conta, preferências e metas financeiras</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-1.5 focus:outline-none"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação de Abas do Modal */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 px-6 pt-3 bg-gray-50/30 dark:bg-gray-900/20 gap-4 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`pb-3 relative transition-colors ${
              activeSection === 'profile'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Dados Pessoais
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('finance')}
            className={`pb-3 relative transition-colors ${
              activeSection === 'finance'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Ajustes Financeiros
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('appearance')}
            className={`pb-3 relative transition-colors ${
              activeSection === 'appearance'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Aparência & Tema
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Seção 1: Dados Pessoais e Avatar */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              {/* Bloco de Avatar */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-2xl border border-blue-100/60 dark:border-blue-900/30">
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md border-4 border-white dark:border-gray-700">
                      {initialLetter}
                    </div>
                  )}

                  {/* Botão de Câmera Sobreposto */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white dark:border-gray-800 transition-transform active:scale-95 group-hover:scale-105"
                    title="Alterar foto de perfil"
                  >
                    <Camera size={16} />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="text-center mt-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {fullName || 'Seu Nome'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{email || 'email@exemplo.com'}</p>
                </div>
              </div>

              {/* Formulário de Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700/80 dark:text-white p-3 border text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail size={14} className="text-blue-500" /> E-mail (Identificador)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 p-3 border text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-blue-500" /> CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700/80 dark:text-white p-3 border text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" /> Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700/80 dark:text-white p-3 border text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone size={14} className="text-blue-500" /> Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700/80 dark:text-white p-3 border text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seção 2: Ajustes Financeiros */}
          {activeSection === 'finance' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/40 mb-2">
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed flex items-center gap-1.5">
                  <Sparkles size={14} className="flex-shrink-0" />
                  Esses valores alimentam o Dashboard e os gráficos de projeção futura.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-green-500" /> Renda Mensal Fixa (R$)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={editIncome}
                  onChange={(e) => setEditIncome(e.target.value)}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700/80 dark:text-white p-3 border text-sm"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Seu salário líquido ou receita recorrente mensal base.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Wallet size={14} className="text-blue-500" /> Saldo Atual em Conta (R$)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700/80 dark:text-white p-3 border text-sm"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Saldo líquido disponível em suas contas correntes hoje.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <PiggyBank size={14} className="text-purple-500" /> Limite Planejado de Gastos/Mês (R$)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700/80 dark:text-white p-3 border text-sm"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Teto de gastos desejado para o mês atual.</p>
              </div>

            </div>
          )}

          {/* Seção 3: Aparência & Tema */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Tema da Interface</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Escolha entre o modo claro e escuro para personalizar sua experiência.</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Opção Modo Claro */}
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(false)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all text-center ${
                      !isDarkMode
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${!isDarkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      <Sun size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Modo Claro</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Interface limpa e iluminada</p>
                    </div>
                    {!isDarkMode && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                        <Check size={14} /> Ativo
                      </div>
                    )}
                  </button>

                  {/* Opção Modo Escuro */}
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(true)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all text-center ${
                      isDarkMode
                        ? 'border-blue-500 bg-blue-900/20 text-blue-400 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      <Moon size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Modo Escuro</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Confortável para pouca luz</p>
                    </div>
                    {isDarkMode && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-400">
                        <Check size={14} /> Ativo
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer com Botões de Ação */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-md transition-all flex items-center gap-2 active:scale-98"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Save size={16} />
            )}
            <span>Salvar Alterações</span>
          </button>
        </div>

      </div>
    </div>
  );
}

