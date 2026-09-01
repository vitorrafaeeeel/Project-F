import { useCallback, useMemo, useState } from 'react';
import { parseCurrencyInput, maskCurrency } from '../../../shared/lib/currency.js';
import { categoryConfig } from '../../../entities/expense/model/categories.js';

// categoryBudgets é sempre escrito como array (não mapa): setDoc(..., {merge:true})
// faz merge raso de mapas, então remover uma chave de um mapa não a apagaria no
// Firestore. Arrays são substituídos por inteiro, igual a expenses[]/extraIncomes[].
export function useCategoryBudgetsForm(data, updateData) {
  const [rows, setRows] = useState([]);

  const [trackedData, setTrackedData] = useState(data);
  if (data && data !== trackedData) {
    setTrackedData(data);
    setRows((data.categoryBudgets || []).map(b => ({ category: b.category, amount: maskCurrency(b.amount) || '' })));
  }

  const plannedBudget = data?.plannedBudget || 0;

  const addRow = useCallback(() => {
    setRows(currentRows => {
      const allCategories = Object.keys(categoryConfig);
      const usedCategories = new Set(currentRows.map(r => r.category));
      const nextCategory = allCategories.find(cat => !usedCategories.has(cat)) || 'outros';
      return [...currentRows, { category: nextCategory, amount: '' }];
    });
  }, []);

  const updateRow = useCallback((idx, field, value) => {
    setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }, []);

  const removeRow = useCallback((idx) => {
    setRows(r => r.filter((_, i) => i !== idx));
  }, []);

  const totalAllocated = useMemo(() => {
    return rows.reduce((acc, row) => {
      const amount = parseCurrencyInput(row.amount);
      return acc + (!isNaN(amount) && amount > 0 ? amount : 0);
    }, 0);
  }, [rows]);

  const remainingToAllocate = plannedBudget > 0 ? plannedBudget - totalAllocated : 0;
  const isOverBudget = plannedBudget > 0 && totalAllocated > plannedBudget;
  const allocationRatio = plannedBudget > 0 ? (totalAllocated / plannedBudget) : 0;
  const allocationPercentage = (allocationRatio * 100).toFixed(0);

  const handleSaveCategoryBudgets = useCallback((closeModal) => {
    const byCategory = new Map();
    rows.forEach(row => {
      const amount = parseCurrencyInput(row.amount);
      if (!isNaN(amount) && amount > 0) {
        byCategory.set(row.category, (byCategory.get(row.category) || 0) + amount);
      }
    });

    const total = Array.from(byCategory.values()).reduce((sum, val) => sum + val, 0);
    const currentPlanned = data?.plannedBudget || 0;

    // Validação estrita: não permitir salvar se ultrapassar o orçamento geral
    if (currentPlanned > 0 && total > currentPlanned) {
      return false;
    }

    const categoryBudgets = Array.from(byCategory, ([category, amount]) => ({ category, amount }));
    updateData?.({ categoryBudgets });
    closeModal?.();
    return true;
  }, [rows, data?.plannedBudget, updateData]);

  return {
    rows,
    addRow,
    updateRow,
    removeRow,
    handleSaveCategoryBudgets,
    plannedBudget,
    totalAllocated,
    remainingToAllocate,
    isOverBudget,
    allocationRatio,
    allocationPercentage
  };
}
