export const cleanDoc = (doc) => (doc || '').replace(/\D/g, '');
export const cleanCep = (cep) => (cep || '').replace(/\D/g, '');

export const validateOrder = (order) => {
  const issues = [];
  const cepClean = cleanCep(order.postal_code);
  const docClean = cleanDoc(order.document);

  if (!order.name || order.name.trim().length < 3) issues.push('Nome incompleto');
  if (!cepClean || cepClean.length !== 8) issues.push('CEP inválido (precisa ter 8 dígitos)');
  if (!order.address || order.address.trim().length < 3) issues.push('Endereço incompleto');
  if (!order.number) issues.push('Número ausente');
  if (!order.city) issues.push('Cidade ausente');
  if (!order.state_abbr || order.state_abbr.length !== 2) issues.push('UF inválida');
  if (!docClean || (docClean.length !== 11 && docClean.length !== 14)) {
    issues.push('CPF/CNPJ ausente ou com dígitos incorretos');
  }

  return {
    isValid: issues.length === 0,
    hasCriticalErrors: issues.some((i) => i.includes('CEP') || i.includes('Endereço')),
    issues,
  };
};

export const parsePrice = (valStr) => {
  if (!valStr) return 20.0;
  let clean = String(valStr).replace('R$', '').trim();

  // Caso tenha ponto de milhar e vírgula de decimal: ex: 1.250,50
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  }
  // Caso use apenas vírgula para decimal: ex: 2,50
  else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  // Se contiver apenas ponto (ex: 2.00), mantém como decimal padrão

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 20.0 : parsed;
};

