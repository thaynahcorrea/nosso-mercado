import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Btn, Btn2 } from '../components/ui';

export default function Login() {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async () => {
    if (!email.trim() || !password) { setMsg('Preencha e-mail e senha'); return; }
    if (password.length < 6) { setMsg('A senha precisa ter ao menos 6 caracteres'); return; }
    setBusy(true); setMsg(null);
    try {
      const creds = { email: email.trim(), password };
      const { error } = mode === 'signin'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp(creds);
      if (error) { setMsg(error.message); return; }
      // sucesso: o App detecta a sessão e troca para a tela principal automaticamente
    } catch (e) {
      setMsg('Não foi possível conectar. Verifique a internet e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full bg-[#F5F9F8] border-[1.5px] border-[#D1E5E2] rounded-2xl px-4 py-3 outline-none text-[15px] mb-3';

  return (
    <div className="flex-1 flex flex-col justify-center px-7 bg-white">
      <div className="w-16 h-16 rounded-2xl bg-teal-soft text-teal flex items-center justify-center mx-auto mb-5">
        <Icon name="shopping-basket" size={30} />
      </div>
      <div className="text-[26px] font-extrabold text-ink text-center">Nosso Mercado</div>
      <div className="text-[14px] text-slatey text-center mb-7">
        {mode === 'signin' ? 'Entre para sincronizar entre celulares' : 'Crie a conta do casal'}
      </div>

      <input className={field} placeholder="E-mail" type="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={field} placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()} />

      {msg && <div className="text-[13px] text-coral mb-3 text-center">{msg}</div>}

      <Btn onClick={submit} className={busy ? 'opacity-60' : ''}>
        {busy ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
      </Btn>
      <div className="mt-2">
        <Btn2 onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null); }}>
          {mode === 'signin' ? 'Criar uma conta nova' : 'Já tenho conta — entrar'}
        </Btn2>
      </div>
    </div>
  );
}
