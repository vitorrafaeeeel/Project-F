import { memo, useState, useRef, useEffect } from 'react';
import {
  TrendingUp, LayoutDashboard, Receipt, CalendarDays, PiggyBank,
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
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const displayName = profile?.fullName || firstName || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm relative z-20 transition-colors duration-300 border-b border-gray-100 dark:border-gray-700/60">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Logo / Marca interativa */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-all focus:outline-none group text-left"
          title="Ir para o Início / Dashboard"
        >
          <div className="p-2 bg-blue-600 group-hover:bg-blue-700 rounded-xl text-white transition-all shadow-sm group-hover:shadow group-hover:scale-105">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              Finanças Simplificadas
            </h1>
          </div>
        </button>

        {/* Navegação de Abas e Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {/* Links de navegação sem card/wrapper de fundo */}
          <nav className="flex items-center gap-1 sm:gap-1.5 flex-nowrap min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-900/25'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-700/50'
              }`}
            >
              <LayoutDashboard size={17} /> <span>Resumo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'expenses'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-900/25'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-700/50'
              }`}
            >
              <Receipt size={17} /> <span>Transações</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-900/25'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-700/50'
              }`}
            >
              <CalendarDays size={17} /> <span>Calendário</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('investments')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'investments'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-900/25'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-700/50'
              }`}
            >
              <PiggyBank size={17} /> <span>Investimentos</span>
            </button>
          </nav>

          {/* Lado Direito: Dropdown do Usuário Exclusivo */}
          <div className="relative ml-1 sm:ml-2" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-100/80 dark:bg-gray-700/70 hover:bg-gray-200/80 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 focus:outline-none shadow-sm"
              aria-expanded={dropdownOpen}
              title="Menu do Usuário"
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover shadow-sm border border-white dark:border-gray-600"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <span className="text-sm font-semibold max-w-[130px] truncate hidden md:inline">
                Olá, {firstName || displayName}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Flutuante */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header com Info do Usuário */}
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/80">
                  <p className="text-[11px] font-medium text-gray-400 dark:text-gray-400 uppercase tracking-wider">Conectado como</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{displayName}</p>
                  {userEmail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>}
                </div>

                {/* Opções do Menu */}
                <div className="py-1.5 px-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenSettings('profile');
                    }}
                    className="w-full px-3.5 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
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
                    className="w-full px-3.5 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
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
                    className="w-full px-3.5 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Settings size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>Configurações gerais</span>
                  </button>
                </div>

                {/* Sair */}
                <div className="border-t border-gray-100 dark:border-gray-700/80 pt-1.5 px-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3.5 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2.5 transition-colors font-semibold"
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


