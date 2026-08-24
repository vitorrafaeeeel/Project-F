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
  apiKey: firebaseApiKey || "AIzaSyCnwLv4djcrm-qgA0Hw7cJtSpy6aU5TCAE",
  authDomain: firebaseAuthDomain || "project-f-77ed8.firebaseapp.com",
  projectId: firebaseProjectId || "project-f-77ed8",
  storageBucket: firebaseStorageBucket || "project-f-77ed8.appspot.com",
  messagingSenderId: firebaseMessagingSenderId || "261138589545",
  appId: firebaseAppId || "1:261138589545:web:c04130007812cf691fa68c",
  measurementId: firebaseMeasurementId || "G-ETLN1M012M"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';


