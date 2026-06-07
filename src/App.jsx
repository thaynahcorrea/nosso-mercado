import { useEffect, useState } from 'react';
import { useUI } from './store/useUI';
import { supabase, supabaseEnabled } from './lib/supabase';
import { startSync, stopSync } from './store/sync';
import { BottomNav, Toast } from './components/Shell';
import Sheets from './components/Sheets';
import Login from './screens/Login';
import Home from './screens/Home';
import Lista from './screens/Lista';
import Catalogo from './screens/Catalogo';
import Comparacao from './screens/Comparacao';
import ResumoMensal from './screens/ResumoMensal';
import ResumoCompra from './screens/ResumoCompra';

const NAV_TAB = { home: 'home', lista: 'home', catalogo: 'catalogo', comparacao: 'catalogo', mensal: 'mensal' };

export default function App() {
  const screen = useUI((s) => s.screen);
  const param = useUI((s) => s.param);
  const [authReady, setAuthReady] = useState(!supabaseEnabled);
  const [session, setSession] = useState(null);

  // sessão de login (só quando o Supabase está configurado)
  useEffect(() => {
    if (!supabaseEnabled) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // liga/desliga a sincronização conforme o login
  useEffect(() => {
    if (!supabaseEnabled) return;
    if (session?.user) startSync(session.user.id);
    return () => { stopSync(); };
  }, [session?.user?.id]);

  let body = null;
  if (screen === 'home') body = <Home />;
  else if (screen === 'lista') body = <Lista listId={param} />;
  else if (screen === 'catalogo') body = <Catalogo />;
  else if (screen === 'comparacao') body = <Comparacao itemId={param} />;
  else if (screen === 'mensal') body = <ResumoMensal />;
  else if (screen === 'resumo') body = <ResumoCompra purchaseId={param} />;

  const showNav = ['home', 'lista', 'catalogo', 'comparacao', 'mensal'].includes(screen);
  const needLogin = supabaseEnabled && authReady && !session;

  return (
    <div className="h-full w-full flex justify-center bg-[#DCE9E7]">
      <div className="relative w-full max-w-[440px] h-full bg-[#F5F9F8] flex flex-col overflow-hidden shadow-xl">
        {!authReady ? (
          <div className="flex-1" />
        ) : needLogin ? (
          <Login />
        ) : (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">{body}</div>
            {showNav && <BottomNav active={NAV_TAB[screen]} />}
            <Sheets />
            <Toast />
          </>
        )}
      </div>
    </div>
  );
}
