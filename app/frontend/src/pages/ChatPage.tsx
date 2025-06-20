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

  const userDisplayName = session.user?.user_metadata?.name || session.user?.email || 'User';

  // Reset conversation when user changes
  useEffect(() => {
    setMessages([]);
    currentSessionIdRef.current = generateId();
  }, [session.user.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
        setError('Failed to sign out. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      setError('An unexpected error occurred during sign out.');
    }
  }, []);

  const createFormData = useCallback((text: string, files?: File[]) => {
    const formData = new FormData();
    formData.append('pregunta', text);
    formData.append('session_id', currentSessionIdRef.current);

    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });
    }

    return formData;
  }, []);

  const processFiles = useCallback((files: File[]): Attachment[] => {
    return files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
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

      // Cleanup object URLs after rendering
      if (tempAttachments) {
        setTimeout(() => {
          tempAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.url));
        }, 10000);
      }

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
    <div className='flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
      <header className='mb-6 flex items-center justify-between'>
        <div className='text-left'>
          <h1 className='text-4xl font-bold text-blue-600 dark:text-blue-400'>ISST AI Tutor</h1>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            Logged in as: <span className='font-medium'>{userDisplayName}</span>
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            onClick={toggleTheme}
            variant='ghost'
            size='sm'
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            icon={theme === 'dark' ? <Sun /> : <Moon />}
          />
          <Button
            onClick={handleSignOut}
            variant='outline'
            size='sm'
            aria-label='Sign Out'
            icon={<LogOut className='mr-2 h-4 w-4' />}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <div className='flex-grow overflow-y-auto mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4'>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} content={msg.content} type={msg.type} timestamp={msg.timestamp} />
        ))}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='p-3 rounded-xl bg-gray-200 dark:bg-gray-700'>
              <p className='text-sm text-gray-600 dark:text-gray-300'>Assistant is thinking...</p>
            </div>
          </div>
        )}

        {error && (
          <div className='flex justify-center'>
            <p className='text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg'>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isProcessing={isLoading} />
    </div>
  );
};

export default ChatPage;
