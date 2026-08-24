import { memo, useState, useRef, useEffect } from 'react';
import {
  TrendingUp, LayoutDashboard, Receipt, CalendarDays, PiggyBank,
  Settings, LogOut, ChevronDown, User
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
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const displayName = profile?.fullName || firstName || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';

  return (
    <header className="bg-white dark:bg-gray-800 shadow relative z-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Logo / Marca interativa */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none group text-left"
          title="Ir para o Início / Dashboard"
        >
          <div className="p-2 bg-blue-600 group-hover:bg-blue-700 rounded-lg text-white transition-colors shadow-sm">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Finanças Plus</h1>
          </div>
        </button>

        {/* Navegação de Abas */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          <nav className="flex bg-gray-100 dark:bg-gray-700/80 p-1 rounded-lg flex-nowrap transition-colors duration-300 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md text-sm transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard size={17} /> <span className="hidden sm:inline">Resumo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md text-sm transition-all ${
                activeTab === 'expenses'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Receipt size={17} /> <span className="hidden sm:inline">Transações</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md text-sm transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays size={17} /> <span className="hidden sm:inline">Calendário</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('investments')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-md text-sm transition-all ${
                activeTab === 'investments'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <PiggyBank size={17} /> <span className="hidden sm:inline">Investimentos</span>
            </button>
          </nav>

          {/* Lado Direito: [Olá, Nome (Dropdown)] + [Configurações] */}
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            {/* Dropdown do Usuário */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors focus:outline-none"
                aria-expanded={dropdownOpen}
                title="Menu do Usuário"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold max-w-[140px] truncate hidden md:inline">
                  Olá, {firstName || displayName}
                </span>
                <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Conectado como</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                    {userEmail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>}
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <User size={16} className="text-gray-500 dark:text-gray-400" />
                      <span>Meu Perfil & Ajustes</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut size={16} />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Configurações */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none"
              title="Configurações e Perfil"
            >
              <Settings size={20} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
});

