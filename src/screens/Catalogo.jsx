import { useState } from 'react';
import { useStore, categoryName, lastPriceByStore } from '../store/useStore';
import { useUI } from '../store/useUI';
import { Icon, IconBtn } from '../components/ui';
import { money } from '../lib/format';

export default function Catalogo() {
  const catalog = useStore((s) => s.catalog);
  const categories = useStore((s) => s.categories);
  const priceHistory = useStore((s) => s.priceHistory);
  const go = useUI((s) => s.go);
  const openSheet = useUI((s) => s.openSheet);
  const [q, setQ] = useState('');

  const filtered = catalog.filter((i) =>
    (i.name + ' ' + (i.brand || '')).toLowerCase().includes(q.toLowerCase()));

  const groups = {};
  for (const it of filtered) {
    const cn = categoryName({ categories }, it.categoryId);
    (groups[cn] = groups[cn] || []).push(it);
  }

  const priceLabel = (it) => {
    const last = lastPriceByStore({ priceHistory }, it.id);
    const parts = Object.entries(last).map(([store, r]) =>
      `${store} ${money(r.unitPrice)}${r.unit === 'kg' ? '/kg' : ''}`);
    return parts.length ? parts.join(' · ') : null;
  };

  return (
    <>
      <div className="px-5 pt-1 pb-3 bg-white shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-[23px] font-extrabold text-ink">Catálogo</div>
          <IconBtn name="plus" onClick={() => openSheet('newItem')} />
        </div>
        <div className="text-[13px] text-slatey mt-1">Toque num item para ver o histórico</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 no-scrollbar">
        <div className="flex items-center gap-2.5 bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-3.5 py-2.5 mb-3.5">
          <Icon name="search" size={18} className="text-slatey" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar item..."
            className="flex-1 bg-transparent outline-none text-[15px]" />
        </div>

        {Object.entries(groups).map(([cn, arr]) => (
          <div key={cn}>
            <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-3.5 mb-2">{cn}</div>
            <div className="bg-white rounded-2xl overflow-hidden">
              {arr.map((it, idx) => {
                const pl = priceLabel(it);
                return (
                  <div key={it.id} className={`flex items-center px-4 py-3 gap-2 ${idx ? 'border-t border-[#F5F9F8]' : ''}`}>
                    <button onClick={() => go('comparacao', it.id)} className="flex-1 text-left">
                      <div className="text-sm font-semibold text-ink">{it.name}{it.brand ? ` · ${it.brand}` : ''}</div>
                      <div className={`text-xs mt-0.5 ${pl ? 'text-slatey' : 'text-[#C0D0CE]'}`}>
                        {pl || 'Sem preço registrado'}
                      </div>
                    </button>
                    <button onClick={() => openSheet('pickList', { itemId: it.id })} aria-label="Adicionar à lista"
                      className="w-9 h-9 rounded-xl bg-teal-soft text-teal flex items-center justify-center shrink-0 active:scale-90">
                      <Icon name="plus" size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
