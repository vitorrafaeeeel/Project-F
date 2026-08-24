import { useCallback, useState } from 'react';
import { getTodayDate } from '../../../shared/lib/date.js';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';

const emptyNewExpense = () => ({ desc: '', amount: '', type: 'variable', date: getTodayDate(), paymentMethod: 'pix', installments: 1, deductFromBalance: true, category: 'alimentacao' });

export function useExpenseActions(data, updateData) {
  const [newExpense, setNewExpense] = useState(emptyNewExpense());
  const [editExpenseModal, setEditExpenseModal] = useState({ isOpen: false, data: null });

  const handleAddExpense = useCallback((e, closeModal) => {
    e.preventDefault();
    const amount = parseCurrencyInput(newExpense.amount);
    if (!newExpense.desc || isNaN(amount) || amount <= 0) return;
    const dateStr = newExpense.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    const isCredit = newExpense.paymentMethod === 'credit';
    const doDeduct = !isCredit && newExpense.deductFromBalance;
    const willDeductNow = doDeduct && !isFuture;
    const expense = {
      id: crypto.randomUUID(),
      desc: newExpense.desc.trim(),
      amount,
      type: newExpense.type,
      date: dateStr,
      paymentMethod: newExpense.paymentMethod,
      installments: isCredit ? parseInt(newExpense.installments) || 1 : 1,
      deductedFromBalance: doDeduct,
      appliedToBalance: willDeductNow ? true : (doDeduct ? false : true),
      category: newExpense.category
    };
    let newBalance = data?.currentAccountBalance || 0;
    if (willDeductNow) newBalance -= amount;
    updateData?.({ expenses: [...(data?.expenses || []), expense], currentAccountBalance: newBalance });
    setNewExpense(emptyNewExpense());
    closeModal?.();
  }, [data, newExpense, updateData]);

  const handleUpdateExpense = useCallback((e) => {
    e.preventDefault();
    if (!editExpenseModal.data) return;
    const amount = parseCurrencyInput(editExpenseModal.data.amount);
    if (!editExpenseModal.data.desc || isNaN(amount) || amount <= 0) return;
    const oldExpense = (data?.expenses || []).find(ex => ex.id === editExpenseModal.data.id);
    if (!oldExpense) return;
    let newBalance = data?.currentAccountBalance || 0;
    if (oldExpense.deductedFromBalance && (oldExpense.appliedToBalance === true || oldExpense.appliedToBalance === undefined)) newBalance += oldExpense.amount;
    const dateStr = editExpenseModal.data.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    const isCredit = editExpenseModal.data.paymentMethod === 'credit';
    const doDeduct = !isCredit && editExpenseModal.data.deductFromBalance;
    const willDeductNow = doDeduct && !isFuture;
    if (willDeductNow) newBalance -= amount;
    const updatedExpense = {
       ...oldExpense,
       desc: editExpenseModal.data.desc.trim(),
       amount,
       type: editExpenseModal.data.type,
       date: dateStr,
       paymentMethod: editExpenseModal.data.paymentMethod,
       installments: isCredit ? parseInt(editExpenseModal.data.installments) || 1 : 1,
       category: editExpenseModal.data.category,
       deductedFromBalance: doDeduct,
       appliedToBalance: willDeductNow ? true : (doDeduct ? false : true)
    };
    updateData?.({
      expenses: (data?.expenses || []).map(ex => ex.id === updatedExpense.id ? updatedExpense : ex),
      currentAccountBalance: newBalance
    });
    setEditExpenseModal({ isOpen: false, data: null });
  }, [data, editExpenseModal, updateData]);

  const handleDeleteExpense = useCallback((id) => {
    const expToDelete = (data?.expenses || []).find(e => e.id === id);
    let updatedBalance = data?.currentAccountBalance || 0;
    if (expToDelete && expToDelete.deductedFromBalance && (expToDelete.appliedToBalance === true || expToDelete.appliedToBalance === undefined)) {
        updatedBalance += expToDelete.amount;
    }
    updateData?.({
      expenses: (data?.expenses || []).filter(e => e.id !== id),
      currentAccountBalance: updatedBalance
    });
  }, [data, updateData]);

  return { newExpense, setNewExpense, editExpenseModal, setEditExpenseModal, handleAddExpense, handleUpdateExpense, handleDeleteExpense };
}

