import { useState } from 'react';
import { callGeminiAPI } from '../../../shared/api/gemini/client.js';

// Preenchimento automático do formulário de gasto a partir de um texto livre (IA).
export function useSmartExpense(newExpense, setNewExpense) {
  const [aiSmartInput, setAiSmartInput] = useState('');
  const [aiSmartLoading, setAiSmartLoading] = useState(false);

  const handleSmartExpense = async () => {
    if (!aiSmartInput.trim()) return;
    setAiSmartLoading(true);
    try {
      const prompt = `Extraia despesa do texto e retorne JSON estrito: "${aiSmartInput}". Chaves: desc (string), amount (number), category (alimentacao, casa, transporte, lazer, saude, educacao, cartao_credito, outros), paymentMethod (pix, debit, cash, credit), type (variable, fixed).`;
      const responseText = await callGeminiAPI(prompt, true);
      const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
      setNewExpense({ ...newExpense, desc: parsed.desc || '', amount: parsed.amount?.toString() || '', category: parsed.category || 'outros', paymentMethod: parsed.paymentMethod || 'pix', type: parsed.type || 'variable' });
      setAiSmartInput('');
    } catch (e) { console.error(e); } finally { setAiSmartLoading(false); }
  };

  return { aiSmartInput, setAiSmartInput, aiSmartLoading, handleSmartExpense };
}
