import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Attachment } from '../types';
import { generateId } from '../utils/helpers';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ChatInput from '../components/ChatInput';
import Button from '../components/ui/Button';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import ChatMessage from '../components/ChatMessage';

interface ChatPageProps {
  session: Session;
}

const API_BASE_URL = 'http://localhost:8000';

const ChatPage: React.FC<ChatPageProps> = ({ session }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const currentSessionIdRef = useRef<string>(generateId());
  const attachmentUrlsRef = useRef<Set<string>>(new Set());

  const userDisplayName = session.user?.user_metadata?.name || session.user?.email || 'User';

  // Reset conversation when user changes
  useEffect(() => {
    // Cleanup old attachment URLs
    attachmentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    attachmentUrlsRef.current.clear();

    setMessages([]);
    currentSessionIdRef.current = generateId();
  }, [session.user.id]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      attachmentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out. Please try again.');
    }
  }, []);

  const createFormData = useCallback((text: string, files?: File[]) => {
    const formData = new FormData();
    formData.append('pregunta', text);
    formData.append('session_id', currentSessionIdRef.current);

    files?.forEach((file) => formData.append('files', file, file.name));

    return formData;
  }, []);

  const processFiles = useCallback((files: File[]): Attachment[] => {
    return files.map((file) => {
      const url = URL.createObjectURL(file);
      attachmentUrlsRef.current.add(url);
      return {
        name: file.name,
        url,
        type: file.type,
      };
    });
  }, []);

  const handleSendMessage = useCallback(
    async (text: string, files?: File[]) => {
      const trimmedText = text.trim();
      if (!trimmedText && !files?.length) return;

      const tempAttachments = files?.length ? processFiles(files) : undefined;

      const userMessage: Message = {
        id: generateId(),
        content: trimmedText,
        type: 'user',
        timestamp: new Date(),
        attachments: tempAttachments,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const formData = createFormData(trimmedText, files);

        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.detail || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: generateId(),
          content: data.respuesta,
          type: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.session_id && data.session_id !== currentSessionIdRef.current) {
          currentSessionIdRef.current = data.session_id;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
        setError(errorMessage);

        const errorResponse: Message = {
          id: generateId(),
          content: `Assistant Error: ${errorMessage}`,
          type: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    },
    [createFormData, processFiles]
  );

  return (
    <div className='flex flex-col h-screen max-w-5xl mx-auto p-6 gradient-surface transition-colors duration-300'>
      <header className='mb-8 flex items-center justify-between'>
        <div className='text-left'>
          <h1 className='text-5xl font-bold text-gradient mb-2'>ISST AI Tutor</h1>
          <p className='text-sm text-neutral-600 dark:text-dark-600 mt-1'>
            Logged in as:{' '}
            <span className='font-semibold text-primary-600 dark:text-primary-400'>{userDisplayName}</span>
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Button
            onClick={toggleTheme}
            variant='outline'
            size='sm'
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            icon={theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
            className='rounded-xl border-2 hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-500 dark:hover:bg-primary-950'
          />
          <Button
            onClick={handleSignOut}
            variant='outline'
            size='sm'
            aria-label='Sign Out'
            className='rounded-xl border-2 hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-500 dark:hover:bg-primary-950'
          >
            <LogOut className='mr-2 h-4 w-4' />
            Sign Out
          </Button>
        </div>
      </header>

      <div className='flex-grow overflow-y-auto mb-6 p-6 card-elevated space-y-6 backdrop-blur-sm'>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            content={msg.content}
            type={msg.type}
            timestamp={msg.timestamp}
            attachments={msg.attachments}
          />
        ))}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='p-4 rounded-2xl bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-dark-200 dark:to-dark-100 shadow-soft'>
              <p className='text-sm text-neutral-600 dark:text-dark-600 font-medium'>Assistant is thinking...</p>
            </div>
          </div>
        )}

        {error && (
          <div className='flex justify-center'>
            <p className='text-sm text-error-600 bg-error-50 dark:bg-error-500/10 px-4 py-3 rounded-xl border border-error-200 dark:border-error-500/20'>
              {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isProcessing={isLoading} />
    </div>
  );
};

export default ChatPage;
