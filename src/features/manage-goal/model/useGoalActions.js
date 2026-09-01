import { useCallback, useState } from 'react';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';

export const emptyGoal = () => ({
  id: null,
  title: '',
  targetAmount: '',
  currentAmount: '',
  deadlineMonths: '12',
  category: 'outros'
});

export function useGoalActions(data, updateData) {
  const [goalModal, setGoalModal] = useState({
    isOpen: false,
    mode: 'add',
    data: emptyGoal()
  });

  const handleOpenAddGoal = useCallback((initialValues = {}) => {
    setGoalModal({
      isOpen: true,
      mode: 'add',
      data: { ...emptyGoal(), ...initialValues }
    });
  }, []);

  const handleOpenEditGoal = useCallback((goal) => {
    setGoalModal({
      isOpen: true,
      mode: 'edit',
      data: {
        id: goal.id,
        title: goal.title || goal.name || '',
        targetAmount: goal.targetAmount != null ? goal.targetAmount.toString() : '',
        currentAmount: goal.currentAmount != null ? goal.currentAmount.toString() : '',
        deadlineMonths: goal.deadlineMonths != null ? goal.deadlineMonths.toString() : '12',
        category: goal.category || 'outros'
      }
    });
  }, []);

  const handleCloseGoalModal = useCallback(() => {
    setGoalModal({
      isOpen: false,
      mode: 'add',
      data: emptyGoal()
    });
  }, []);

  const handleSaveGoal = useCallback((e, closeModal) => {
    if (e?.preventDefault) e.preventDefault();

    const currentForm = goalModal.data;
    if (!currentForm.title || !currentForm.title.trim()) return;

    const parsedTarget = parseCurrencyInput(currentForm.targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;

    const parsedCurrent = parseCurrencyInput(currentForm.currentAmount);
    const validCurrent = isNaN(parsedCurrent) || parsedCurrent < 0 ? 0 : parsedCurrent;

    const parsedMonths = parseInt(currentForm.deadlineMonths, 10);
    const validMonths = isNaN(parsedMonths) || parsedMonths <= 0 ? 12 : parsedMonths;

    const currentGoals = Array.isArray(data?.goals) ? data.goals : [];

    let updatedGoals;
    if (goalModal.mode === 'edit' && currentForm.id) {
      updatedGoals = currentGoals.map(g => (g.id === currentForm.id ? {
        ...g,
        title: currentForm.title.trim(),
        targetAmount: parsedTarget,
        currentAmount: validCurrent,
        deadlineMonths: validMonths,
        category: currentForm.category || 'outros',
        updatedAt: new Date().toISOString()
      } : g));
    } else {
      const newGoal = {
        id: crypto.randomUUID(),
        title: currentForm.title.trim(),
        targetAmount: parsedTarget,
        currentAmount: validCurrent,
        deadlineMonths: validMonths,
        category: currentForm.category || 'outros',
        createdAt: new Date().toISOString()
      };
      updatedGoals = [...currentGoals, newGoal];
    }

    updateData?.({ goals: updatedGoals });
    handleCloseGoalModal();
    closeModal?.();
  }, [data, goalModal, updateData, handleCloseGoalModal]);

  const handleDeleteGoal = useCallback((id) => {
    const currentGoals = Array.isArray(data?.goals) ? data.goals : [];
    const updatedGoals = currentGoals.filter(g => g.id !== id);
    updateData?.({ goals: updatedGoals });
  }, [data, updateData]);

  const handleDepositToGoal = useCallback((id, amount) => {
    const depositValue = typeof amount === 'number' ? amount : parseCurrencyInput(amount);
    if (isNaN(depositValue) || depositValue <= 0) return;

    const currentGoals = Array.isArray(data?.goals) ? data.goals : [];
    const updatedGoals = currentGoals.map(g => {
      if (g.id === id) {
        const newCurrent = (g.currentAmount || 0) + depositValue;
        return {
          ...g,
          currentAmount: newCurrent,
          updatedAt: new Date().toISOString()
        };
      }
      return g;
    });

    updateData?.({ goals: updatedGoals });
  }, [data, updateData]);

  return {
    goalModal,
    setGoalModal,
    handleOpenAddGoal,
    handleOpenEditGoal,
    handleCloseGoalModal,
    handleSaveGoal,
    handleDeleteGoal,
    handleDepositToGoal
  };
}
