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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show a loading indicator while session is being determined
  if (loading) {
    return (
      <div className='center-container'>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      // Add a conditional class for light theme when Auth is visible
      <div className='auth-container-light center-container'>
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
      <ChatPage session={session} /> {/* Pass session as a prop */}
    </ThemeProvider>
  );
};

export default App;
