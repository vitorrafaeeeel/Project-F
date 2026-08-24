import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../shared/api/firebase/client.js';

export function useSession() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const envError = '';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  return { user, authReady, envError };
}



