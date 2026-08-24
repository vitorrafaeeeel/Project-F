import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../../shared/api/firebase/client.js';

export const getProfileDocRef = (uid) => doc(db, 'artifacts', appId, 'users', uid, 'profiles', 'main');

export const saveProfile = async (uid, profile) => {
  await setDoc(getProfileDocRef(uid), profile, { merge: true });
};
