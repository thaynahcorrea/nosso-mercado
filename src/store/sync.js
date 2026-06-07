import { useStore } from './useStore';
import { supabase, supabaseEnabled } from '../lib/supabase';

// Sincroniza TODO o estado do app (documento JSON) com o Supabase.
// Estratégia local-first + last-write-wins.

const DATA_KEYS = ['categories', 'catalog', 'lists', 'stores', 'paymentMethods', 'budgetLimit', 'priceHistory', 'purchases', 'cart'];

let applyingRemote = false; // evita "eco" (re-enviar o que acabamos de receber)
let pushTimer = null;
let channel = null;
let unsubStore = null;
let userId = null;

const snapshot = (state) => {
  const o = {};
  for (const k of DATA_KEYS) o[k] = state[k];
  return o;
};
const applyData = (data) => {
  applyingRemote = true;
  useStore.setState(data);
  applyingRemote = false;
};

async function pushNow() {
  if (!supabaseEnabled || !userId) return;
  const data = snapshot(useStore.getState());
  await supabase.from('app_state').upsert({ id: userId, data, updated_at: new Date().toISOString() });
}
const schedulePush = () => { clearTimeout(pushTimer); pushTimer = setTimeout(pushNow, 1200); };

export async function startSync(uid) {
  if (!supabaseEnabled || !uid) return;
  userId = uid;

  // 1) Puxa o estado compartilhado (se já existir)
  const { data: row } = await supabase.from('app_state').select('data').eq('id', uid).maybeSingle();
  if (row && row.data && Object.keys(row.data).length) {
    applyData(row.data);
  } else {
    await pushNow(); // primeira vez: cria a linha com o estado atual
  }

  // 2) Tempo real: recebe mudanças do outro celular
  channel = supabase
    .channel('app_state_' + uid)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_state', filter: 'id=eq.' + uid }, (payload) => {
      if (payload.new && payload.new.data) applyData(payload.new.data);
    })
    .subscribe();

  // 3) Envia mudanças locais (debounce)
  unsubStore = useStore.subscribe(() => { if (!applyingRemote) schedulePush(); });
}

export async function stopSync() {
  if (unsubStore) { unsubStore(); unsubStore = null; }
  if (channel) { await supabase.removeChannel(channel); channel = null; }
  clearTimeout(pushTimer);
  userId = null;
}
