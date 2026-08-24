import { useCallback, useState } from 'react';
import { callGeminiAPI } from '../../../shared/api/gemini/client.js';

export function useAiInsight(data) {
  const [aiInsight, setAiInsight] = useState('');
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  const handleGenerateInsight = useCallback(async (currentMonthStats) => {
    setAiInsightLoading(true);
    try {
      const prompt = `Você é um consultor financeiro virtual inteligente.
      Dados atuais: Renda: ${currentMonthStats.monthTotalIncome}, Orçamento: ${data.plannedBudget}, Gastos Totais: ${currentMonthStats.monthTotalExpenses}, Saldo: ${data.currentAccountBalance}.
      Forneça um insight financeiro encorajador em português, 2 frases. Se gastar muito, alerte suavemente.`;
      const response = await callGeminiAPI(prompt, false);
      setAiInsight(response);
    } catch {
      setAiInsight('Não foi possível gerar um insight no momento.');
    } finally {
      setAiInsightLoading(false);
    }
  }, [data]);

  return { aiInsight, aiInsightLoading, handleGenerateInsight };
}
