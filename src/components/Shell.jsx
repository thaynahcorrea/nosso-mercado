import { useUI } from '../store/useUI';
import { Icon } from './ui';

export function BottomNav({ active }) {
  const go = useUI((s) => s.go);
  const items = [
    { key: 'home', label: 'Listas', icon: 'list' },
    { key: 'catalogo', label: 'Catálogo', icon: 'package' },
    { key: 'mensal', label: 'Resumo', icon: 'bar-chart-2' },
  ];
  return (
    <div className="bg-white border-t border-[#E8F0EE] pt-2.5 pb-4 flex justify-around shrink-0">
      {items.map((it) => (
        <button key={it.key} onClick={() => go(it.key)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${active === it.key ? 'text-teal' : 'text-[#B0C4C2]'}`}>
          <Icon name={it.icon} size={22} />
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Toast() {
  const msg = useUI((s) => s.toastMsg);
  if (!msg) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-28 z-50 bg-ink text-white px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap animate-fade shadow-lg">
      {msg}
    </div>
  );
}

// Base reutilizável de bottom-sheet
export function Sheet({ children }) {
  const close = useUI((s) => s.closeSheet);
  return (
    <div className="absolute inset-0 z-30 bg-[rgba(20,30,28,0.35)] flex items-end animate-fade"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="w-full bg-white rounded-t-3xl px-5 pt-4 pb-7 shadow-sheet max-h-[88%] overflow-y-auto animate-sheet no-scrollbar">
        <div className="w-9 h-1 bg-[#E0E8E7] rounded-full mx-auto mb-4" />
        {children}
      </div>
    </div>
  );
}
