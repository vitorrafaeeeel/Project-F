import { memo, useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Receipt, CalendarDays, PiggyBank, Target,
  User, SlidersHorizontal, Settings, LogOut, Menu, X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuBtnRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // Fecha o dropdown e o menu mobile ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(event.target);
      const isOutsideMobileMenu =
        (!mobileMenuBtnRef.current || !mobileMenuBtnRef.current.contains(event.target)) &&
        (!mobileDrawerRef.current || !mobileDrawerRef.current.contains(event.target));

      if (isOutsideDropdown) {
        setDropdownOpen(false);
      }
      if (isOutsideMobileMenu) {
        setMobileMenuOpen(false);
      }
    };

    if (dropdownOpen || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, mobileMenuOpen]);

  const displayName = profile?.fullName || user?.displayName || firstName || 'Usuário';
  const userEmail = profile?.email || user?.email || '';
  const initialLetter = displayName.charAt(0).toUpperCase();

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Resumo', icon: LayoutDashboard },
    { id: 'expenses', label: 'Transações', icon: Receipt },
    { id: 'calendar', label: 'Calendário', icon: CalendarDays },
    { id: 'investments', label: 'Investimentos', icon: PiggyBank },
    { id: 'goals', label: 'Objetivos', icon: Target }
  ];

  return (
    <header className="bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800/60 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* 1. LADO ESQUERDO: Avatar Circular do Usuário ("V") tanto no Desktop quanto no Mobile */}
        <div className="flex items-center shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(prev => !prev);
                setMobileMenuOpen(false);
              }}
              className="p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all focus:outline-none cursor-pointer select-none"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              title="Menu do Usuário"
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-200 dark:border-zinc-800"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-sm transition-colors">
                  {initialLetter}
                </div>
              )}
            </button>

            {/* Dropdown Menu Flutuante (alinhado à esquerda) */}
            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800/60 py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header com Identificação do Usuário */}
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800/60">
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
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                  >
                    <User size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>Perfil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenSettings('finance');
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                  >
                    <SlidersHorizontal size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>Informações</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenSettings('appearance');
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                  >
                    <Settings size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>Tema Claro/Escuro</span>
                  </button>
                </div>

                {/* Sair */}
                <div className="border-t border-gray-100 dark:border-zinc-800/60 pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-2.5 transition-colors font-semibold cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. CENTRO: Links de Navegação Desktop (perfeitamente centralizados) */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-2 lg:gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSelect(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. LADO DIREITO: */}
        {/* Mobile: Menu Sanduíche (três barrinhas) | Desktop: Espaçador Invisível para centralização simétrica */}
        <div className="flex items-center justify-end shrink-0">
          {/* Mobile: Menu Sanduíche */}
          <div className="md:hidden" ref={mobileMenuBtnRef}>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(prev => !prev);
                setDropdownOpen(false);
              }}
              className="p-2 -mr-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none cursor-pointer"
              aria-label="Abrir menu de navegação"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Desktop: Espaçador Invisível de 36px (w-9) que balanceia o avatar à esquerda */}
          <div className="hidden md:block w-9 h-9" aria-hidden="true" />
        </div>

      </div>

      {/* 4. Menu Mobile Expansível (Dropdown Vertical) */}
      {mobileMenuOpen && (
        <div
          ref={mobileDrawerRef}
          className="md:hidden border-t border-gray-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
});

