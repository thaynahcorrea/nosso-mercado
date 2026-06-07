import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid, monthKey, todayBR } from '../lib/format';

// ---------------------------------------------------------------------------
// Dados iniciais (seed). O usuário poderá editar tudo dentro do app depois.
// ---------------------------------------------------------------------------
const seed = () => {
  const cat = (name) => ({ id: uid(), name });
  const categories = ['Laticínios', 'Carnes', 'Hortifruti', 'Massas', 'Limpeza'].map(cat);
  const catId = (n) => categories.find((c) => c.name === n).id;

  const item = (name, catName, defaultSold, brand = null) => ({
    id: uid(), name, brand, categoryId: catId(catName), defaultSold,
  });
  const catalog = [
    item('Manteiga 200g', 'Laticínios', 'un'),
    item('Leite Integral 1L', 'Laticínios', 'un'),
    item('Queijo Prato', 'Laticínios', 'un', 'Tirolez'),
    item('Frango Inteiro', 'Carnes', 'kg'),
    item('Acém', 'Carnes', 'kg'),
    item('Cebola', 'Hortifruti', 'kg'),
    item('Macarrão Espaguete', 'Massas', 'un', 'Renata'),
    item('Detergente', 'Limpeza', 'un'),
    item('Sabão em Pó', 'Limpeza', 'un'),
  ];
  const byName = (n) => catalog.find((i) => i.name === n).id;

  const lists = [
    {
      id: uid(), name: 'Compra Quinzenal', icon: 'shopping-cart',
      items: [
        { itemId: byName('Manteiga 200g'), plannedQty: 3, plannedUnit: 'un' },
        { itemId: byName('Leite Integral 1L'), plannedQty: 6, plannedUnit: 'un' },
        { itemId: byName('Queijo Prato'), plannedQty: 1, plannedUnit: 'un' },
        { itemId: byName('Frango Inteiro'), plannedQty: 1, plannedUnit: 'kg' },
        { itemId: byName('Acém'), plannedQty: 1, plannedUnit: 'kg' },
        { itemId: byName('Cebola'), plannedQty: 3, plannedUnit: 'un' },
        { itemId: byName('Detergente'), plannedQty: 2, plannedUnit: 'un' },
        { itemId: byName('Sabão em Pó'), plannedQty: 1, plannedUnit: 'un' },
      ],
    },
    { id: uid(), name: 'Frutas da Semana', icon: 'leaf', items: [] },
    { id: uid(), name: 'Mercadinho Rápido', icon: 'zap', items: [] },
  ];

  return {
    categories,
    catalog,
    lists,
    stores: ['Fribal', 'Mateus'],
    paymentMethods: ['Ticket', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'],
    budgetLimit: 2075,
    priceHistory: {},   // { itemId: [ {store, unitPrice, unit, date} ] }
    purchases: [],      // compras finalizadas
  };
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useStore = create(
  persist(
    (set, get) => ({
      ...seed(),

      // sessão de compra em andamento, por lista:
      // cart[listId] = { store, lines: { itemId: {store, unitPrice, soldUnit, qty, total} } }
      cart: {},

      // ----- Catálogo / itens -----
      addCatalogItem: (data) => {
        const it = { id: uid(), brand: null, defaultSold: 'un', ...data };
        set((s) => ({ catalog: [...s.catalog, it] }));
        return it;
      },

      addCategory: (name) => {
        const c = { id: uid(), name };
        set((s) => ({ categories: [...s.categories, c] }));
        return c;
      },

      // ----- Listas -----
      addList: (name, icon = 'shopping-cart') =>
        set((s) => ({ lists: [...s.lists, { id: uid(), name, icon, items: [] }] })),
      renameList: (listId, name) =>
        set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, name } : l)) })),
      deleteList: (listId) =>
        set((s) => {
          const cart = { ...s.cart }; delete cart[listId];
          return { lists: s.lists.filter((l) => l.id !== listId), cart };
        }),

      addItemToList: (listId, itemId, plannedQty = 1, plannedUnit = 'un') =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId && !l.items.some((i) => i.itemId === itemId)
              ? { ...l, items: [...l.items, { itemId, plannedQty, plannedUnit }] }
              : l),
        })),
      removeItemFromList: (listId, itemId) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId ? { ...l, items: l.items.filter((i) => i.itemId !== itemId) } : l),
        })),
      setPlannedQty: (listId, itemId, plannedQty, plannedUnit) =>
        set((s) => ({
          lists: s.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.map((i) => (i.itemId === itemId ? { ...i, plannedQty, plannedUnit } : i)) }
              : l),
        })),

      // ----- Lojas / orçamento -----
      addStore: (name) =>
        set((s) => (s.stores.includes(name) ? {} : { stores: [...s.stores, name] })),
      setBudget: (limit) => set({ budgetLimit: limit }),

      // ----- Loja ativa da sessão -----
      setActiveStore: (listId, store) =>
        set((s) => ({ cart: { ...s.cart, [listId]: { ...(s.cart[listId] || { lines: {} }), store } } })),

      // ----- Registrar preço (somente histórico) -----
      registerPrice: (itemId, store, unitPrice, unit) =>
        set((s) => {
          const rec = { store, unitPrice, unit, date: todayBR() };
          const hist = s.priceHistory[itemId] ? [...s.priceHistory[itemId]] : [];
          hist.unshift(rec);
          return { priceHistory: { ...s.priceHistory, [itemId]: hist } };
        }),

      deletePrice: (itemId, index) =>
        set((s) => {
          const hist = (s.priceHistory[itemId] || []).filter((_, i) => i !== index);
          return { priceHistory: { ...s.priceHistory, [itemId]: hist } };
        }),

      // edita um preço do histórico preservando loja e data originais
      updatePrice: (itemId, index, unitPrice, unit) =>
        set((s) => {
          const hist = (s.priceHistory[itemId] || []).map((r, i) =>
            i === index ? { ...r, unitPrice, unit } : r);
          return { priceHistory: { ...s.priceHistory, [itemId]: hist } };
        }),

      // editar / excluir item do catálogo
      updateCatalogItem: (itemId, patch) =>
        set((s) => ({ catalog: s.catalog.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })),
      deleteCatalogItem: (itemId) =>
        set((s) => {
          const ph = { ...s.priceHistory }; delete ph[itemId];
          const cart = {};
          for (const [lid, c] of Object.entries(s.cart)) {
            const lines = { ...c.lines }; delete lines[itemId];
            cart[lid] = { ...c, lines };
          }
          return {
            catalog: s.catalog.filter((i) => i.id !== itemId),
            lists: s.lists.map((l) => ({ ...l, items: l.items.filter((x) => x.itemId !== itemId) })),
            priceHistory: ph, cart,
          };
        }),

      // ----- Marcar como comprado (sessão) -----
      buyItem: (listId, itemId, { store, unitPrice = 0, soldUnit = 'un', qty = 1 }) =>
        set((s) => {
          const total = unitPrice * qty;
          const cur = s.cart[listId] || { store, lines: {} };
          const lines = { ...cur.lines, [itemId]: { store, unitPrice, soldUnit, qty, total } };
          const next = { cart: { ...s.cart, [listId]: { ...cur, store, lines } } };
          // só grava no histórico se houver preço (> 0)
          if (unitPrice > 0) {
            const rec = { store, unitPrice, unit: soldUnit, date: todayBR() };
            const hist = s.priceHistory[itemId] ? [...s.priceHistory[itemId]] : [];
            hist.unshift(rec);
            next.priceHistory = { ...s.priceHistory, [itemId]: hist };
          }
          return next;
        }),

      // marca comprado instantaneamente, sem preço (caso do pão)
      quickBuy: (listId, itemId, store, qty = 1, soldUnit = 'un') =>
        set((s) => {
          const cur = s.cart[listId] || { store, lines: {} };
          const lines = { ...cur.lines, [itemId]: { store, unitPrice: 0, soldUnit, qty, total: 0 } };
          return { cart: { ...s.cart, [listId]: { ...cur, store, lines } } };
        }),
      unbuyItem: (listId, itemId) =>
        set((s) => {
          const cur = s.cart[listId]; if (!cur) return {};
          const lines = { ...cur.lines }; delete lines[itemId];
          return { cart: { ...s.cart, [listId]: { ...cur, lines } } };
        }),

      // ----- Finalizar compra -----
      finalizePurchase: (listId, paymentMethod) =>
        set((s) => {
          const cur = s.cart[listId];
          if (!cur || !Object.keys(cur.lines).length) return {};
          const list = s.lists.find((l) => l.id === listId);
          const lines = Object.entries(cur.lines).map(([itemId, v]) => ({ itemId, ...v }));
          const total = lines.reduce((a, l) => a + l.total, 0);
          const stores = [...new Set(lines.map((l) => l.store))];
          const purchase = {
            id: uid(), listId, listName: list?.name || 'Compra',
            date: new Date().toISOString(), dateBR: todayBR(),
            month: monthKey(), paymentMethod, total, stores, lines,
          };
          const cart = { ...s.cart }; delete cart[listId];
          return { purchases: [purchase, ...s.purchases], cart };
        }),

      resetAll: () => set({ ...seed(), cart: {} }),
    }),
    { name: 'minhas-compras-v1' }
  )
);

// ----- Seletores derivados (helpers fora do store) -----
export const itemById = (state, id) => state.catalog.find((i) => i.id === id);
export const categoryName = (state, id) => state.categories.find((c) => c.id === id)?.name || '—';
export const lastPriceByStore = (state, itemId) => {
  const hist = state.priceHistory[itemId] || [];
  const out = {};
  for (const r of hist) if (!out[r.store]) out[r.store] = r;
  return out; // { store: {unitPrice, unit, date} }
};
export const monthTotal = (state, mk = monthKey()) =>
  state.purchases.filter((p) => p.month === mk).reduce((a, p) => a + p.total, 0);
