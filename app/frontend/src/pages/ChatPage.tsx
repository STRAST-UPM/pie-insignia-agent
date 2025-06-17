import React, { useState, useEffect, useRef } from 'react';
import { Message, Attachment } from '../types';
import { generateId } from '../utils/helpers';
import { User, Bot, Sun, Moon, Paperclip, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ChatInput from '../components/ChatInput';
import Button from '../components/ui/Button';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface ChatPageProps {
  session: Session;
}

const ChatPage: React.FC<ChatPageProps> = ({ session }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const currentSessionIdRef = useRef<string>(generateId());

  useEffect(() => {
    if (session?.user) {
      const { user } = session;
      const name = user.user_metadata?.name || user.email || 'User';
      setUserDisplayName(name);
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      setError('Failed to sign out. Please try again.');
    } else {
      setMessages([]);
      setUserDisplayName(null);
      currentSessionIdRef.current = generateId();
    }
  };

  const handleSendMessage = async (text: string, files?: File[]) => {
    const trimmedText = text.trim();
    if (!trimmedText && (!files || files.length === 0)) return;

    const tempAttachments: Attachment[] = (files || []).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    const userMessage: Message = {
      id: generateId(),
      content: trimmedText,
      type: 'user',
      timestamp: new Date(),
      attachments: tempAttachments.length > 0 ? tempAttachments : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pregunta', trimmedText);
    formData.append('session_id', currentSessionIdRef.current);
    if (files) {
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });
    }

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || `Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          content: data.respuesta,
          type: 'assistant',
          timestamp: new Date(),
        },
      ]);

      if (data.session_id && data.session_id !== currentSessionIdRef.current) {
        currentSessionIdRef.current = data.session_id;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          content: `Assistant Error: ${errorMessage}`,
          type: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      tempAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    }
  };

  return (
    <div className='flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
      <header className='mb-6 flex items-center justify-between'>
        <div className='text-left'>
          <h1 className='text-4xl font-bold text-blue-600 dark:text-blue-400'>ISST AI Tutor</h1>
          {userDisplayName && (
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Logged in as: {userDisplayName}</p>
          )}
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
          <div
            key={msg.id}
            className={`flex animate-slide-in ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl shadow ${
                msg.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-purple-500 text-white rounded-bl-none dark:bg-purple-600'
              }`}
            >
              <div className='flex items-center mb-1'>
                {msg.type === 'user' ? <User className='w-4 h-4 mr-2' /> : <Bot className='w-4 h-4 mr-2' />}
                <span className='text-xs font-semibold'>
                  {msg.type === 'user' ? userDisplayName || 'You' : 'Assistant'}
                </span>
                <span className='text-xs opacity-70 ml-2'>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className='text-sm'>{msg.content}</p>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className='mt-2'>
                  {msg.attachments.map((attachment) => (
                    <a
                      key={attachment.name}
                      href={attachment.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-200 hover:underline'
                    >
                      <Paperclip className='inline-block w-4 h-4 mr-1' />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
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
            <p className='text-sm text-red-500'>{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isProcessing={isLoading} />
    </div>
  );
};

export default ChatPage;
