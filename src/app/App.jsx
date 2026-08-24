import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
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

import { Header } from '../widgets/header/ui/Header.jsx';
import { QuickActionsFab } from '../widgets/quick-actions-fab/ui/QuickActionsFab.jsx';

// Lazy loading das páginas e modais para divisão de chunks e carregamento otimizado
const AuthPage = lazy(() => import('../pages/auth/ui/AuthPage.jsx').then(m => ({ default: m.AuthPage })));
const DashboardPage = lazy(() => import('../pages/dashboard/ui/DashboardPage.jsx').then(m => ({ default: m.DashboardPage })));
const CalendarPage = lazy(() => import('../pages/calendar/ui/CalendarPage.jsx').then(m => ({ default: m.CalendarPage })));
const ExpensesPage = lazy(() => import('../pages/expenses/ui/ExpensesPage.jsx').then(m => ({ default: m.ExpensesPage })));
const InvestmentsPage = lazy(() => import('../pages/investments/ui/InvestmentsPage.jsx').then(m => ({ default: m.InvestmentsPage })));

const SettingsModal = lazy(() => import('../features/account-settings/ui/SettingsModal.jsx').then(m => ({ default: m.SettingsModal })));
const AddIncomeModal = lazy(() => import('../features/manage-income/ui/AddIncomeModal.jsx').then(m => ({ default: m.AddIncomeModal })));
const EditIncomeModal = lazy(() => import('../features/manage-income/ui/EditIncomeModal.jsx').then(m => ({ default: m.EditIncomeModal })));
const AddExpenseModal = lazy(() => import('../features/manage-expense/ui/AddExpenseModal.jsx').then(m => ({ default: m.AddExpenseModal })));
const EditExpenseModal = lazy(() => import('../features/manage-expense/ui/EditExpenseModal.jsx').then(m => ({ default: m.EditExpenseModal })));
const AddInvestmentModal = lazy(() => import('../features/manage-investment/ui/AddInvestmentModal.jsx').then(m => ({ default: m.AddInvestmentModal })));
const EditInvestmentModal = lazy(() => import('../features/manage-investment/ui/EditInvestmentModal.jsx').then(m => ({ default: m.EditInvestmentModal })));
const DepositModal = lazy(() => import('../features/manage-investment/ui/DepositModal.jsx').then(m => ({ default: m.DepositModal })));

function PageLoadingFallback() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
}

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

  // --- HANDLERS MEMOIZADOS PARA EVITAR RE-RENDERS ---
  const handleOpenSettings = useCallback(() => setModalType('settings'), []);
  const handleCloseModal = useCallback(() => setModalType(null), []);
  const handleOpenIncome = useCallback(() => setModalType('income'), []);
  const handleOpenExpense = useCallback(() => setModalType('expense'), []);
  const handleOpenInvestment = useCallback(() => setModalType('investment'), []);

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

  const handleSaveSettings = useCallback(() => {
    handleUpdateAccount(handleCloseModal);
  }, [handleUpdateAccount, handleCloseModal]);

  const handleAddIncomeSubmit = useCallback((e) => {
    handleAddExtraIncome(e, handleCloseModal);
  }, [handleAddExtraIncome, handleCloseModal]);

  const handleAddExpenseSubmit = useCallback((e) => {
    handleAddExpense(e, handleCloseModal);
  }, [handleAddExpense, handleCloseModal]);

  const handleAddInvestmentSubmit = useCallback((e) => {
    handleAddInvestment(e, handleCloseModal);
  }, [handleAddInvestment, handleCloseModal]);

  const handleCloseEditExpense = useCallback(() => {
    setEditExpenseModal({ isOpen: false, data: null });
  }, [setEditExpenseModal]);

  const handleCloseEditIncome = useCallback(() => {
    setEditIncomeModal({ isOpen: false, data: null });
  }, [setEditIncomeModal]);

  const handleCloseDeposit = useCallback(() => {
    setDepositModal({ isOpen: false, invId: null, amount: '' });
  }, [setDepositModal]);

  const handleCloseEditInv = useCallback(() => {
    setEditInvModal({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' });
  }, [setEditInvModal]);

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
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Não foi possível iniciar o app</h1>
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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
        <AuthPage
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onSubmit={handleAuthSubmit}
          onPasswordReset={handlePasswordReset}
          authLoading={authLoading}
          authError={authError}
          authSuccess={authSuccess}
        />
      </Suspense>
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
          onOpenSettings={handleOpenSettings}
          onLogout={handleLogout}
        />

        <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={<PageLoadingFallback />}>
            {activeTab === 'dashboard' && <DashboardPage projections={projections} data={data} aiInsight={aiInsight} aiInsightLoading={aiInsightLoading} handleGenerateInsight={handleGenerateInsight} />}
            {activeTab === 'calendar' && <CalendarPage calendarData={calendarData} calendarOffset={calendarOffset} setCalendarOffset={setCalendarOffset} setEditExpenseModal={setEditExpenseModal} setEditIncomeModal={setEditIncomeModal} />}
            {activeTab === 'expenses' && <ExpensesPage data={data} expenseFilter={expenseFilter} setExpenseFilter={setExpenseFilter} filteredImpact={filteredImpact} filteredExpenses={filteredExpenses} setEditIncomeModal={setEditIncomeModal} handleDeleteExtraIncome={handleDeleteExtraIncome} setEditExpenseModal={setEditExpenseModal} handleDeleteExpense={handleDeleteExpense} />}
            {activeTab === 'investments' && <InvestmentsPage data={data} projections={projections} setEditInvModal={setEditInvModal} setDepositModal={setDepositModal} handleDeleteInvestment={handleDeleteInvestment} />}
          </Suspense>
        </main>

        <QuickActionsFab
          fabOpen={fabOpen}
          setFabOpen={setFabOpen}
          onNewIncome={handleOpenIncome}
          onNewExpense={handleOpenExpense}
          onNewInvestment={handleOpenInvestment}
        />

        <Suspense fallback={null}>
          {modalType === 'settings' && (
            <SettingsModal
              onClose={handleCloseModal}
              editIncome={editIncome} setEditIncome={setEditIncome}
              editBalance={editBalance} setEditBalance={setEditBalance}
              editBudget={editBudget} setEditBudget={setEditBudget}
              onSave={handleSaveSettings}
            />
          )}

          {modalType === 'income' && (
            <AddIncomeModal
              onClose={handleCloseModal}
              newExtraIncome={newExtraIncome}
              setNewExtraIncome={setNewExtraIncome}
              onSubmit={handleAddIncomeSubmit}
            />
          )}

          {modalType === 'expense' && (
            <AddExpenseModal
              onClose={handleCloseModal}
              newExpense={newExpense}
              setNewExpense={setNewExpense}
              onSubmit={handleAddExpenseSubmit}
              aiSmartInput={aiSmartInput}
              setAiSmartInput={setAiSmartInput}
              aiSmartLoading={aiSmartLoading}
              handleSmartExpense={handleSmartExpense}
            />
          )}

          {modalType === 'investment' && (
            <AddInvestmentModal
              onClose={handleCloseModal}
              newInvestment={newInvestment}
              setNewInvestment={setNewInvestment}
              onSubmit={handleAddInvestmentSubmit}
            />
          )}

          {editExpenseModal.isOpen && editExpenseModal.data && (
            <EditExpenseModal
              editExpenseModal={editExpenseModal}
              setEditExpenseModal={setEditExpenseModal}
              onClose={handleCloseEditExpense}
              onSubmit={handleUpdateExpense}
            />
          )}

          {editIncomeModal.isOpen && editIncomeModal.data && (
            <EditIncomeModal
              editIncomeModal={editIncomeModal}
              setEditIncomeModal={setEditIncomeModal}
              onClose={handleCloseEditIncome}
              onSubmit={handleUpdateExtraIncome}
            />
          )}

          {depositModal.isOpen && (
            <DepositModal
              depositModal={depositModal}
              setDepositModal={setDepositModal}
              onClose={handleCloseDeposit}
              onSubmit={handleMakeDeposit}
            />
          )}

          {editInvModal.isOpen && (
            <EditInvestmentModal
              editInvModal={editInvModal}
              setEditInvModal={setEditInvModal}
              onClose={handleCloseEditInv}
              onSubmit={handleUpdateInvestment}
            />
          )}
        </Suspense>

      </div>
    </div>
  );
}

