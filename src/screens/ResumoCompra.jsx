import { useStore, itemById, categoryName, monthTotal } from '../store/useStore';
import { useUI } from '../store/useUI';
import { Icon, Btn } from '../components/ui';
import { money, money0 } from '../lib/format';

export default function ResumoCompra({ purchaseId }) {
  const p = useStore((s) => s.purchases.find((x) => x.id === purchaseId));
  const catalog = useStore((s) => s.catalog);
  const categories = useStore((s) => s.categories);
  const budgetLimit = useStore((s) => s.budgetLimit);
  const monthSpent = useStore((s) => monthTotal(s));
  const go = useUI((s) => s.go);

  if (!p) return null;

  const cats = {};
  for (const l of p.lines) {
    const it = itemById({ catalog }, l.itemId);
    const cn = it ? categoryName({ categories }, it.categoryId) : 'Outros';
    cats[cn] = (cats[cn] || 0) + l.total;
  }
  const pct = Math.min(100, (monthSpent / budgetLimit) * 100);

  return (
    <>
      <div className="bg-white text-center px-5 pt-6 pb-3.5 shrink-0">
        <div className="w-[60px] h-[60px] rounded-full bg-teal-soft text-teal flex items-center justify-center mx-auto mb-3">
          <Icon name="check-circle" size={28} />
        </div>
        <div className="text-[13px] text-slatey">Compra finalizada</div>
        <div className="text-[38px] font-black text-ink my-1">{money(p.total)}</div>
        <div className="text-[13px] text-teal font-semibold">{p.stores.join(' + ')} · {p.dateBR}</div>
        <div className="text-xs text-[#B0C4C2] mt-1">{p.listName} · {p.paymentMethod}</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 no-scrollbar">
        <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-1 mb-2">Por categoria</div>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          {Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cn, v], idx) => (
            <div key={cn} className={`flex justify-between py-2.5 ${idx ? 'border-t border-[#F5F9F8]' : ''}`}>
              <span className="text-sm text-ink">{cn}</span>
              <span className="text-[15px] font-bold text-ink">{money(v)}</span>
            </div>
          ))}
        </div>

        <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-4 mb-2">Impacto no orçamento</div>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-[13px] text-slatey font-medium">Orçamento · este mês</span>
            <span className="text-base font-bold text-ink">{money0(monthSpent)} <span className="text-[13px] text-slatey font-normal">/ {money0(budgetLimit)}</span></span>
          </div>
          <div className="h-2 bg-teal-soft rounded-full overflow-hidden">
            <div className="h-full bg-teal rounded-full" style={{ width: pct + '%' }} />
          </div>
          <div className="text-xs text-slatey mt-2">{money0(Math.max(0, budgetLimit - monthSpent))} restantes no orçamento</div>
        </div>

        <div className="mt-4"><Btn onClick={() => go('home')}>Fechar</Btn></div>
      </div>
    </>
  );
}
