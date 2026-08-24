const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

export const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || googleApiKey;
export const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || googleApiKey;
export const geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
