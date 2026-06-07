import { useState } from 'react';
import { useStore, itemById, categoryName } from '../store/useStore';
import { useUI } from '../store/useUI';
import { Icon, Btn, Btn2 } from './ui';
import { Sheet } from './Shell';
import { money, parseNum, maskKg, maskMoney, maskInt } from '../lib/format';

export default function Sheets() {
  const sheet = useUI((s) => s.sheet);
  if (!sheet) return null;
  const map = {
    buy: BuySheet, editPrice: EditPriceSheet, addItem: AddItemSheet, newItem: NewItemSheet,
    newStore: StoreSheet, budget: BudgetSheet, listMenu: ListMenu, finalize: FinalizeSheet,
    newList: NewListSheet, editItem: EditItemSheet, pickList: PickListSheet,
    editCatalog: EditCatalogSheet,
  };
  const Cmp = map[sheet.type];
  return Cmp ? <Sheet><Cmp {...sheet.data} /></Sheet> : null;
}

const UnitToggle = ({ unit, onChange }) => (
  <div className="flex bg-[#F0F4F3] rounded-xl p-0.5 mb-3">
    {['un', 'kg'].map((u) => (
      <button key={u} onClick={() => onChange(u)}
        className={`flex-1 py-2 rounded-lg text-[13px] font-semibold ${unit === u ? 'bg-white text-teal shadow' : 'text-slatey'}`}>
        {u === 'un' ? 'Por unidade' : 'Por kg'}
      </button>
    ))}
  </div>
);

// ---------------- Comprar / detalhar (preço opcional) ----------------
function BuySheet({ listId, itemId }) {
  const it = useStore((s) => itemById(s, itemId));
  const stores = useStore((s) => s.stores);
  const cart = useStore((s) => s.cart[listId]);
  const existing = cart?.lines?.[itemId];
  const li = useStore((s) => s.lists.find((l) => l.id === listId)?.items.find((x) => x.itemId === itemId));
  const history = useStore((s) => s.priceHistory[itemId]) || [];
  const buyItem = useStore((s) => s.buyItem);
  const registerPrice = useStore((s) => s.registerPrice);
  const { closeSheet, toast, go, openSheet } = useUI.getState();
  const store = cart?.store || stores[0];
  const bought = !!existing;

  const [unit, setUnit] = useState(existing?.soldUnit || it?.defaultSold || 'un');
  const [qty, setQty] = useState(existing && existing.soldUnit === 'un' ? existing.qty : (li?.plannedUnit === 'un' ? li.plannedQty : 1));
  const [weight, setWeight] = useState(existing && existing.soldUnit === 'kg' ? String(existing.qty).replace('.', ',') : '');
  const [price, setPrice] = useState(existing && existing.unitPrice > 0 ? existing.unitPrice.toFixed(2).replace('.', ',') : '');

  if (!it) return null;
  const amount = unit === 'kg' ? parseNum(weight) : qty;
  const total = parseNum(price) * amount;

  const confirm = () => {
    buyItem(listId, itemId, { store, unitPrice: parseNum(price), soldUnit: unit, qty: amount });
    closeSheet();
    toast(bought ? 'Atualizado' : (parseNum(price) > 0 ? 'Comprado · ' + money(total) : 'Comprado'));
  };
  const onlyRegister = () => {
    if (parseNum(price) <= 0) return toast('Informe o preço');
    registerPrice(itemId, store, parseNum(price), unit);
    closeSheet(); toast('Preço salvo no histórico (não marca como comprado)');
  };

  return (
    <>
      <div className="text-[19px] font-bold text-ink">{it.name}{it.brand ? ` · ${it.brand}` : ''}</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">{bought ? 'Editar compra' : 'Detalhes da compra'} · {store}</div>
      <UnitToggle unit={unit} onChange={setUnit} />

      {unit === 'un' ? (
        <div className="flex items-center gap-3.5 justify-center my-1.5 mb-3.5">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 rounded-xl bg-teal-soft text-teal text-2xl font-bold">−</button>
          <span className="text-3xl font-extrabold min-w-[70px] text-center">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="w-11 h-11 rounded-xl bg-teal-soft text-teal text-2xl font-bold">+</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-4 py-3 mb-2.5">
          <input inputMode="numeric" value={weight} onChange={(e) => setWeight(maskKg(e.target.value))}
            placeholder="0,000" className="bg-transparent outline-none text-[22px] font-extrabold flex-1 w-full" />
          <span className="text-sm text-slatey font-semibold">kg</span>
        </div>
      )}

      <div className="flex items-center gap-2 bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-4 py-3 mb-1.5">
        <span className="text-base font-bold text-slatey">R$</span>
        <input inputMode="numeric" value={price} onChange={(e) => setPrice(maskMoney(e.target.value))}
          placeholder="0,00" className="bg-transparent outline-none text-[22px] font-extrabold flex-1 w-full" />
        <span className="text-sm text-slatey font-semibold">{unit === 'kg' ? '/kg' : '/un'}</span>
      </div>
      <div className="text-[11px] text-slatey mb-2.5 ml-1">Preço é opcional — dá para marcar comprado sem ele.</div>

      <div className="bg-teal-soft rounded-xl px-3.5 py-2.5 flex justify-between items-center mb-3.5">
        <span className="text-[13px] text-teal font-semibold">Total desta compra</span>
        <span className="text-lg font-extrabold text-teal">{money(total)}</span>
      </div>

      <Btn onClick={confirm}>{bought ? 'Salvar' : 'Confirmar compra'}</Btn>
      <div className="mt-2"><Btn2 onClick={onlyRegister}><Icon name="tag" size={18} /> Só registrar preço (não comprei)</Btn2></div>

      {history.length > 0 && <div className="text-[11px] font-bold text-slatey uppercase tracking-wide mt-4 mb-1.5">Últimos registros</div>}
      {history.slice(0, 4).map((r, i) => (
        <div key={i} className="flex items-center py-2 border-b border-[#F0F4F3] gap-2 last:border-0">
          <span className="text-[13px] font-semibold flex-1">{r.store}</span>
          <span className="text-xs text-slatey">{r.date}</span>
          <span className="text-sm font-bold text-teal mx-1.5">{money(r.unitPrice)}{r.unit === 'kg' ? '/kg' : ''}</span>
          <button onClick={() => openSheet('editPrice', { itemId, index: i })}
            className="w-7 h-7 rounded-lg bg-[#F5F9F8] text-slatey flex items-center justify-center"><Icon name="pencil" size={14} /></button>
        </div>
      ))}

      <button onClick={() => { closeSheet(); go('comparacao', itemId); }}
        className="flex items-center justify-center gap-1.5 text-teal text-sm font-semibold py-3 mt-1 w-full">
        <Icon name="bar-chart-2" size={16} /> Ver histórico completo e comparação
      </button>
      <div className="mt-1"><Btn2 onClick={closeSheet}>Fechar</Btn2></div>
    </>
  );
}

// ---------------- Editar um preço do histórico (preserva loja e data) ----------------
function EditPriceSheet({ itemId, index }) {
  const rec = useStore((s) => (s.priceHistory[itemId] || [])[index]);
  const updatePrice = useStore((s) => s.updatePrice);
  const deletePrice = useStore((s) => s.deletePrice);
  const { closeSheet, toast } = useUI.getState();
  const [unit, setUnit] = useState(rec?.unit || 'un');
  const [price, setPrice] = useState(rec ? rec.unitPrice.toFixed(2).replace('.', ',') : '');
  if (!rec) return null;

  const save = () => {
    if (parseNum(price) <= 0) return toast('Informe o preço');
    updatePrice(itemId, index, parseNum(price), unit);
    closeSheet(); toast('Preço atualizado');
  };

  return (
    <>
      <div className="text-[19px] font-bold text-ink">Editar preço</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">{rec.store} · {rec.date} (loja e data preservadas)</div>
      <UnitToggle unit={unit} onChange={setUnit} />
      <div className="flex items-center gap-2 bg-[#F5F9F8] border-2 border-teal rounded-2xl px-4 py-3 mb-3.5">
        <span className="text-base font-bold text-teal">R$</span>
        <input inputMode="numeric" value={price} onChange={(e) => setPrice(maskMoney(e.target.value))}
          className="bg-transparent outline-none text-[26px] font-extrabold flex-1 w-full" autoFocus />
        <span className="text-sm text-slatey font-semibold">{unit === 'kg' ? '/kg' : '/un'}</span>
      </div>
      <Btn onClick={save}>Salvar preço</Btn>
      <div className="mt-2"><Btn2 className="!border-coral !text-coral" onClick={() => { deletePrice(itemId, index); closeSheet(); toast('Preço excluído'); }}><Icon name="trash-2" size={18} /> Excluir este preço</Btn2></div>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}

// ---------------- Adicionar item à lista ----------------
function AddItemSheet({ listId }) {
  const catalog = useStore((s) => s.catalog);
  const list = useStore((s) => s.lists.find((l) => l.id === listId));
  const addItemToList = useStore((s) => s.addItemToList);
  const { closeSheet, toast, openSheet } = useUI.getState();
  const [q, setQ] = useState('');

  const inList = new Set(list?.items.map((i) => i.itemId));
  const results = catalog.filter((i) =>
    !inList.has(i.id) && (i.name + ' ' + (i.brand || '')).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="text-[19px] font-bold text-ink">Adicionar item</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Busque no catálogo ou crie novo</div>
      <div className="flex items-center gap-2.5 bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-3.5 py-2.5 mb-3.5">
        <Icon name="search" size={18} className="text-slatey" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." autoFocus
          className="flex-1 bg-transparent outline-none text-[15px]" />
      </div>
      {results.slice(0, 6).map((it) => (
        <button key={it.id} onClick={() => { addItemToList(listId, it.id, 1, it.defaultSold); closeSheet(); toast(`"${it.name}" adicionado`); }}
          className="w-full flex items-center py-2.5 border-b border-[#F5F9F8] gap-3 last:border-0 text-left">
          <div className="w-9 h-9 rounded-xl bg-teal-soft text-teal flex items-center justify-center"><Icon name="package" size={18} /></div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{it.name}{it.brand ? ` · ${it.brand}` : ''}</div>
          </div>
          <Icon name="plus-circle" size={22} className="text-teal" />
        </button>
      ))}
      <div className="mt-3"><Btn2 onClick={() => openSheet('newItem', { listId, prefill: q })}><Icon name="plus" size={18} /> Criar item novo</Btn2></div>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Fechar</Btn2></div>
    </>
  );
}

// ---------------- Novo item no catálogo ----------------
function NewItemSheet({ listId, prefill }) {
  const categories = useStore((s) => s.categories);
  const addCatalogItem = useStore((s) => s.addCatalogItem);
  const addCategory = useStore((s) => s.addCategory);
  const addItemToList = useStore((s) => s.addItemToList);
  const { closeSheet, toast } = useUI.getState();
  const [name, setName] = useState(prefill || '');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id);
  const [unit, setUnit] = useState('un');
  const [newCat, setNewCat] = useState(false);
  const [catName, setCatName] = useState('');

  const create = () => {
    if (!name.trim()) return toast('Dê um nome ao item');
    const it = addCatalogItem({ name: name.trim(), brand: brand.trim() || null, categoryId, defaultSold: unit });
    if (listId) addItemToList(listId, it.id, 1, unit);
    closeSheet(); toast('Item criado' + (listId ? ' e adicionado' : ''));
  };
  const confirmCat = () => {
    if (!catName.trim()) return toast('Nome da categoria');
    const c = addCategory(catName.trim());
    setCategoryId(c.id); setNewCat(false); setCatName(''); toast('Categoria criada');
  };

  const field = 'w-full bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-4 py-3 outline-none text-[15px] mb-2.5';
  return (
    <>
      <div className="text-[19px] font-bold text-ink">Novo item</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Adicione ao seu catálogo</div>
      <input className={field} placeholder="Nome (ex: Arroz 5kg)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <input className={field} placeholder="Marca (opcional)" value={brand} onChange={(e) => setBrand(e.target.value)} />
      {newCat ? (
        <div className="flex gap-2 mb-2.5">
          <input className="flex-1 bg-[#F5F9F8] border-[1.5px] border-teal rounded-2xl px-4 py-3 outline-none text-[15px]"
            placeholder="Nova categoria" value={catName} onChange={(e) => setCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmCat()} autoFocus />
          <Btn className="!w-auto px-5" onClick={confirmCat}>OK</Btn>
        </div>
      ) : (
        <div className="flex gap-2 mb-2.5">
          <select className={field + ' !mb-0 flex-1'} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => setNewCat(true)} className="w-12 rounded-2xl bg-teal-soft text-teal flex items-center justify-center shrink-0"><Icon name="plus" size={20} /></button>
        </div>
      )}
      <UnitToggle unit={unit} onChange={setUnit} />
      <Btn onClick={create}>Criar item</Btn>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}

// ---------------- Editar / excluir item do catálogo ----------------
function EditCatalogSheet({ itemId }) {
  const it = useStore((s) => itemById(s, itemId));
  const categories = useStore((s) => s.categories);
  const updateCatalogItem = useStore((s) => s.updateCatalogItem);
  const deleteCatalogItem = useStore((s) => s.deleteCatalogItem);
  const { closeSheet, toast, go } = useUI.getState();
  const [name, setName] = useState(it?.name || '');
  const [brand, setBrand] = useState(it?.brand || '');
  const [categoryId, setCategoryId] = useState(it?.categoryId);
  const [unit, setUnit] = useState(it?.defaultSold || 'un');
  if (!it) return null;

  const save = () => {
    if (!name.trim()) return toast('Dê um nome ao item');
    updateCatalogItem(itemId, { name: name.trim(), brand: brand.trim() || null, categoryId, defaultSold: unit });
    closeSheet(); toast('Item atualizado');
  };
  const remove = () => {
    deleteCatalogItem(itemId); closeSheet(); go('catalogo');
    toast('Item excluído do catálogo');
  };
  const field = 'w-full bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-4 py-3 outline-none text-[15px] mb-2.5';
  return (
    <>
      <div className="text-[19px] font-bold text-ink">Editar item</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Corrija ou remova do catálogo</div>
      <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
      <input className={field} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca (opcional)" />
      <select className={field} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <UnitToggle unit={unit} onChange={setUnit} />
      <Btn onClick={save}>Salvar</Btn>
      <div className="mt-2"><Btn2 className="!border-coral !text-coral" onClick={remove}><Icon name="trash-2" size={18} /> Excluir do catálogo</Btn2></div>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}

// ---------------- Escolher lista (catálogo -> lista) ----------------
function PickListSheet({ itemId }) {
  const lists = useStore((s) => s.lists);
  const addItemToList = useStore((s) => s.addItemToList);
  const it = useStore((s) => itemById(s, itemId));
  const { closeSheet, toast } = useUI.getState();
  return (
    <>
      <div className="text-[19px] font-bold text-ink">Adicionar a qual lista?</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">{it?.name}</div>
      {lists.map((l) => {
        const already = l.items.some((x) => x.itemId === itemId);
        return (
          <button key={l.id} disabled={already}
            onClick={() => { addItemToList(l.id, itemId, 1, it?.defaultSold || 'un'); closeSheet(); toast(`Adicionado a "${l.name}"`); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 border-[1.5px] text-left ${already ? 'border-[#E8F0EE] opacity-50' : 'border-[#E8F0EE] active:bg-teal-soft'}`}>
            <div className="w-9 h-9 rounded-xl bg-teal-soft text-teal flex items-center justify-center"><Icon name={l.icon} size={18} /></div>
            <span className="text-[15px] font-medium text-ink flex-1">{l.name}</span>
            {already && <span className="text-xs text-slatey">já está</span>}
          </button>
        );
      })}
      <div className="mt-2"><Btn2 onClick={closeSheet}>Fechar</Btn2></div>
    </>
  );
}

// ---------------- Nova loja ----------------
function StoreSheet({ listId }) {
  const addStore = useStore((s) => s.addStore);
  const setActiveStore = useStore((s) => s.setActiveStore);
  const { closeSheet, toast } = useUI.getState();
  const [name, setName] = useState('');
  const add = () => {
    const n = name.trim(); if (!n) return toast('Informe o nome');
    addStore(n); if (listId) setActiveStore(listId, n);
    closeSheet(); toast('Loja adicionada: ' + n);
  };
  return (
    <>
      <div className="text-[19px] font-bold text-ink">Nova loja</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Mercado, feira, atacadão...</div>
      <div className="flex items-center gap-2.5 bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-3.5 py-3 mb-3.5">
        <Icon name="store" size={18} className="text-slatey" />
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Nome da loja" autoFocus className="flex-1 bg-transparent outline-none text-[15px]" />
      </div>
      <Btn onClick={add}>Adicionar loja</Btn>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}

// ---------------- Editar orçamento ----------------
function BudgetSheet() {
  const budgetLimit = useStore((s) => s.budgetLimit);
  const setBudget = useStore((s) => s.setBudget);
  const { closeSheet, toast } = useUI.getState();
  const [val, setVal] = useState(budgetLimit.toLocaleString('pt-BR'));
  const save = () => {
    const v = parseInt(String(val).replace(/\D/g, ''), 10);
    if (!v) return toast('Informe um valor');
    setBudget(v); closeSheet(); toast('Orçamento atualizado');
  };
  return (
    <>
      <div className="text-[19px] font-bold text-ink">Editar orçamento</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Seu limite de gastos do mês</div>
      <div className="flex items-center gap-2 bg-[#F5F9F8] border-2 border-teal rounded-2xl px-4 py-3 mb-3.5">
        <span className="text-base font-bold text-teal">R$</span>
        <input inputMode="numeric" value={val} onChange={(e) => setVal(maskInt(e.target.value))} onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="0" className="bg-transparent outline-none text-[26px] font-extrabold flex-1 w-full" autoFocus />
      </div>
      <Btn onClick={save}>Salvar orçamento</Btn>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}

// ---------------- Menu da lista ----------------
function ListMenu({ listId }) {
  const list = useStore((s) => s.lists.find((l) => l.id === listId));
  const renameList = useStore((s) => s.renameList);
  const deleteList = useStore((s) => s.deleteList);
  const { closeSheet, toast, go, openSheet, setEditMode } = useUI.getState();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list?.name || '');
  if (!list) return null;

  return (
    <>
      <div className="text-[19px] font-bold text-ink">{list.name}</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Opções da lista</div>
      {editing ? (
        <div className="flex gap-2 mb-2">
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
            className="flex-1 bg-[#F5F9F8] border-[1.5px] border-teal rounded-2xl px-4 py-3 outline-none text-[15px]" />
          <Btn className="!w-auto px-5" onClick={() => { renameList(listId, name.trim() || list.name); setEditing(false); toast('Renomeado'); }}>OK</Btn>
        </div>
      ) : (
        <Btn2 onClick={() => setEditing(true)}><Icon name="pencil" size={18} /> Renomear</Btn2>
      )}
      <div className="mt-2"><Btn2 onClick={() => { closeSheet(); openSheet('addItem', { listId }); }}><Icon name="plus" size={18} /> Adicionar itens</Btn2></div>
      <div className="mt-2"><Btn2 onClick={() => { setEditMode(true); closeSheet(); }}><Icon name="list-checks" size={18} /> Gerenciar / remover itens</Btn2></div>
      <div className="mt-2"><Btn2 className="!border-coral !text-coral" onClick={() => { deleteList(listId); closeSheet(); go('home'); toast('Lista excluída'); }}><Icon name="trash-2" size={18} /> Excluir lista</Btn2></div>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Fechar</Btn2></div>
    </>
  );
}

// ---------------- Editar item da lista (quantidade planejada) ----------------
function EditItemSheet({ listId, itemId }) {
  const it = useStore((s) => itemById(s, itemId));
  const li = useStore((s) => s.lists.find((l) => l.id === listId)?.items.find((x) => x.itemId === itemId));
  const setPlannedQty = useStore((s) => s.setPlannedQty);
  const removeItemFromList = useStore((s) => s.removeItemFromList);
  const { closeSheet, toast } = useUI.getState();
  const [qty, setQty] = useState(li?.plannedQty || 1);
  const [unit, setUnit] = useState(li?.plannedUnit || 'un');
  if (!it) return null;

  const save = () => { setPlannedQty(listId, itemId, Math.max(1, qty), unit); closeSheet(); toast('Quantidade atualizada'); };

  return (
    <>
      <div className="text-[19px] font-bold text-ink">{it.name}{it.brand ? ` · ${it.brand}` : ''}</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Quantidade que você quer comprar</div>
      <UnitToggle unit={unit} onChange={setUnit} />
      <div className="flex items-center gap-3.5 justify-center my-1.5 mb-4">
        <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 rounded-xl bg-teal-soft text-teal text-2xl font-bold">−</button>
        <span className="text-3xl font-extrabold min-w-[80px] text-center">{qty} <span className="text-lg text-slatey">{unit}</span></span>
        <button onClick={() => setQty(qty + 1)} className="w-11 h-11 rounded-xl bg-teal-soft text-teal text-2xl font-bold">+</button>
      </div>
      <Btn onClick={save}>Salvar</Btn>
      <div className="mt-2"><Btn2 className="!border-coral !text-coral" onClick={() => { removeItemFromList(listId, itemId); closeSheet(); toast('Item removido'); }}><Icon name="trash-2" size={18} /> Remover da lista</Btn2></div>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}

// ---------------- Finalizar compra ----------------
function FinalizeSheet({ listId }) {
  const methods = useStore((s) => s.paymentMethods);
  const finalize = useStore((s) => s.finalizePurchase);
  const { closeSheet, toast, go } = useUI.getState();
  const [method, setMethod] = useState(methods[0]);

  const confirm = () => {
    finalize(listId, method);
    const p = useStore.getState().purchases[0];
    closeSheet();
    if (p) { go('resumo', p.id); toast('Compra finalizada'); }
    else toast('Nenhum item comprado');
  };
  return (
    <>
      <div className="text-[19px] font-bold text-ink">Finalizar compra</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Como você pagou?</div>
      {methods.map((m) => (
        <button key={m} onClick={() => setMethod(m)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 border-[1.5px] ${method === m ? 'border-teal bg-teal-soft' : 'border-[#E8F0EE] bg-white'}`}>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m ? 'border-teal' : 'border-[#D1E5E2]'}`}>
            {method === m && <div className="w-2.5 h-2.5 rounded-full bg-teal" />}
          </div>
          <span className="text-[15px] font-medium text-ink">{m}</span>
        </button>
      ))}
      <div className="mt-2"><Btn onClick={confirm}>Confirmar e finalizar</Btn></div>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}

// ---------------- Nova lista ----------------
function NewListSheet() {
  const addList = useStore((s) => s.addList);
  const { closeSheet, toast } = useUI.getState();
  const [name, setName] = useState('');
  const icons = ['shopping-cart', 'leaf', 'zap', 'apple', 'beef', 'milk'];
  const [icon, setIcon] = useState(icons[0]);
  const create = () => {
    if (!name.trim()) return toast('Dê um nome à lista');
    addList(name.trim(), icon); closeSheet(); toast('Lista criada');
  };
  return (
    <>
      <div className="text-[19px] font-bold text-ink">Nova lista</div>
      <div className="text-[13px] text-slatey mt-0.5 mb-4">Ex: Compra Quinzenal, Frutas...</div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da lista" autoFocus
        className="w-full bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-4 py-3 outline-none text-[15px] mb-3" />
      <div className="flex gap-2 mb-4 flex-wrap">
        {icons.map((ic) => (
          <button key={ic} onClick={() => setIcon(ic)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${icon === ic ? 'bg-teal text-white' : 'bg-teal-soft text-teal'}`}>
            <Icon name={ic} size={20} />
          </button>
        ))}
      </div>
      <Btn onClick={create}>Criar lista</Btn>
      <div className="mt-2"><Btn2 onClick={closeSheet}>Cancelar</Btn2></div>
    </>
  );
}
