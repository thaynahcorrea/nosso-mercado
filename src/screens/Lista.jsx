import { useStore, itemById, categoryName } from '../store/useStore';
import { useUI } from '../store/useUI';
import { Icon, IconBtn } from '../components/ui';
import { money } from '../lib/format';

export default function Lista({ listId }) {
  const list = useStore((s) => s.lists.find((l) => l.id === listId));
  const catalog = useStore((s) => s.catalog);
  const categories = useStore((s) => s.categories);
  const stores = useStore((s) => s.stores);
  const cart = useStore((s) => s.cart[listId]) || { store: null, lines: {} };
  const setActiveStore = useStore((s) => s.setActiveStore);
  const unbuyItem = useStore((s) => s.unbuyItem);
  const quickBuy = useStore((s) => s.quickBuy);
  const removeItemFromList = useStore((s) => s.removeItemFromList);
  const back = useUI((s) => s.back);
  const openSheet = useUI((s) => s.openSheet);
  const editMode = useUI((s) => s.editMode);
  const setEditMode = useUI((s) => s.setEditMode);

  if (!list) return null;
  const activeStore = cart.store || stores[0];
  const lines = cart.lines || {};
  const boughtCount = Object.keys(lines).length;
  const ongoingTotal = Object.values(lines).reduce((a, l) => a + l.total, 0);

  // agrupar itens da lista por categoria
  const groups = {};
  for (const li of list.items) {
    const it = itemById({ catalog }, li.itemId);
    if (!it) continue;
    const cn = categoryName({ categories }, it.categoryId);
    (groups[cn] = groups[cn] || []).push({ li, it });
  }

  return (
    <>
      <div className="px-5 pt-1 pb-3.5 bg-white shrink-0">
        <div className="flex justify-between items-center">
          <button onClick={back} className="flex items-center gap-0.5 text-sm text-teal font-semibold">
            <Icon name="chevron-left" size={18} /> Voltar
          </button>
          {editMode ? (
            <button onClick={() => setEditMode(false)} className="text-sm text-teal font-bold px-3 py-1.5 rounded-full bg-teal-soft">
              Concluir
            </button>
          ) : (
            <IconBtn name="more-horizontal" onClick={() => openSheet('listMenu', { listId })} />
          )}
        </div>
        <div className="mt-2">
          <div className="text-[23px] font-extrabold text-ink">{list.name}</div>
          <div className="text-[13px] text-slatey mt-0.5">{boughtCount} de {list.items.length} itens comprados</div>
        </div>
      </div>

      {/* Seletor de lojas */}
      <div className="flex gap-2 px-4 py-2.5 bg-white overflow-x-auto no-scrollbar shrink-0">
        {stores.map((s) => (
          <button key={s} onClick={() => setActiveStore(listId, s)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] shrink-0
              ${s === activeStore ? 'bg-teal-soft text-teal border-teal' : 'bg-teal-mist text-slatey border-transparent'}`}>
            {s}
          </button>
        ))}
        <button onClick={() => openSheet('newStore', { listId })}
          className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold text-teal bg-white border-[1.5px] border-dashed border-[#B7D8D3] flex items-center gap-1 shrink-0">
          <Icon name="plus" size={14} /> Nova loja
        </button>
      </div>

      {/* Itens */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-white no-scrollbar">
        {list.items.length === 0 && (
          <div className="text-center text-slatey text-sm mt-10">
            Lista vazia. Toque no <b>+</b> para adicionar itens.
          </div>
        )}
        {Object.entries(groups).map(([cn, arr]) => (
          <div key={cn}>
            <div className="text-[11px] font-bold text-teal uppercase tracking-wide mt-3.5 mb-2">{cn}</div>
            {arr.map(({ li, it }) => {
              const line = lines[it.id];
              const bought = !!line;
              return (
                <div key={it.id} className={`flex items-center py-2.5 px-2.5 bg-white rounded-xl mb-1.5 gap-2.5`}>
                  {editMode ? (
                    <>
                      <button onClick={() => openSheet('editItem', { listId, itemId: it.id })}
                        className="text-xs font-bold text-teal bg-teal-soft px-2 py-0.5 rounded-md shrink-0 min-w-[42px] text-center active:scale-95">
                        {li.plannedQty} {li.plannedUnit}
                      </button>
                      <button className="flex-1 text-left" onClick={() => openSheet('editItem', { listId, itemId: it.id })}>
                        <div className="text-[15px] font-medium text-ink">{it.name}</div>
                        {it.brand && <div className="text-[11px] text-[#9DB3B0]">{it.brand}</div>}
                      </button>
                      <button onClick={() => removeItemFromList(listId, it.id)} aria-label="Remover item"
                        className="w-9 h-9 rounded-xl bg-[#FEF0ED] text-coral flex items-center justify-center shrink-0 active:scale-90">
                        <Icon name="trash-2" size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => (bought ? unbuyItem(listId, it.id) : quickBuy(listId, it.id, activeStore, li.plannedQty, li.plannedUnit))}
                        className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center text-white
                          ${bought ? 'bg-teal border-teal' : 'border-[#D1E5E2]'}`}>
                        {bought && <Icon name="check" size={15} />}
                      </button>
                      <button onClick={() => openSheet('editItem', { listId, itemId: it.id })}
                        className="text-xs font-bold text-teal bg-teal-soft px-2 py-0.5 rounded-md shrink-0 min-w-[42px] text-center active:scale-95">
                        {li.plannedQty} {li.plannedUnit}
                      </button>
                      <button className="flex-1 text-left" onClick={() => openSheet('buy', { listId, itemId: it.id })}>
                        <div className={`text-[15px] font-medium ${bought ? 'text-[#BFD4D1] line-through' : 'text-ink'}`}>{it.name}</div>
                        {it.brand && <div className="text-[11px] text-[#9DB3B0]">{it.brand}</div>}
                      </button>
                      {bought ? (
                        <button onClick={() => openSheet('buy', { listId, itemId: it.id })}
                          className="text-[13px] font-semibold text-teal text-right whitespace-nowrap">
                          {line.total > 0 ? money(line.total) : <span className="text-[#B0C4C2] font-medium">sem preço</span>}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 ${line.store === 'Mateus' ? 'bg-[#E8EEF5] text-blueStore' : 'bg-teal-soft text-teal'}`}>
                            {line.store}
                          </span>
                        </button>
                      ) : (
                        <button onClick={() => openSheet('buy', { listId, itemId: it.id })}
                          className="text-[13px] text-[#CFE0DD] whitespace-nowrap">—</button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div className="h-44" />
      </div>

      {/* FAB */}
      <button onClick={() => openSheet('addItem', { listId })}
        className="absolute right-[18px] bottom-[150px] w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center shadow-fab active:scale-95 z-10">
        <Icon name="plus" size={28} />
      </button>

      {/* Barra de compra em andamento */}
      {boughtCount > 0 && (
        <div className="absolute left-3 right-3 bottom-[84px] z-20 bg-ink text-white rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-lg">
          <Icon name="shopping-cart" size={18} />
          <div>
            <div className="text-xs text-[#9DC4BF]">Compra em andamento</div>
            <div className="text-[17px] font-extrabold">{money(ongoingTotal)}</div>
          </div>
          <button onClick={() => openSheet('finalize', { listId })}
            className="ml-auto bg-teal text-white px-4 py-2.5 rounded-xl text-[13px] font-bold active:opacity-90">
            Finalizar
          </button>
        </div>
      )}
    </>
  );
}
