import { useStore, itemById } from '../store/useStore';
import { useUI } from '../store/useUI';
import { Icon } from '../components/ui';
import { money } from '../lib/format';

export default function Comparacao({ itemId }) {
  const it = useStore((s) => itemById(s, itemId));
  const history = useStore((s) => s.priceHistory[itemId]); // referência estável
  const back = useUI((s) => s.back);
  const openSheet = useUI((s) => s.openSheet);

  if (!it) return null;
  const hist = history || [];
  // último preço por loja (computado no render, não como seletor)
  const last = {};
  for (const r of hist) if (!last[r.store]) last[r.store] = r;
  const unitSuffix = (u) => (u === 'kg' ? '/kg' : '');
  const stores = Object.entries(last); // [store, {unitPrice, unit, date}]
  const cheapest = stores.length ? stores.reduce((a, b) => (a[1].unitPrice <= b[1].unitPrice ? a : b))[0] : null;
  const dotCls = (store) => (store === 'Mateus' ? 'bg-blueStore' : 'bg-teal');

  return (
    <>
      <div className="px-5 pt-1 pb-3.5 bg-white shrink-0">
        <div className="flex justify-between items-center">
          <button onClick={back} className="flex items-center gap-0.5 text-sm text-teal font-semibold">
            <Icon name="chevron-left" size={18} /> Voltar
          </button>
          <button onClick={() => openSheet('editCatalog', { itemId })}
            className="flex items-center gap-1 text-sm text-teal font-semibold px-3 py-1.5 rounded-full bg-teal-soft">
            <Icon name="pencil" size={15} /> Editar item
          </button>
        </div>
        <div className="mt-2">
          <div className="text-[23px] font-extrabold text-ink">Comparação</div>
          <div className="text-[13px] text-slatey mt-0.5">{it.name}{it.brand ? ` · ${it.brand}` : ''}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 no-scrollbar">
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="text-[11px] font-bold text-slatey uppercase tracking-wide mb-3">Último preço por loja</div>
          {stores.length === 0 && <div className="text-sm text-slatey">Nenhum preço registrado ainda.</div>}
          {stores.map(([store, r], idx) => (
            <div key={store} className={`flex justify-between items-center py-3 ${idx ? 'border-t border-[#F5F9F8]' : ''}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotCls(store)}`} />
                  <span className="text-[15px] font-semibold text-ink">{store}</span>
                </div>
                <div className="text-xs text-slatey mt-0.5">Registrado em {r.date}</div>
              </div>
              <div className="text-right">
                <div className="text-[21px] font-extrabold text-ink">{money(r.unitPrice)}<span className="text-xs text-slatey">{unitSuffix(r.unit)}</span></div>
                {store === cheapest && stores.length > 1 && (
                  <span className="bg-teal-soft text-teal text-[11px] font-bold px-2 py-0.5 rounded-lg">Mais barato</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-4 mb-2">Histórico completo</div>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          {hist.length === 0 && <div className="text-sm text-slatey">Sem registros.</div>}
          {hist.map((r, i) => (
            <div key={i} className={`flex justify-between items-center py-2.5 ${i ? 'border-t border-[#F0F4F3]' : ''}`}>
              <span className="text-[13px] font-semibold text-ink">{r.store}</span>
              <span className="text-xs text-slatey">{r.date}</span>
              <span className="text-sm font-bold text-teal">{money(r.unitPrice)}{unitSuffix(r.unit)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
