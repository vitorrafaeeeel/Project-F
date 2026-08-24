import { memo } from 'react';
import {
  TrendingUp, LayoutDashboard, Receipt, CalendarDays, PiggyBank,
  Sun, Moon, Settings, LogOut
} from 'lucide-react';

export const Header = memo(({ activeTab, setActiveTab, firstName, isDarkMode, setIsDarkMode, onOpenSettings, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow relative z-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finanças Plus</h1>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-nowrap transition-colors duration-300 min-w-max">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              <LayoutDashboard size={18} /> <span className="hidden sm:inline">Resumo</span>
            </button>
            <button onClick={() => setActiveTab('expenses')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'expenses' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              <Receipt size={18} /> <span className="hidden sm:inline">Transações</span>
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'calendar' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              <CalendarDays size={18} /> <span className="hidden sm:inline">Calendário</span>
            </button>
            <button onClick={() => setActiveTab('investments')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'investments' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              <PiggyBank size={18} /> <span className="hidden sm:inline">Investimentos</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[180px] truncate">Ola, {firstName}</p>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Alternar Tema">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={onOpenSettings} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Configurações">
              <Settings size={20} />
            </button>
            <button onClick={onLogout} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
