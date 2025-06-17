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
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // Set loading to false after session is fetched
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); // Also set loading to false on auth state change
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show a loading indicator while session is being determined
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      // Add a conditional class for light theme when Auth is visible
      <div
        className='auth-container-light'
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
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

  // Session exists, render the app within ThemeProvider
  return (
    <ThemeProvider>
      <ChatPage />
    </ThemeProvider>
  );
};

export default App;
