import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { getProfileDocRef, saveProfile } from './api.js';

export function useProfile(user) {
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Reseta o estado assim que o usuário muda (login/logout/troca de conta),
  // para não exibir dados de outra sessão enquanto a nova assinatura carrega.
  const [trackedUser, setTrackedUser] = useState(user);
  if (user !== trackedUser) {
    setTrackedUser(user);
    setProfile(null);
    setProfileLoaded(false);
    setProfileError('');
  }

  useEffect(() => {
    if (!user) return undefined;

    const profileRef = getProfileDocRef(user.uid);
    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          const fallbackProfile = {
            fullName: user.displayName || '',
            email: user.email || '',
            birthDate: '',
            cpf: '',
            phone: '',
            createdAt: new Date().toISOString()
          };
          saveProfile(user.uid, fallbackProfile);
          setProfile(fallbackProfile);
        }
        setProfileLoaded(true);
      },
      (error) => {
        console.error('Error fetching profile: ', error);
        setProfileError(error.message || 'Nao foi possivel carregar o perfil do usuario.');
        setProfileLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { profile, profileLoaded, profileError };
}
