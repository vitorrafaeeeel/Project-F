import { useCallback, useState } from 'react';
import { callGeminiAPI } from '../../../shared/api/gemini/client.js';

const VALID_CATEGORIES = new Set(['alimentacao', 'casa', 'transporte', 'lazer', 'saude', 'educacao', 'cartao_credito', 'outros']);
const VALID_METHODS = new Set(['pix', 'debit', 'cash', 'credit']);
const VALID_TYPES = new Set(['variable', 'fixed']);

// Preenchimento automático do formulário de gasto a partir de um texto livre (IA).
export function useSmartExpense(newExpense, setNewExpense) {
  const [aiSmartInput, setAiSmartInput] = useState('');
  const [aiSmartLoading, setAiSmartLoading] = useState(false);

  const handleSmartExpense = useCallback(async () => {
    if (!aiSmartInput.trim()) return;
    setAiSmartLoading(true);
    try {
      const prompt = `Extraia despesa do texto e retorne JSON estrito: "${aiSmartInput}". Chaves: desc (string), amount (number), category (alimentacao, casa, transporte, lazer, saude, educacao, cartao_credito, outros), paymentMethod (pix, debit, cash, credit), type (variable, fixed).`;
      const responseText = await callGeminiAPI(prompt, true);

      // Extrai bloco JSON com segurança mesmo se a IA incluir texto em volta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Nenhum JSON válido encontrado na resposta da IA');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const category = VALID_CATEGORIES.has(parsed.category) ? parsed.category : 'outros';
      const paymentMethod = VALID_METHODS.has(parsed.paymentMethod) ? parsed.paymentMethod : 'pix';
      const type = VALID_TYPES.has(parsed.type) ? parsed.type : 'variable';
      const desc = typeof parsed.desc === 'string' ? parsed.desc.trim() : '';
      const amount = parsed.amount !== undefined && parsed.amount !== null ? String(parsed.amount) : '';

      setNewExpense((prev) => ({
        ...prev,
        desc: desc || prev.desc,
        amount: amount || prev.amount,
        category,
        paymentMethod,
        type
      }));
      setAiSmartInput('');
    } catch (e) {
      console.error('Falha ao processar gasto inteligente via IA:', e);
    } finally {
      setAiSmartLoading(false);
    }
  }, [aiSmartInput, setNewExpense]);

  return { aiSmartInput, setAiSmartInput, aiSmartLoading, handleSmartExpense };
}

