import { memo, useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Receipt, CalendarDays, PiggyBank,
  Settings, LogOut, ChevronDown, User, SlidersHorizontal
} from 'lucide-react';

export const Header = memo(({
  activeTab,
  setActiveTab,
  firstName,
  profile,
  user,
  onOpenSettings,
  onLogout
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  const displayName = profile?.fullName || firstName || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm relative z-50 transition-colors duration-300 border-b border-gray-100 dark:border-gray-700/60">
      <div className="max-w-6xl mx-auto px-4 py-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* 1. LADO ESQUERDO: Apenas o logo FS limpo (sem fundo, sem card, sem borda) */}
        <div className="flex items-center justify-start shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-2xl font-black tracking-widest text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer select-none p-1"
            title="Finanças Simplificadas - Início"
          >
            FS
          </button>
        </div>

        {/* 2. CENTRO: Links de Navegação perfeitamente centralizados */}
        <div className="flex-1 flex items-center justify-center overflow-x-auto hide-scrollbar px-2">
          <nav className="flex items-center gap-1 sm:gap-4 flex-nowrap min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard size={17} />
              <span>Resumo</span>
              {activeTab === 'dashboard' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Receipt size={17} />
              <span>Transações</span>
              {activeTab === 'expenses' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays size={17} />
              <span>Calendário</span>
              {activeTab === 'calendar' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('investments')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'investments'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <PiggyBank size={17} />
              <span>Investimentos</span>
              {activeTab === 'investments' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </nav>
        </div>

        {/* 3. LADO DIREITO: Bloco do Usuário isolado na extremidade direita com dropdown */}
        <div className="flex items-center justify-end shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 transition-colors focus:outline-none cursor-pointer select-none"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              title="Menu do Usuário"
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <span className="text-sm font-semibold max-w-[120px] truncate hidden sm:inline">
                Olá, {firstName || displayName}
              </span>
              <ChevronDown
                size={15}
                className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Flutuante */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header com Identificação do Usuário */}
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/80">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Conectado como</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{displayName}</p>
                  {userEmail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>}
                </div>

                {/* Opções do Menu */}
                <div className="py-1 px-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenSettings('profile');
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                  >
                    <User size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>Editar Perfil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenSettings('finance');
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                  >
                    <SlidersHorizontal size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>Editar Informações</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenSettings('appearance');
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                  >
                    <Settings size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>Configurações Gerais</span>
                  </button>
                </div>

                {/* Sair */}
                <div className="border-t border-gray-100 dark:border-gray-700/80 pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2.5 transition-colors font-semibold cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
});







