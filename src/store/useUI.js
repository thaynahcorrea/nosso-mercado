import { create } from 'zustand';

// Estado de interface (navegação, sheets, toast) — não persistido.
export const useUI = create((set, get) => ({
  screen: 'home',
  param: null,
  history: [],
  sheet: null,      // {type, data}
  toastMsg: null,
  editMode: false,  // modo "gerenciar itens" da lista

  setEditMode: (v) => set({ editMode: v }),

  go: (screen, param = null) =>
    set((s) => ({ screen, param, editMode: false, history: [...s.history, { screen: s.screen, param: s.param }] })),
  back: () =>
    set((s) => {
      const prev = s.history[s.history.length - 1] || { screen: 'home', param: null };
      return { screen: prev.screen, param: prev.param, editMode: false, history: s.history.slice(0, -1) };
    }),

  openSheet: (type, data = null) => set({ sheet: { type, data } }),
  closeSheet: () => set({ sheet: null }),

  toast: (msg) => {
    set({ toastMsg: msg });
    clearTimeout(get()._t);
    const t = setTimeout(() => set({ toastMsg: null }), 1900);
    set({ _t: t });
  },
}));
