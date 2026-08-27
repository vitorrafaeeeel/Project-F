import { useCallback, useState } from 'react';
import { parseCurrencyInput } from '../../../shared/lib/currency.js';

// categoryBudgets é sempre escrito como array (não mapa): setDoc(..., {merge:true})
// faz merge raso de mapas, então remover uma chave de um mapa não a apagaria no
// Firestore. Arrays são substituídos por inteiro, igual a expenses[]/extraIncomes[].
const emptyRow = () => ({ category: 'lazer', amount: '' });

export function useCategoryBudgetsForm(data, updateData) {
  const [rows, setRows] = useState([]);

  const [trackedData, setTrackedData] = useState(data);
  if (data && data !== trackedData) {
    setTrackedData(data);
    setRows((data.categoryBudgets || []).map(b => ({ category: b.category, amount: b.amount?.toString() || '' })));
  }

  const addRow = useCallback(() => setRows(r => [...r, emptyRow()]), []);
  const updateRow = useCallback((idx, field, value) => {
    setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }, []);
  const removeRow = useCallback((idx) => setRows(r => r.filter((_, i) => i !== idx)), []);

  const handleSaveCategoryBudgets = useCallback((closeModal) => {
    const byCategory = new Map();
    rows.forEach(row => {
      const amount = parseCurrencyInput(row.amount);
      if (!isNaN(amount) && amount > 0) byCategory.set(row.category, amount);
    });
    const categoryBudgets = Array.from(byCategory, ([category, amount]) => ({ category, amount }));
    updateData?.({ categoryBudgets });
    closeModal?.();
  }, [rows, updateData]);

  return { rows, addRow, updateRow, removeRow, handleSaveCategoryBudgets };
}
