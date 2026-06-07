// Formatação de moeda e máscaras estilo "calculadora" (dígitos entram pela direita).

export const money = (v) =>
  'R$' + (Number(v) || 0).toFixed(2).replace('.', ',');

export const money0 = (v) =>
  'R$' + Math.round(Number(v) || 0).toLocaleString('pt-BR');

// Converte string mascarada ("35,90" / "0,850") em número.
export const parseNum = (v) =>
  parseFloat(String(v || '').replace(/\./g, '').replace(',', '.')) || 0;

// Máscaras: recebem o valor cru do input e devolvem o texto formatado.
export const maskKg = (raw) => {
  const d = String(raw).replace(/\D/g, '');
  return d ? (parseInt(d, 10) / 1000).toFixed(3).replace('.', ',') : '';
};
export const maskMoney = (raw) => {
  const d = String(raw).replace(/\D/g, '');
  return d ? (parseInt(d, 10) / 100).toFixed(2).replace('.', ',') : '';
};
export const maskInt = (raw) => {
  const d = String(raw).replace(/\D/g, '');
  return d ? parseInt(d, 10).toLocaleString('pt-BR') : '';
};

export const todayBR = () => {
  const d = new Date();
  return d.toLocaleDateString('pt-BR');
};

export const monthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${nomes[m - 1]} ${y}`;
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
