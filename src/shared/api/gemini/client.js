import { geminiApiKey, geminiModel } from '../../config/env.js';

export const callGeminiAPI = async (prompt, isJson = false) => {
  if (!geminiApiKey) {
    console.error('Configure VITE_GEMINI_API_KEY ou VITE_GOOGLE_API_KEY no ambiente.');
    return '';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;
  const data = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  if (isJson) {
    data.generationConfig = { responseMimeType: 'application/json' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      // ISSO VAI MOSTRAR O ERRO REAL NO CONSOLE
      console.log('--- ERRO REAL DO GOOGLE ---');
      console.log('Status:', response.status);
      console.log('Mensagem:', result.error?.message);
      console.log('---------------------------');
      throw new Error(result.error?.message || 'Erro na API');
    }

    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Falha total na IA:', error.message);
    return '';
  }
};
