import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../shared/api/firebase/client.js';
import { firebaseApiKey } from '../../shared/config/env.js';

// Inicializa a escuta do estado de autenticação do Firebase.
// Se as variáveis de ambiente não estiverem configuradas, nunca chega a assinar o listener.
export function useSession() {
  const [user, setUser] = useState(null);
  const isKeyConfigured = Boolean(firebaseApiKey && !firebaseApiKey.includes('SUA_CHAVE'));
  const envError = isKeyConfigured
    ? ''
    : 'Chave de API do Firebase não encontrada ou inválida. Configure VITE_FIREBASE_API_KEY no arquivo .env.local (ou nas variáveis da Vercel) e reinicie o servidor.';
  const [authReady, setAuthReady] = useState(!isKeyConfigured);

  useEffect(() => {
    if (!isKeyConfigured) return undefined;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [isKeyConfigured]);

  return { user, authReady, envError };
}


