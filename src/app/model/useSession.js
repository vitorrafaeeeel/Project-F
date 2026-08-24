import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../shared/api/firebase/client.js';
import { firebaseApiKey } from '../../shared/config/env.js';

// Inicializa a escuta do estado de autenticação do Firebase.
// Se as variáveis de ambiente não estiverem configuradas, nunca chega a assinar o listener.
export function useSession() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [envError] = useState(
    firebaseApiKey ? '' : 'Configure VITE_FIREBASE_API_KEY ou VITE_GOOGLE_API_KEY no arquivo .env.local e reinicie o servidor.'
  );

  useEffect(() => {
    if (envError) {
      setAuthReady(true);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [envError]);

  return { user, authReady, envError };
}
