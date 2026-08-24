import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../../shared/api/firebase/client.js';

export const getFinanceDocRef = (uid) => doc(db, 'artifacts', appId, 'users', uid, 'finances', 'main');

export const updateFinanceData = async (uid, patch) => {
  await setDoc(getFinanceDocRef(uid), patch, { merge: true });
};
