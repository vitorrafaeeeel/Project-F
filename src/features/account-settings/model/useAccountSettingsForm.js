import { useCallback, useState } from 'react';
import { parseCurrencyInput, maskCurrency } from '../../../shared/lib/currency.js';
import { saveProfile } from '../../../entities/user/model/api.js';

export function useAccountSettingsForm(data, updateData, user, profile) {
  // Dados financeiros
  const [editIncome, setEditIncome] = useState('');
  const [editIncomeDay, setEditIncomeDay] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editBudget, setEditBudget] = useState('');

  // Dados de perfil do usuário
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sincroniza campos financeiros durante render
  const [trackedData, setTrackedData] = useState(data);
  if (data && data !== trackedData) {
    setTrackedData(data);
    setEditIncome(maskCurrency(data.income) || '0,00');
    setEditIncomeDay(data.incomePaymentDay?.toString() || '');
    setEditBalance(maskCurrency(data.currentAccountBalance) || '0,00');
    setEditBudget(maskCurrency(data.plannedBudget) || '0,00');
  }

  // Sincroniza campos de perfil durante render
  const [trackedProfile, setTrackedProfile] = useState(profile);
  const [trackedUser, setTrackedUser] = useState(user);
  if ((profile && profile !== trackedProfile) || (user && user !== trackedUser)) {
    setTrackedProfile(profile);
    setTrackedUser(user);
    setFullName(profile?.fullName || user?.displayName || '');
    setEmail(profile?.email || user?.email || '');
    setCpf(profile?.cpf || '');
    setBirthDate(profile?.birthDate || '');
    setPhone(profile?.phone || '');
    setAvatarUrl(profile?.avatarUrl || user?.photoURL || '');
  }

  const handleUpdateAccount = useCallback(async (closeModal) => {
    setIsSaving(true);
    try {
      const newIncome = parseCurrencyInput(editIncome);
      const newBalance = parseCurrencyInput(editBalance);
      const newBudget = parseCurrencyInput(editBudget);
      const parsedDay = parseInt(editIncomeDay, 10);
      const newIncomeDay = editIncomeDay && !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null;

      if (!isNaN(newIncome) && newIncome >= 0 && !isNaN(newBalance) && !isNaN(newBudget)) {
        await updateData?.({
          income: newIncome,
          incomePaymentDay: newIncomeDay,
          currentAccountBalance: newBalance,
          plannedBudget: newBudget
        });
      }

      if (user?.uid) {
        await saveProfile(user.uid, {
          fullName: fullName.trim(),
          email: email.trim(),
          cpf: cpf.trim(),
          birthDate: birthDate.trim(),
          phone: phone.trim(),
          avatarUrl: avatarUrl.trim()
        });
      }

      closeModal?.();
    } catch (error) {
      console.error('Erro ao salvar configuracoes:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editIncome, editIncomeDay, editBalance, editBudget, updateData, user, fullName, email, cpf, birthDate, phone, avatarUrl]);

  return {
    editIncome, setEditIncome,
    editIncomeDay, setEditIncomeDay,
    editBalance, setEditBalance,
    editBudget, setEditBudget,
    fullName, setFullName,
    email, setEmail,
    cpf, setCpf,
    birthDate, setBirthDate,
    phone, setPhone,
    avatarUrl, setAvatarUrl,
    isSaving,
    handleUpdateAccount
  };
}


