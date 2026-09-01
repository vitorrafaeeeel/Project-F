export const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseCurrencyInput(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
};

export const maskCurrency = (value) => {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') {
    if (isNaN(value) || value === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  // Remove caracteres não numéricos
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';

  const num = parseInt(digits, 10) / 100;
  if (isNaN(num) || num === 0) return '';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const parseCurrencyInput = (value) => {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.round(value * 100) / 100;
  }
  if (!value) return 0;

  // Remove caracteres indesejados mantendo dígitos, pontos, vírgulas e sinal negativo
  let cleanStr = String(value).trim().replace(/[^\d.,-]/g, '');
  if (!cleanStr) return 0;

  // Se contiver ponto e vírgula (ex: 1.500,50 ou 1,500.50)
  if (cleanStr.includes('.') && cleanStr.includes(',')) {
    const lastDot = cleanStr.lastIndexOf('.');
    const lastComma = cleanStr.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Formato brasileiro: 1.500,50 -> 1500.50
      cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato americano: 1,500.50 -> 1500.50
      cleanStr = cleanStr.replace(/,/g, '');
    }
  } else if (cleanStr.includes(',')) {
    // Formato com vírgula decimal: 1500,50 -> 1500.50
    cleanStr = cleanStr.replace(',', '.');
  }

  const parsed = parseFloat(cleanStr);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100) / 100;
};

