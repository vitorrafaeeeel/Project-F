import { useCallback, useState } from 'react';
import { getTodayDate } from '../../../shared/lib/date.js';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';

const emptyNewIncome = () => ({ desc: '', amount: '', date: getTodayDate() });

export function useIncomeActions(data, updateData) {
  const [newExtraIncome, setNewExtraIncome] = useState(emptyNewIncome());
  const [editIncomeModal, setEditIncomeModal] = useState({ isOpen: false, data: null });

  const handleAddExtraIncome = useCallback((e, closeModal) => {
    e.preventDefault();
    const amount = parseCurrencyInput(newExtraIncome.amount);
    if (!newExtraIncome.desc || isNaN(amount) || amount <= 0) return;
    const dateStr = newExtraIncome.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    const newIncome = {
      id: crypto.randomUUID(),
      desc: newExtraIncome.desc.trim(),
      amount,
      date: dateStr,
      appliedToBalance: !isFuture
    };
    let newBalance = data?.currentAccountBalance || 0;
    if (!isFuture) newBalance += amount;
    updateData?.({ extraIncomes: [...(data?.extraIncomes || []), newIncome], currentAccountBalance: newBalance });
    setNewExtraIncome(emptyNewIncome());
    closeModal?.();
  }, [data, newExtraIncome, updateData]);

  const handleUpdateExtraIncome = useCallback((e) => {
    e.preventDefault();
    if (!editIncomeModal.data) return;
    const amount = parseCurrencyInput(editIncomeModal.data.amount);
    if (!editIncomeModal.data.desc || isNaN(amount) || amount <= 0) return;
    const oldIncome = (data?.extraIncomes || []).find(i => i.id === editIncomeModal.data.id);
    if (!oldIncome) return;
    let newBalance = data?.currentAccountBalance || 0;
    if (oldIncome.appliedToBalance === true || oldIncome.appliedToBalance === undefined) newBalance -= oldIncome.amount;
    const dateStr = editIncomeModal.data.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    if (!isFuture) newBalance += amount;
    const updatedIncome = {
      ...oldIncome,
      desc: editIncomeModal.data.desc.trim(),
      amount,
      date: dateStr,
      appliedToBalance: !isFuture
    };
    updateData?.({
      extraIncomes: (data?.extraIncomes || []).map(i => i.id === updatedIncome.id ? updatedIncome : i),
      currentAccountBalance: newBalance
    });
    setEditIncomeModal({ isOpen: false, data: null });
  }, [data, editIncomeModal, updateData]);

  const handleDeleteExtraIncome = useCallback((id) => {
    const currentExtras = data?.extraIncomes || [];
    const incomeToDelete = currentExtras.find(e => e.id === id);
    let updatedBalance = data?.currentAccountBalance || 0;
    if (incomeToDelete && (incomeToDelete.appliedToBalance === true || incomeToDelete.appliedToBalance === undefined)) {
        updatedBalance -= incomeToDelete.amount;
    }
    updateData?.({
      extraIncomes: currentExtras.filter(e => e.id !== id),
      currentAccountBalance: updatedBalance
    });
  }, [data, updateData]);

  return { newExtraIncome, setNewExtraIncome, editIncomeModal, setEditIncomeModal, handleAddExtraIncome, handleUpdateExtraIncome, handleDeleteExtraIncome };
}

