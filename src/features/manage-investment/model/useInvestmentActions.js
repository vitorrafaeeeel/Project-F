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
    const currentBalance = parseCurrencyInput(newInvestment.currentBalance);
    const interestRate = parseCurrencyInput(newInvestment.interestRate);
    if (!newInvestment.desc || isNaN(monthlyAmount) || monthlyAmount < 0) return;
    const investment = {
      id: crypto.randomUUID(),
      desc: newInvestment.desc.trim(),
      monthlyAmount,
      currentBalance,
      interestRate: interestRate / 100
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
    const rate = parseCurrencyInput(editInvModal.interestRate);
    if (!editInvModal.desc || isNaN(amount) || amount < 0) return;
    const updatedInvestments = (data?.investments || []).map(inv =>
      inv.id === editInvModal.id
        ? { ...inv, desc: editInvModal.desc.trim(), monthlyAmount: amount, interestRate: isNaN(rate) ? inv.interestRate : rate / 100 }
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

