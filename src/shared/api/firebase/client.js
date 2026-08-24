/* global __app_id */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
  firebaseMeasurementId
} from '../../config/env.js';

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId
};

// Diagnóstico seguro em desenvolvimento para inspecionar credenciais
if (import.meta.env.DEV) {
  if (!firebaseApiKey || firebaseApiKey.includes('SUA_CHAVE')) {
    console.warn(
      '[Firebase Client] ATENÇÃO: Chave de API do Firebase não configurada ou inválida. Verifique o arquivo .env.local.'
    );
  } else {
    console.log('[Firebase Client] Inicializado com sucesso para o projeto:', firebaseProjectId);
  }
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

