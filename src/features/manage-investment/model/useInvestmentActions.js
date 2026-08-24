import { useState } from 'react';

const emptyNewInvestment = () => ({ desc: '', monthlyAmount: '', currentBalance: '', interestRate: '0.8' });

export function useInvestmentActions(data, updateData) {
  const [newInvestment, setNewInvestment] = useState(emptyNewInvestment());
  const [depositModal, setDepositModal] = useState({ isOpen: false, invId: null, amount: '' });
  const [editInvModal, setEditInvModal] = useState({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' });

  const handleAddInvestment = (e, closeModal) => {
    e.preventDefault();
    const monthlyAmount = parseFloat(newInvestment.monthlyAmount.replace(',', '.'));
    const currentBalance = parseFloat(newInvestment.currentBalance.replace(',', '.')) || 0;
    const interestRate = parseFloat(newInvestment.interestRate.replace(',', '.')) || 0;
    if (!newInvestment.desc || isNaN(monthlyAmount) || monthlyAmount < 0) return;
    const investment = { id: crypto.randomUUID(), desc: newInvestment.desc, monthlyAmount, currentBalance, interestRate: interestRate / 100 };
    updateData({ investments: [...(data.investments || []), investment] });
    setNewInvestment(emptyNewInvestment());
    closeModal?.();
  };

  const handleMakeDeposit = (e) => {
    e.preventDefault();
    const depositAmount = parseFloat(depositModal.amount.replace(',', '.'));
    if (isNaN(depositAmount) || depositAmount <= 0) return;
    const updatedInvestments = (data.investments || []).map(inv => inv.id === depositModal.invId ? { ...inv, currentBalance: inv.currentBalance + depositAmount } : inv);
    updateData({ investments: updatedInvestments });
    setDepositModal({ isOpen: false, invId: null, amount: '' });
  };

  const handleUpdateInvestment = (e) => {
    e.preventDefault();
    const amount = parseFloat(String(editInvModal.monthlyAmount).replace(',', '.'));
    const rate = parseFloat(String(editInvModal.interestRate).replace(',', '.'));
    if (!editInvModal.desc || isNaN(amount) || amount < 0) return;
    const updatedInvestments = (data.investments || []).map(inv => inv.id === editInvModal.id ? { ...inv, desc: editInvModal.desc, monthlyAmount: amount, interestRate: isNaN(rate) ? inv.interestRate : rate / 100 } : inv);
    updateData({ investments: updatedInvestments });
    setEditInvModal({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' });
  };

  const handleDeleteInvestment = (id) => {
    updateData({ investments: (data.investments || []).filter(i => i.id !== id) });
  };

  return {
    newInvestment, setNewInvestment,
    depositModal, setDepositModal,
    editInvModal, setEditInvModal,
    handleAddInvestment, handleMakeDeposit, handleUpdateInvestment, handleDeleteInvestment
  };
}
