/* global __app_id */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseApiKey } from '../../config/env.js';

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: 'project-f-77ed8.firebaseapp.com',
  projectId: 'project-f-77ed8',
  storageBucket: 'project-f-77ed8.firebasestorage.app',
  messagingSenderId: '261138589545',
  appId: '1:261138589545:web:e6eb19add3bfe6eb8c7ff8',
  measurementId: 'G-ETLN1M012M'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
