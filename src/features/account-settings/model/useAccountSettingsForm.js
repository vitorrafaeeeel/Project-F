import { useCallback, useState } from 'react';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';

export function useAccountSettingsForm(data, updateData) {
  const [editIncome, setEditIncome] = useState('');
  const [editIncomeDay, setEditIncomeDay] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editBudget, setEditBudget] = useState('');

  // Sincroniza os campos do formulário sempre que os dados do Firestore mudam.
  const [trackedData, setTrackedData] = useState(data);
  if (data && data !== trackedData) {
    setTrackedData(data);
    setEditIncome(data.income?.toString() || '0');
    setEditIncomeDay(data.incomePaymentDay?.toString() || '');
    setEditBalance((data.currentAccountBalance || 0).toString());
    setEditBudget((data.plannedBudget || 0).toString());
  }

  const handleUpdateAccount = useCallback((closeModal) => {
    const newIncome = parseCurrencyInput(editIncome);
    const newBalance = parseCurrencyInput(editBalance);
    const newBudget = parseCurrencyInput(editBudget);
    const parsedDay = parseInt(editIncomeDay, 10);
    const newIncomeDay = editIncomeDay && !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null;
    if (!isNaN(newIncome) && newIncome >= 0 && !isNaN(newBalance) && !isNaN(newBudget)) {
      updateData?.({ income: newIncome, incomePaymentDay: newIncomeDay, currentAccountBalance: newBalance, plannedBudget: newBudget });
      closeModal?.();
    }
  }, [editIncome, editIncomeDay, editBalance, editBudget, updateData]);

  return { editIncome, setEditIncome, editIncomeDay, setEditIncomeDay, editBalance, setEditBalance, editBudget, setEditBudget, handleUpdateAccount };
}

