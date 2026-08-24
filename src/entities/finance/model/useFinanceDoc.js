import { useEffect, useState } from 'react';
import { onSnapshot, setDoc } from 'firebase/firestore';
import { getFinanceDocRef } from './api.js';
import { DEFAULT_DATA } from './constants.js';

export function useFinanceDoc(user) {
  const [data, setData] = useState(null);
  const [financeLoaded, setFinanceLoaded] = useState(false);
  const [financeError, setFinanceError] = useState('');

  // Reseta o estado assim que o usuário muda (login/logout/troca de conta),
  // para não exibir dados de outra sessão enquanto a nova assinatura carrega.
  const [trackedUser, setTrackedUser] = useState(user);
  if (user !== trackedUser) {
    setTrackedUser(user);
    setData(null);
    setFinanceLoaded(false);
    setFinanceError('');
  }

  useEffect(() => {
    if (!user) return undefined;

    const financeRef = getFinanceDocRef(user.uid);
    const unsubscribe = onSnapshot(
      financeRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          setDoc(financeRef, DEFAULT_DATA);
          setData(DEFAULT_DATA);
        }
        setFinanceLoaded(true);
      },
      (error) => {
        console.error('Error fetching data: ', error);
        setFinanceError(error.message || 'Nao foi possivel carregar os dados do Firebase.');
        setFinanceLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { data, financeLoaded, financeError };
}
