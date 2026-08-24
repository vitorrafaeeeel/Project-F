import { useCallback, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../shared/api/firebase/client.js';

import { useSession } from './model/useSession.js';
import { useFinanceDoc } from '../entities/finance/model/useFinanceDoc.js';
import { useAutoSettle } from '../entities/finance/model/useAutoSettle.js';
import { updateFinanceData } from '../entities/finance/model/api.js';
import { computeProjections } from '../entities/finance/lib/projections.js';
import { computeCalendarData } from '../entities/finance/lib/calendar.js';
import { computeFilteredExpenses, computeFilteredImpact } from '../entities/finance/lib/filters.js';
import { useProfile } from '../entities/user/model/useProfile.js';
import { getFirstName } from '../entities/user/model/getFirstName.js';

import { useTheme } from '../features/theme/model/useTheme.js';
import { useAuthActions } from '../features/auth/model/useAuthActions.js';
import { useExpenseActions } from '../features/manage-expense/model/useExpenseActions.js';
import { useIncomeActions } from '../features/manage-income/model/useIncomeActions.js';
import { useInvestmentActions } from '../features/manage-investment/model/useInvestmentActions.js';
import { useAccountSettingsForm } from '../features/account-settings/model/useAccountSettingsForm.js';
import { useAiInsight } from '../features/ai-insight/model/useAiInsight.js';
import { useSmartExpense } from '../features/ai-smart-expense/model/useSmartExpense.js';

import { AuthPage } from '../pages/auth/ui/AuthPage.jsx';
import { DashboardPage } from '../pages/dashboard/ui/DashboardPage.jsx';
import { CalendarPage } from '../pages/calendar/ui/CalendarPage.jsx';
import { ExpensesPage } from '../pages/expenses/ui/ExpensesPage.jsx';
import { InvestmentsPage } from '../pages/investments/ui/InvestmentsPage.jsx';

import { Header } from '../widgets/header/ui/Header.jsx';
import { QuickActionsFab } from '../widgets/quick-actions-fab/ui/QuickActionsFab.jsx';

import { SettingsModal } from '../features/account-settings/ui/SettingsModal.jsx';
import { AddIncomeModal } from '../features/manage-income/ui/AddIncomeModal.jsx';
import { EditIncomeModal } from '../features/manage-income/ui/EditIncomeModal.jsx';
import { AddExpenseModal } from '../features/manage-expense/ui/AddExpenseModal.jsx';
import { EditExpenseModal } from '../features/manage-expense/ui/EditExpenseModal.jsx';
import { AddInvestmentModal } from '../features/manage-investment/ui/AddInvestmentModal.jsx';
import { EditInvestmentModal } from '../features/manage-investment/ui/EditInvestmentModal.jsx';
import { DepositModal } from '../features/manage-investment/ui/DepositModal.jsx';

export default function App() {
  // --- SESSÃO / DADOS ---
  const { user, authReady, envError } = useSession();
  const { data, financeLoaded, financeError } = useFinanceDoc(user);
  const { profile, profileLoaded, profileError } = useProfile(user);
  useAutoSettle(data, user);

  const startupError = envError || financeError || profileError;
  const loading = !authReady
    ? true
    : envError
      ? false
      : !user
        ? false
        : !(financeError || profileError || (financeLoaded && profileLoaded));

  const updateData = useCallback((patch) => {
    if (!user) return;
    return updateFinanceData(user.uid, patch);
  }, [user]);

  // --- UI / TEMA ---
  const [isDarkMode, setIsDarkMode] = useTheme(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [modalType, setModalType] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);

  // --- AUTENTICAÇÃO ---
  const { authLoading, authError, authSuccess, handleAuthSubmit, handlePasswordReset, resetMessages } = useAuthActions(user);

  const handleLogout = useCallback(async () => {
    resetMessages();
    setModalType(null);
    setFabOpen(false);
    await signOut(auth);
  }, [resetMessages]);

  // --- FEATURES DE GESTÃO FINANCEIRA ---
  const {
    newExpense, setNewExpense, editExpenseModal, setEditExpenseModal,
    handleAddExpense, handleUpdateExpense, handleDeleteExpense
  } = useExpenseActions(data, updateData);

  const {
    newExtraIncome, setNewExtraIncome, editIncomeModal, setEditIncomeModal,
    handleAddExtraIncome, handleUpdateExtraIncome, handleDeleteExtraIncome
  } = useIncomeActions(data, updateData);

  const {
    newInvestment, setNewInvestment, depositModal, setDepositModal, editInvModal, setEditInvModal,
    handleAddInvestment, handleMakeDeposit, handleUpdateInvestment, handleDeleteInvestment
  } = useInvestmentActions(data, updateData);

  const {
    editIncome, setEditIncome, editBalance, setEditBalance, editBudget, setEditBudget, handleUpdateAccount
  } = useAccountSettingsForm(data, updateData);

  const { aiInsight, aiInsightLoading, handleGenerateInsight } = useAiInsight(data);
  const { aiSmartInput, setAiSmartInput, aiSmartLoading, handleSmartExpense } = useSmartExpense(newExpense, setNewExpense);

  // --- COMPUTAÇÃO DE DADOS (MEMOIZADOS) ---
  const projections = useMemo(() => computeProjections(data), [data]);
  const calendarData = useMemo(() => computeCalendarData(data, projections, calendarOffset), [data, projections, calendarOffset]);
  const filteredExpenses = useMemo(() => computeFilteredExpenses(data?.expenses, expenseFilter), [data?.expenses, expenseFilter]);
  const filteredImpact = useMemo(() => computeFilteredImpact(filteredExpenses, projections), [filteredExpenses, projections]);

  const firstName = getFirstName(profile, user);

  // --- RENDER ---
  if (startupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6">
        <div className="w-full max-w-lg rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Nao foi possivel iniciar o app</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {startupError}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Verifique o arquivo .env.local e reinicie o servidor com npm run dev.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onSubmit={handleAuthSubmit}
        onPasswordReset={handlePasswordReset}
        authLoading={authLoading}
        authError={authError}
        authSuccess={authSuccess}
      />
    );
  }

  if (!data || !projections) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative pb-20 transition-colors duration-300">

        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          firstName={firstName}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onOpenSettings={() => setModalType('settings')}
          onLogout={handleLogout}
        />

        <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <DashboardPage projections={projections} data={data} aiInsight={aiInsight} aiInsightLoading={aiInsightLoading} handleGenerateInsight={handleGenerateInsight} />}
          {activeTab === 'calendar' && <CalendarPage calendarData={calendarData} calendarOffset={calendarOffset} setCalendarOffset={setCalendarOffset} setEditExpenseModal={setEditExpenseModal} setEditIncomeModal={setEditIncomeModal} />}
          {activeTab === 'expenses' && <ExpensesPage data={data} expenseFilter={expenseFilter} setExpenseFilter={setExpenseFilter} filteredImpact={filteredImpact} filteredExpenses={filteredExpenses} setEditIncomeModal={setEditIncomeModal} handleDeleteExtraIncome={handleDeleteExtraIncome} setEditExpenseModal={setEditExpenseModal} handleDeleteExpense={handleDeleteExpense} />}
          {activeTab === 'investments' && <InvestmentsPage data={data} projections={projections} setEditInvModal={setEditInvModal} setDepositModal={setDepositModal} handleDeleteInvestment={handleDeleteInvestment} />}
        </main>

        <QuickActionsFab
          fabOpen={fabOpen}
          setFabOpen={setFabOpen}
          onNewIncome={() => setModalType('income')}
          onNewExpense={() => setModalType('expense')}
          onNewInvestment={() => setModalType('investment')}
        />

        {modalType === 'settings' && (
          <SettingsModal
            onClose={() => setModalType(null)}
            editIncome={editIncome} setEditIncome={setEditIncome}
            editBalance={editBalance} setEditBalance={setEditBalance}
            editBudget={editBudget} setEditBudget={setEditBudget}
            onSave={() => handleUpdateAccount(() => setModalType(null))}
          />
        )}

        {modalType === 'income' && (
          <AddIncomeModal
            onClose={() => setModalType(null)}
            newExtraIncome={newExtraIncome}
            setNewExtraIncome={setNewExtraIncome}
            onSubmit={(e) => handleAddExtraIncome(e, () => setModalType(null))}
          />
        )}

        {modalType === 'expense' && (
          <AddExpenseModal
            onClose={() => setModalType(null)}
            newExpense={newExpense}
            setNewExpense={setNewExpense}
            onSubmit={(e) => handleAddExpense(e, () => setModalType(null))}
            aiSmartInput={aiSmartInput}
            setAiSmartInput={setAiSmartInput}
            aiSmartLoading={aiSmartLoading}
            handleSmartExpense={handleSmartExpense}
          />
        )}

        {modalType === 'investment' && (
          <AddInvestmentModal
            onClose={() => setModalType(null)}
            newInvestment={newInvestment}
            setNewInvestment={setNewInvestment}
            onSubmit={(e) => handleAddInvestment(e, () => setModalType(null))}
          />
        )}

        {editExpenseModal.isOpen && editExpenseModal.data && (
          <EditExpenseModal
            editExpenseModal={editExpenseModal}
            setEditExpenseModal={setEditExpenseModal}
            onClose={() => setEditExpenseModal({ isOpen: false, data: null })}
            onSubmit={handleUpdateExpense}
          />
        )}

        {editIncomeModal.isOpen && editIncomeModal.data && (
          <EditIncomeModal
            editIncomeModal={editIncomeModal}
            setEditIncomeModal={setEditIncomeModal}
            onClose={() => setEditIncomeModal({ isOpen: false, data: null })}
            onSubmit={handleUpdateExtraIncome}
          />
        )}

        {depositModal.isOpen && (
          <DepositModal
            depositModal={depositModal}
            setDepositModal={setDepositModal}
            onClose={() => setDepositModal({ isOpen: false, invId: null, amount: '' })}
            onSubmit={handleMakeDeposit}
          />
        )}

        {editInvModal.isOpen && (
          <EditInvestmentModal
            editInvModal={editInvModal}
            setEditInvModal={setEditInvModal}
            onClose={() => setEditInvModal({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' })}
            onSubmit={handleUpdateInvestment}
          />
        )}

      </div>
    </div>
  );
}
