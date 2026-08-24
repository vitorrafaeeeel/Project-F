import { useCallback, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../../shared/api/firebase/client.js';
import { getAuthErrorMessage } from '../../../shared/lib/authErrors.js';
import { saveProfile } from '../../../entities/user/model/api.js';

export function useAuthActions(user) {
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const resetMessages = useCallback(() => {
    setAuthError('');
    setAuthSuccess('');
  }, []);

  // Limpa mensagens de erro/sucesso sempre que o usuário autenticado muda.
  const [trackedUser, setTrackedUser] = useState(user);
  if (user !== trackedUser) {
    setTrackedUser(user);
    resetMessages();
  }

  const handleAuthSubmit = useCallback(async ({ fullName, birthDate, cpf, email, phone, password, mode }) => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await saveProfile(userCredential.user.uid, {
          fullName: fullName.trim(),
          birthDate,
          cpf: cpf.trim(),
          email: email.trim(),
          phone: phone.trim(),
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Auth Service Error]:', {
          code: error.code,
          message: error.message
        });
      }
      setAuthError(getAuthErrorMessage(error.code));
    } finally {
      setAuthLoading(false);
    }
  }, []);


  const handlePasswordReset = useCallback(async (email) => {
    setAuthError('');
    setAuthSuccess('');

    if (!email.trim()) {
      setAuthError(getAuthErrorMessage('auth/missing-email'));
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthSuccess('Enviamos um link de redefinicao para o seu e-mail.');
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(getAuthErrorMessage(error.code));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  return { authLoading, authError, authSuccess, handleAuthSubmit, handlePasswordReset, resetMessages };
}
