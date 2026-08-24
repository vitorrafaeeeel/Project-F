import { useState } from 'react';

export function useAccountSettingsForm(data, updateData) {
  const [editIncome, setEditIncome] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editBudget, setEditBudget] = useState('');

  // Sincroniza os campos do formulário sempre que os dados do Firestore mudam.
  const [trackedData, setTrackedData] = useState(data);
  if (data && data !== trackedData) {
    setTrackedData(data);
    setEditIncome(data.income?.toString() || '0');
    setEditBalance((data.currentAccountBalance || 0).toString());
    setEditBudget((data.plannedBudget || 0).toString());
  }

  const handleUpdateAccount = (closeModal) => {
    const newIncome = parseFloat(editIncome.replace(',', '.'));
    const newBalance = parseFloat(editBalance.replace(',', '.'));
    const newBudget = parseFloat(editBudget.replace(',', '.'));
    if (!isNaN(newIncome) && newIncome >= 0 && !isNaN(newBalance) && !isNaN(newBudget)) {
      updateData({ income: newIncome, currentAccountBalance: newBalance, plannedBudget: newBudget });
      closeModal?.();
    }
  };

  return { editIncome, setEditIncome, editBalance, setEditBalance, editBudget, setEditBudget, handleUpdateAccount };
}
