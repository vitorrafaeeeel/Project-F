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
import { computeCategoryUsage } from '../entities/finance/lib/categoryUsage.js';
import { useProfile } from '../entities/user/model/useProfile.js';
import { getFirstName } from '../entities/user/model/getFirstName.js';

import { useTheme } from '../features/theme/model/useTheme.js';
import { useAuthActions } from '../features/auth/model/useAuthActions.js';
import { useExpenseActions } from '../features/manage-expense/model/useExpenseActions.js';
import { useIncomeActions } from '../features/manage-income/model/useIncomeActions.js';
import { useInvestmentActions } from '../features/manage-investment/model/useInvestmentActions.js';
import { useAccountSettingsForm } from '../features/account-settings/model/useAccountSettingsForm.js';
import { useCategoryBudgetsForm } from '../features/manage-category-budgets/model/useCategoryBudgetsForm.js';
import { useSalaryActions } from '../features/manage-salary/model/useSalaryActions.js';
import { useGoalActions } from '../features/manage-goal/model/useGoalActions.js';

import { Header } from '../widgets/header/ui/Header.jsx';
import { QuickActionsFab } from '../widgets/quick-actions-fab/ui/QuickActionsFab.jsx';

// Lazy loading das páginas e modais para divisão de chunks e carregamento otimizado
const AuthPage = lazy(() => import('../pages/auth/ui/AuthPage.jsx').then(m => ({ default: m.AuthPage })));
const DashboardPage = lazy(() => import('../pages/dashboard/ui/DashboardPage.jsx').then(m => ({ default: m.DashboardPage })));
const CalendarPage = lazy(() => import('../pages/calendar/ui/CalendarPage.jsx').then(m => ({ default: m.CalendarPage })));
const ExpensesPage = lazy(() => import('../pages/expenses/ui/ExpensesPage.jsx').then(m => ({ default: m.ExpensesPage })));
const InvestmentsPage = lazy(() => import('../pages/investments/ui/InvestmentsPage.jsx').then(m => ({ default: m.InvestmentsPage })));
const GoalsPage = lazy(() => import('../pages/goals/ui/GoalsPage.jsx').then(m => ({ default: m.GoalsPage })));

const SettingsModal = lazy(() => import('../features/account-settings/ui/SettingsModal.jsx').then(m => ({ default: m.SettingsModal })));
const CategoryBudgetsModal = lazy(() => import('../features/manage-category-budgets/ui/CategoryBudgetsModal.jsx').then(m => ({ default: m.CategoryBudgetsModal })));
const SalaryModal = lazy(() => import('../features/manage-salary/ui/SalaryModal.jsx').then(m => ({ default: m.SalaryModal })));
const AddIncomeModal = lazy(() => import('../features/manage-income/ui/AddIncomeModal.jsx').then(m => ({ default: m.AddIncomeModal })));
const EditIncomeModal = lazy(() => import('../features/manage-income/ui/EditIncomeModal.jsx').then(m => ({ default: m.EditIncomeModal })));
const AddExpenseModal = lazy(() => import('../features/manage-expense/ui/AddExpenseModal.jsx').then(m => ({ default: m.AddExpenseModal })));
const EditExpenseModal = lazy(() => import('../features/manage-expense/ui/EditExpenseModal.jsx').then(m => ({ default: m.EditExpenseModal })));
const AddInvestmentModal = lazy(() => import('../features/manage-investment/ui/AddInvestmentModal.jsx').then(m => ({ default: m.AddInvestmentModal })));
const EditInvestmentModal = lazy(() => import('../features/manage-investment/ui/EditInvestmentModal.jsx').then(m => ({ default: m.EditInvestmentModal })));
const DepositModal = lazy(() => import('../features/manage-investment/ui/DepositModal.jsx').then(m => ({ default: m.DepositModal })));
const GoalModal = lazy(() => import('../features/manage-goal/ui/GoalModal.jsx').then(m => ({ default: m.GoalModal })));
const DepositGoalModal = lazy(() => import('../features/manage-goal/ui/DepositGoalModal.jsx').then(m => ({ default: m.DepositGoalModal })));

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
  const [settingsSection, setSettingsSection] = useState('profile');
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
  const handleCloseModal = useCallback(() => {
    setModalType(null);
  }, []);

  const handleOpenSettings = useCallback((section = 'profile') => {
    setSettingsSection(section);
    setModalType('settings');
  }, []);

  const handleOpenIncome = useCallback(() => {
    setModalType('income');
  }, []);

  const handleOpenExpense = useCallback(() => {
    setModalType('expense');
  }, []);

  const handleOpenInvestment = useCallback(() => {
    setModalType('investment');
  }, []);

  const handleOpenCategoryBudgets = useCallback(() => {
    setModalType('categoryBudgets');
  }, []);

  // --- HOOKS DE ENTIDADES ---
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
    editIncome, setEditIncome,
    editIncomeDay, setEditIncomeDay,
    editBalance, setEditBalance,
    editBudget, setEditBudget,
    fullName, setFullName,
    email,
    cpf, setCpf,
    birthDate, setBirthDate,
    phone, setPhone,
    avatarUrl, setAvatarUrl,
    isSaving,
    handleUpdateAccount
  } = useAccountSettingsForm(data, updateData, user, profile);

  const {
    rows: categoryBudgetRows,
    addRow: addCategoryBudgetRow,
    updateRow: updateCategoryBudgetRow,
    removeRow: removeCategoryBudgetRow,
    handleSaveCategoryBudgets,
    plannedBudget: formPlannedBudget,
    totalAllocated: totalCategoryBudgetAllocated,
    remainingToAllocate: remainingCategoryBudgetAllocate,
    isOverBudget: isCategoryBudgetOver,
    allocationRatio: categoryBudgetAllocationRatio,
    allocationPercentage: categoryBudgetAllocationPercentage
  } = useCategoryBudgetsForm(data, updateData);

  const {
    salaryModal,
    setSalaryModal,
    handleOpenAddSalary,
    handleOpenEditSalary,
    handleCloseSalaryModal,
    handleSaveSalary,
    handleDeleteSalary
  } = useSalaryActions(data, updateData);

  const {
    goalModal,
    setGoalModal,
    handleOpenAddGoal,
    handleOpenEditGoal,
    handleCloseGoalModal,
    handleSaveGoal,
    handleDeleteGoal,
    handleDepositToGoal
  } = useGoalActions(data, updateData);

  const [depositGoalModal, setDepositGoalModal] = useState({ isOpen: false, goal: null });
  const handleOpenDepositGoal = useCallback((goal) => {
    setDepositGoalModal({ isOpen: true, goal });
  }, []);
  const handleCloseDepositGoal = useCallback(() => {
    setDepositGoalModal({ isOpen: false, goal: null });
  }, []);

  const handleOpenGoalsTab = useCallback(() => {
    setActiveTab('goals');
  }, []);

  const handleSaveSettings = useCallback(() => {
    handleUpdateAccount(handleCloseModal);
  }, [handleUpdateAccount, handleCloseModal]);

  const handleSaveCategoryBudgetsSubmit = useCallback(() => {
    handleSaveCategoryBudgets(handleCloseModal);
  }, [handleSaveCategoryBudgets, handleCloseModal]);

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
  const filteredImpact = useMemo(() => computeFilteredImpact(filteredExpenses, projections, expenseFilter), [filteredExpenses, projections, expenseFilter]);
  const categoryUsage = useMemo(() => computeCategoryUsage(data, projections), [data, projections]);

  const totalInvestmentsBalance = useMemo(
    () => projections?.totalInvestmentsBalance ?? (data?.investments || []).reduce((acc, inv) => acc + (inv.currentBalance || 0), 0),
    [projections?.totalInvestmentsBalance, data?.investments]
  );

  const totalInvestmentMonthly = useMemo(
    () => projections?.totalInvestmentMonthly ?? (data?.investments || []).reduce((acc, inv) => acc + (inv.monthlyAmount || 0), 0),
    [projections?.totalInvestmentMonthly, data?.investments]
  );

  const averageInterestRate = useMemo(() => {
    const invs = data?.investments || [];
    if (invs.length === 0) return 0.008;
    const totalBal = invs.reduce((acc, i) => acc + (i.currentBalance || 0), 0);
    if (totalBal > 0) {
      return invs.reduce((acc, i) => acc + ((i.currentBalance || 0) * (i.interestRate || 0.008)), 0) / totalBal;
    }
    return invs.reduce((acc, i) => acc + (i.interestRate || 0.008), 0) / invs.length;
  }, [data?.investments]);

  const financialStats = useMemo(() => {
    const currentMonthStats = projections?.currentMonthStats;
    const monthTotalIncome = currentMonthStats?.monthTotalIncome || 0;
    const monthTotalExpenses = currentMonthStats?.monthTotalExpenses || 0;
    const netSavings = monthTotalIncome - monthTotalExpenses;
    return {
      monthTotalIncome,
      monthTotalExpenses,
      netSavings,
      totalInvestmentsBalance,
      totalInvestmentMonthly,
      averageInterestRate
    };
  }, [projections, totalInvestmentsBalance, totalInvestmentMonthly, averageInterestRate]);

  const firstName = getFirstName(profile, user);

  // --- RENDER ---
  if (startupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200 p-6">
        <div className="w-full max-w-lg rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 p-6 shadow-sm">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 font-sans relative pb-20 transition-colors duration-300">

        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          firstName={firstName}
          profile={profile}
          user={user}
          onOpenSettings={handleOpenSettings}
          onLogout={handleLogout}
        />

        <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={<PageLoadingFallback />}>
            {activeTab === 'dashboard' && (
              <DashboardPage
                projections={projections}
                data={data}
                categoryUsage={categoryUsage}
                onOpenCategoryBudgets={handleOpenCategoryBudgets}
                onOpenSettings={handleOpenSettings}
                onOpenNewGoal={handleOpenAddGoal}
                onOpenGoalsTab={handleOpenGoalsTab}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarPage
                calendarData={calendarData}
                calendarOffset={calendarOffset}
                setCalendarOffset={setCalendarOffset}
                setEditExpenseModal={setEditExpenseModal}
                setEditIncomeModal={setEditIncomeModal}
              />
            )}
            {activeTab === 'expenses' && (
              <ExpensesPage
                data={data}
                expenseFilter={expenseFilter}
                setExpenseFilter={setExpenseFilter}
                filteredImpact={filteredImpact}
                filteredExpenses={filteredExpenses}
                setEditIncomeModal={setEditIncomeModal}
                handleDeleteExtraIncome={handleDeleteExtraIncome}
                setEditExpenseModal={setEditExpenseModal}
                handleDeleteExpense={handleDeleteExpense}
                onOpenAddIncome={handleOpenIncome}
                onOpenAddSalary={handleOpenAddSalary}
                onOpenEditSalary={handleOpenEditSalary}
                handleDeleteSalary={handleDeleteSalary}
              />
            )}
            {activeTab === 'investments' && (
              <InvestmentsPage
                data={data}
                projections={projections}
                onNewInvestment={handleOpenInvestment}
                setEditInvModal={setEditInvModal}
                setDepositModal={setDepositModal}
                handleDeleteInvestment={handleDeleteInvestment}
              />
            )}
            {activeTab === 'goals' && (
              <GoalsPage
                data={data}
                projections={projections}
                onNewGoal={handleOpenAddGoal}
                onEditGoal={handleOpenEditGoal}
                onDeleteGoal={handleDeleteGoal}
                onOpenDepositGoal={handleOpenDepositGoal}
              />
            )}
          </Suspense>
        </main>

        <QuickActionsFab
          fabOpen={fabOpen}
          setFabOpen={setFabOpen}
          onNewSalary={handleOpenAddSalary}
          onNewIncome={handleOpenIncome}
          onNewExpense={handleOpenExpense}
          onNewInvestment={handleOpenInvestment}
          onNewGoal={handleOpenAddGoal}
        />

        <Suspense fallback={null}>
          {salaryModal.isOpen && (
            <SalaryModal
              isOpen={salaryModal.isOpen}
              mode={salaryModal.mode}
              salaryData={salaryModal.data}
              setSalaryData={setSalaryModal}
              onClose={handleCloseSalaryModal}
              onSubmit={handleSaveSalary}
            />
          )}

          {goalModal.isOpen && (
            <GoalModal
              isOpen={goalModal.isOpen}
              mode={goalModal.mode}
              goalData={goalModal.data}
              setGoalData={setGoalModal}
              onClose={handleCloseGoalModal}
              onSubmit={handleSaveGoal}
              financialStats={financialStats}
            />
          )}

          {depositGoalModal.isOpen && depositGoalModal.goal && (
            <DepositGoalModal
              isOpen={depositGoalModal.isOpen}
              goal={depositGoalModal.goal}
              onClose={handleCloseDepositGoal}
              onDeposit={handleDepositToGoal}
            />
          )}

          {modalType === 'settings' && (
            <SettingsModal
              onClose={handleCloseModal}
              initialSection={settingsSection}
              editIncome={editIncome} setEditIncome={setEditIncome}
              editIncomeDay={editIncomeDay} setEditIncomeDay={setEditIncomeDay}
              editBalance={editBalance} setEditBalance={setEditBalance}
              editBudget={editBudget} setEditBudget={setEditBudget}
              fullName={fullName} setFullName={setFullName}
              email={email}
              cpf={cpf} setCpf={setCpf}
              birthDate={birthDate} setBirthDate={setBirthDate}
              phone={phone} setPhone={setPhone}
              avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl}
              isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
              isSaving={isSaving}
              onSave={handleSaveSettings}
            />
          )}

          {modalType === 'categoryBudgets' && (
            <CategoryBudgetsModal
              onClose={handleCloseModal}
              rows={categoryBudgetRows}
              addRow={addCategoryBudgetRow}
              updateRow={updateCategoryBudgetRow}
              removeRow={removeCategoryBudgetRow}
              onSave={handleSaveCategoryBudgetsSubmit}
              plannedBudget={formPlannedBudget}
              totalAllocated={totalCategoryBudgetAllocated}
              remainingToAllocate={remainingCategoryBudgetAllocate}
              isOverBudget={isCategoryBudgetOver}
              allocationRatio={categoryBudgetAllocationRatio}
              allocationPercentage={categoryBudgetAllocationPercentage}
              onOpenSettings={() => {
                handleCloseModal();
                handleOpenSettings('finance');
              }}
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

