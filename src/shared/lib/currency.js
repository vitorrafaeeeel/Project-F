export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

export const parseCurrencyInput = (value) => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;

  const cleanStr = String(value).trim();
  if (!cleanStr) return 0;

  if (cleanStr.includes('.') && cleanStr.includes(',')) {
    const normalized = cleanStr.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (cleanStr.includes(',')) {
    const normalized = cleanStr.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
};

