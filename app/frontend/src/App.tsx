import './index.css';
import ChatPage from './pages/ChatPage';
import { ThemeProvider } from './context/ThemeContext';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '320px' }}>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['github', 'google']} // Add other providers as needed
          />
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ChatPage />
    </ThemeProvider>
  );
};

export default App;
