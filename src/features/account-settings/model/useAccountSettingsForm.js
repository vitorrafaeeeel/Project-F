import { useCallback, useState } from 'react';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';
import { saveProfile } from '../../../entities/user/model/api.js';

export function useAccountSettingsForm(data, updateData, user, profile) {
  // Dados financeiros
  const [editIncome, setEditIncome] = useState('');
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
    setEditIncome(data.income?.toString() || '0');
    setEditBalance((data.currentAccountBalance || 0).toString());
    setEditBudget((data.plannedBudget || 0).toString());
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

      if (!isNaN(newIncome) && newIncome >= 0 && !isNaN(newBalance) && !isNaN(newBudget)) {
        await updateData?.({
          income: newIncome,
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
  }, [editIncome, editBalance, editBudget, updateData, user, fullName, email, cpf, birthDate, phone, avatarUrl]);

  return {
    editIncome, setEditIncome,
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


