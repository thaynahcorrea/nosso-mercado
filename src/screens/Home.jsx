import { useStore, monthTotal } from '../store/useStore';
import { useUI } from '../store/useUI';
import { Icon, IconBtn, Section } from '../components/ui';
import { money0 } from '../lib/format';
import { supabase, supabaseEnabled } from '../lib/supabase';

export default function Home() {
  const lists = useStore((s) => s.lists);
  const budgetLimit = useStore((s) => s.budgetLimit);
  const spent = useStore((s) => monthTotal(s));
  const cart = useStore((s) => s.cart);
  const go = useUI((s) => s.go);
  const openSheet = useUI((s) => s.openSheet);

  const rem = budgetLimit - spent;
  const pct = Math.min(100, (spent / budgetLimit) * 100);

  return (
    <>
      <div className="px-5 pt-1 pb-3.5 bg-white shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-[23px] font-extrabold text-ink">Minhas Listas</div>
          <div className="flex items-center gap-2">
            {supabaseEnabled && (
              <button onClick={() => supabase.auth.signOut()} aria-label="Sair"
                className="w-9 h-9 rounded-full bg-[#F5F9F8] text-slatey flex items-center justify-center active:scale-90">
                <Icon name="log-out" size={18} />
              </button>
            )}
            <IconBtn name="plus" onClick={() => openSheet('newList')} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 no-scrollbar">
        {/* Orçamento */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-[13px] text-slatey font-medium">Orçamento · este mês</span>
            <span className="flex items-center gap-2">
              <span className="text-base font-bold text-ink">
                {money0(spent)} <span className="text-[13px] text-slatey font-normal">/ {money0(budgetLimit)}</span>
              </span>
              <button onClick={() => openSheet('budget')}
                className="w-7 h-7 rounded-lg bg-[#F5F9F8] text-slatey flex items-center justify-center active:scale-90">
                <Icon name="pencil" size={14} />
              </button>
            </span>
          </div>
          <div className="h-2 bg-teal-soft rounded-full overflow-hidden">
            <div className="h-full bg-teal rounded-full" style={{ width: pct + '%' }} />
          </div>
          <div className="text-xs text-slatey mt-2 cursor-pointer" onClick={() => go('mensal')}>
            {money0(rem)} restantes · toque para ver o resumo
          </div>
        </div>

        <Section>Listas ativas</Section>
        {lists.map((l) => {
          const inProgress = cart[l.id] && Object.keys(cart[l.id].lines || {}).length;
          return (
            <button key={l.id} onClick={() => go('lista', l.id)}
              className="w-full bg-white rounded-2xl p-3.5 mb-2.5 flex items-center gap-3.5 shadow-card text-left active:scale-[0.99] transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-soft text-teal flex items-center justify-center shrink-0">
                <Icon name={l.icon} size={24} />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-ink">{l.name}</div>
                <div className="text-xs text-slatey mt-0.5">
                  {l.items.length} {l.items.length === 1 ? 'item' : 'itens'}
                  {inProgress ? ' · compra em andamento' : ''}
                </div>
              </div>
              {inProgress ? <span className="w-2.5 h-2.5 rounded-full bg-teal mr-1" /> : null}
              <Icon name="chevron-right" size={22} className="text-[#C8D8D6]" />
            </button>
          );
        })}
      </div>
    </>
  );
}
