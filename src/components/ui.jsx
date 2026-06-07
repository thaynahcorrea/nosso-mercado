import { icons } from 'lucide-react';

// Aliases: nomes antigos do Lucide -> nomes canônicos atuais.
const ALIAS = {
  'bar-chart-2': 'chart-column',
  'more-horizontal': 'ellipsis',
  'plus-circle': 'circle-plus',
  'check-circle': 'circle-check',
};
const toPascal = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

// Ícone Lucide por nome (ex: <Icon name="shopping-cart" />)
export function Icon({ name, size = 20, className = '', strokeWidth = 2 }) {
  const resolved = ALIAS[name] || name;
  const Cmp = icons[toPascal(resolved)];
  if (!Cmp) return null;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} />;
}

// Cabeçalho de seção
export const Section = ({ children, extra }) => (
  <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-4 mb-2 first:mt-1 flex items-center gap-2">
    {children}{extra && <span className="text-[10px] text-slatey normal-case tracking-normal font-medium">{extra}</span>}
  </div>
);

// Botão redondo de ícone
export const IconBtn = ({ name, onClick, className = '' }) => (
  <button onClick={onClick}
    className={`w-9 h-9 rounded-full bg-teal-soft text-teal flex items-center justify-center active:scale-90 transition ${className}`}>
    <Icon name={name} size={22} />
  </button>
);

// Botões principais
export const Btn = ({ children, onClick, className = '' }) => (
  <button onClick={onClick}
    className={`w-full rounded-2xl bg-teal text-white font-bold py-4 active:opacity-90 transition ${className}`}>
    {children}
  </button>
);
export const Btn2 = ({ children, onClick, className = '' }) => (
  <button onClick={onClick}
    className={`w-full rounded-2xl border-[1.5px] border-teal text-teal font-semibold py-3 flex items-center justify-center gap-2 active:bg-teal-soft transition ${className}`}>
    {children}
  </button>
);
