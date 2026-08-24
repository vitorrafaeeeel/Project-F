import { useEffect } from 'react';
import { computeAutoSettledPatch } from '../lib/autoSettle.js';
import { updateFinanceData } from './api.js';

// Roda em background sempre que os dados mudam, efetivando lançamentos agendados vencidos.
export function useAutoSettle(data, user) {
  useEffect(() => {
    if (!data) return;
    const patch = computeAutoSettledPatch(data);
    if (patch && user) {
      updateFinanceData(user.uid, patch);
    }
  }, [data, user]);
}
