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
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-lg mb-4'>
            <div className='w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin'></div>
          </div>
          <p className='text-lg font-semibold text-neutral-700 dark:text-dark-700'>Loading...</p>
          <p className='text-sm text-neutral-500 dark:text-dark-500 mt-1'>Preparing your AI tutor</p>
        </div>
      </div>
    );
  }
  if (!session) {
    return (
      // Add a conditional class for light theme when Auth is visible
      <div className='auth-container-light center-container'>
        <div
          className='bg-white rounded-3xl shadow-2xl p-8 border border-neutral-200 backdrop-blur-sm'
          style={{ width: '400px' }}
        >
          <div className='text-center mb-6'>
            <h1 className='text-3xl font-bold text-gradient mb-2'>ISST AI Tutor</h1>
            <p className='text-neutral-600 text-sm'>Sign in to continue your learning journey</p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '12px 16px',
                },
                input: {
                  borderRadius: '12px',
                  fontSize: '14px',
                  padding: '12px 16px',
                },
              },
            }}
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
