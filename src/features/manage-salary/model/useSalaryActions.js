import { useCallback, useState } from 'react';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';

export function getSalaries(data) {
  if (data?.salaries && Array.isArray(data.salaries) && data.salaries.length > 0) {
    return data.salaries;
  }
  if (data?.income && data.income > 0) {
    return [{
      id: 'default-salary',
      name: 'Salário Principal',
      amount: data.income,
      paymentDay: data.incomePaymentDay || 5
    }];
  }
  return [];
}

const emptySalary = () => ({ id: null, name: '', amount: '', paymentDay: '' });

export function useSalaryActions(data, updateData) {
  const [salaryModal, setSalaryModal] = useState({ isOpen: false, mode: 'add', data: emptySalary() });

  const handleOpenAddSalary = useCallback(() => {
    setSalaryModal({ isOpen: true, mode: 'add', data: emptySalary() });
  }, []);

  const handleOpenEditSalary = useCallback((salary) => {
    setSalaryModal({
      isOpen: true,
      mode: 'edit',
      data: {
        id: salary.id,
        name: salary.name || '',
        amount: salary.amount ? salary.amount.toString() : '',
        paymentDay: salary.paymentDay ? salary.paymentDay.toString() : ''
      }
    });
  }, []);

  const handleCloseSalaryModal = useCallback(() => {
    setSalaryModal({ isOpen: false, mode: 'add', data: emptySalary() });
  }, []);

  const handleSaveSalary = useCallback((e, closeModal) => {
    if (e?.preventDefault) e.preventDefault();
    const currentData = salaryModal.data;
    if (!currentData.name) return;
    const parsedAmount = parseCurrencyInput(currentData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const parsedDay = parseInt(currentData.paymentDay, 10);
    const validDay = !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null;

    const currentSalaries = getSalaries(data);

    let updatedSalaries;
    if (salaryModal.mode === 'edit' && currentData.id) {
      updatedSalaries = currentSalaries.map(s => s.id === currentData.id ? {
        ...s,
        name: currentData.name.trim(),
        amount: parsedAmount,
        paymentDay: validDay
      } : s);
    } else {
      const newSalary = {
        id: crypto.randomUUID(),
        name: currentData.name.trim(),
        amount: parsedAmount,
        paymentDay: validDay
      };
      updatedSalaries = [...currentSalaries, newSalary];
    }

    const totalIncome = updatedSalaries.reduce((sum, s) => sum + s.amount, 0);

    updateData?.({
      salaries: updatedSalaries,
      income: totalIncome,
      incomePaymentDay: updatedSalaries[0]?.paymentDay || null
    });

    handleCloseSalaryModal();
    closeModal?.();
  }, [data, salaryModal, updateData, handleCloseSalaryModal]);

  const handleDeleteSalary = useCallback((id) => {
    const currentSalaries = getSalaries(data);
    const updatedSalaries = currentSalaries.filter(s => s.id !== id);
    const totalIncome = updatedSalaries.reduce((sum, s) => sum + s.amount, 0);

    updateData?.({
      salaries: updatedSalaries,
      income: totalIncome,
      incomePaymentDay: updatedSalaries[0]?.paymentDay || null
    });
  }, [data, updateData]);

  return {
    salaryModal,
    setSalaryModal,
    handleOpenAddSalary,
    handleOpenEditSalary,
    handleCloseSalaryModal,
    handleSaveSalary,
    handleDeleteSalary
  };
}
