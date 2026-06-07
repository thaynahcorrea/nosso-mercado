import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se as chaves não estiverem configuradas, o app roda 100% local (sem sincronização).
export const supabaseEnabled = Boolean(url && key);

export const supabase = supabaseEnabled ? createClient(url, key) : null;
