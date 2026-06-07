import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useUI } from '../store/useUI';
import { Icon } from '../components/ui';
import { money0, monthKey, monthLabel } from '../lib/format';

const payIcon = (name) => {
  if (name.includes('Ticket')) return { icon: 'ticket', cls: 'bg-teal-soft text-teal' };
  if (name.includes('Crédito') || name.includes('Débito') || name.includes('Cartão')) return { icon: 'credit-card', cls: 'bg-[#E8EEF5] text-blueStore' };
  return { icon: 'banknote', cls: 'bg-[#EAF5EA] text-green2' };
};

export default function ResumoMensal() {
  const [offset, setOffset] = useState(0);
  const viewDate = new Date(); viewDate.setDate(1); viewDate.setMonth(viewDate.getMonth() + offset);
  const mk = monthKey(viewDate);
  const prevDate = new Date(viewDate); prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMk = monthKey(prevDate);

  const allPurchases = useStore((s) => s.purchases);
  const budgetLimit = useStore((s) => s.budgetLimit);
  const openSheet = useUI((s) => s.openSheet);

  const purchases = allPurchases.filter((p) => p.month === mk);
  const total = purchases.reduce((a, p) => a + p.total, 0);
  const prevTotal = allPurchases.filter((p) => p.month === prevMk).reduce((a, p) => a + p.total, 0);
  const diff = total - prevTotal;

  const byPay = {};
  for (const p of purchases) byPay[p.paymentMethod] = (byPay[p.paymentMethod] || 0) + p.total;

  const pct = Math.min(100, (total / budgetLimit) * 100);

  return (
    <>
      <div className="bg-teal px-5 pt-3.5 pb-5 shrink-0">
        <div className="flex justify-between items-center mb-3.5 text-white">
          <button onClick={() => setOffset(offset - 1)} className="active:scale-90"><Icon name="chevron-left" size={22} className="opacity-90" /></button>
          <span className="text-[19px] font-bold">{monthLabel(mk)}</span>
          <button onClick={() => setOffset(Math.min(0, offset + 1))} disabled={offset >= 0}
            className={offset >= 0 ? 'opacity-30' : 'active:scale-90'}><Icon name="chevron-right" size={22} className="opacity-90" /></button>
        </div>
        <div className="text-xs text-white/75">Total gasto no mês</div>
        <div className="text-[38px] font-black text-white leading-tight">{money0(total)}</div>
        <div className="h-2 bg-white/30 rounded-full mt-2.5 overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: pct + '%' }} />
        </div>
        <button onClick={() => openSheet('budget')} className="text-[13px] text-white/85 mt-1.5">
          Orçamento: {money0(total)} de {money0(budgetLimit)} · toque para editar
        </button>
        {prevTotal > 0 && (
          <div className="text-[12px] text-white/75 mt-1">
            {diff === 0 ? 'Igual ao mês anterior' : `${diff > 0 ? '↑' : '↓'} ${money0(Math.abs(diff))} ${diff > 0 ? 'a mais' : 'a menos'} que ${monthLabel(prevMk).split(' ')[0]}`}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 no-scrollbar">
        <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-1 mb-2">Por forma de pagamento</div>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          {Object.keys(byPay).length === 0 && <div className="text-sm text-slatey">Nenhuma compra ainda neste mês.</div>}
          {Object.entries(byPay).map(([name, v], idx) => {
            const pi = payIcon(name);
            return (
              <div key={name} className={`flex items-center gap-2.5 py-2.5 ${idx ? 'border-t border-[#F5F9F8]' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${pi.cls}`}>
                  <Icon name={pi.icon} size={16} />
                </div>
                <span className="text-sm flex-1 text-ink">{name}</span>
                <span className="text-[15px] font-bold text-ink">{money0(v)}</span>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-4 mb-2">Compras do mês</div>
        {purchases.length === 0 && <div className="text-sm text-slatey">Suas compras finalizadas aparecem aqui.</div>}
        {purchases.map((p) => {
          const pi = payIcon(p.paymentMethod);
          return (
            <div key={p.id} className="bg-white rounded-xl px-3.5 py-3 mb-2 flex justify-between items-center">
              <div>
                <div className="text-sm font-semibold text-ink">{p.listName}</div>
                <div className="text-xs text-slatey mt-0.5">{p.dateBR} · {p.stores.join(' + ')}</div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-bold text-ink">{money0(p.total)}</div>
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${pi.cls}`}>{p.paymentMethod.replace('Cartão de ', '')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
