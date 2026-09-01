import { useCallback, useState } from 'react';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';

const emptyNewInvestment = () => ({ desc: '', monthlyAmount: '', currentBalance: '', interestRate: '0.8' });

export function useInvestmentActions(data, updateData) {
  const [newInvestment, setNewInvestment] = useState(emptyNewInvestment());
  const [depositModal, setDepositModal] = useState({ isOpen: false, invId: null, amount: '' });
  const [editInvModal, setEditInvModal] = useState({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' });

  const handleAddInvestment = useCallback((e, closeModal) => {
    e.preventDefault();
    const monthlyAmount = parseCurrencyInput(newInvestment.monthlyAmount);
    const rawBalance = parseCurrencyInput(newInvestment.currentBalance);
    const rawRate = parseCurrencyInput(newInvestment.interestRate);
    if (!newInvestment.desc || !newInvestment.desc.trim()) return;
    const investment = {
      id: crypto.randomUUID(),
      desc: newInvestment.desc.trim(),
      monthlyAmount: isNaN(monthlyAmount) || monthlyAmount < 0 ? 0 : monthlyAmount,
      currentBalance: isNaN(rawBalance) || rawBalance < 0 ? 0 : rawBalance,
      interestRate: isNaN(rawRate) || rawRate < 0 ? 0.008 : rawRate / 100
    };
    updateData?.({ investments: [...(data?.investments || []), investment] });
    setNewInvestment(emptyNewInvestment());
    closeModal?.();
  }, [data, newInvestment, updateData]);

  const handleMakeDeposit = useCallback((e) => {
    e.preventDefault();
    const depositAmount = parseCurrencyInput(depositModal.amount);
    if (isNaN(depositAmount) || depositAmount <= 0) return;
    const updatedInvestments = (data?.investments || []).map(inv =>
      inv.id === depositModal.invId ? { ...inv, currentBalance: (inv.currentBalance || 0) + depositAmount } : inv
    );
    updateData?.({ investments: updatedInvestments });
    setDepositModal({ isOpen: false, invId: null, amount: '' });
  }, [data, depositModal, updateData]);

  const handleUpdateInvestment = useCallback((e) => {
    e.preventDefault();
    const amount = parseCurrencyInput(editInvModal.monthlyAmount);
    const rawRate = parseCurrencyInput(editInvModal.interestRate);
    if (!editInvModal.desc || !editInvModal.desc.trim()) return;
    const updatedInvestments = (data?.investments || []).map(inv =>
      inv.id === editInvModal.id
        ? {
            ...inv,
            desc: editInvModal.desc.trim(),
            monthlyAmount: isNaN(amount) || amount < 0 ? 0 : amount,
            interestRate: isNaN(rawRate) || rawRate < 0 ? inv.interestRate : rawRate / 100
          }
        : inv
    );
    updateData?.({ investments: updatedInvestments });
    setEditInvModal({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' });
  }, [data, editInvModal, updateData]);

  const handleDeleteInvestment = useCallback((id) => {
    updateData?.({ investments: (data?.investments || []).filter(i => i.id !== id) });
  }, [data, updateData]);

  return {
    newInvestment, setNewInvestment,
    depositModal, setDepositModal,
    editInvModal, setEditInvModal,
    handleAddInvestment, handleMakeDeposit, handleUpdateInvestment, handleDeleteInvestment
  };
}

