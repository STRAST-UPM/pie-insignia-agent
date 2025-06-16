import React, { useState, useEffect, useRef } from 'react';
import { Message, Attachment } from '../types';
import { generateId } from '../utils/helpers';
import { User, Bot, Sun, Moon, Paperclip } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ChatInput from '../components/ChatInput';
import Button from '../components/ui/Button';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = generateId();
    setCurrentSessionId(newSessionId);
    console.log('Chat session started with ID:', newSessionId);
  }, []);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string, files?: File[]) => {
    if ((!text || !text.trim()) && (!files || files.length === 0)) return;
    if (!currentSessionId) return;

    const userMessageContent = text.trim();
    const tempAttachments: Attachment[] = [];

    if (files && files.length > 0) {
      files.forEach((file) => {
        tempAttachments.push({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        });
      });
    }

    const userMessage: Message = {
      id: generateId(),
      content: userMessageContent,
      type: 'user',
      timestamp: new Date(),
      attachments: tempAttachments.length > 0 ? tempAttachments : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pregunta', userMessageContent);
    formData.append('session_id', currentSessionId);
    if (files && files.length > 0) {
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
        let errorDetailMessage = `Error: ${response.status} ${response.statusText || ''}`.trim();
        try {
          const errorData = await response.json();
          errorDetailMessage = errorData.detail || errorDetailMessage;
        } catch (jsonParseError) {
          // If parsing JSON fails, the original status text is already part of errorDetailMessage
          // console.error("Failed to parse error response JSON:", jsonParseError);
        }
        throw new Error(errorDetailMessage);
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

      if (data.session_id && data.session_id !== currentSessionId) {
        setCurrentSessionId(data.session_id);
        console.log('Session ID updated by backend to:', data.session_id);
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
      // Revoke object URLs for all temporary attachments
      tempAttachments.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    }
  };

  return (
    <div className='flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200'>
      <header className='mb-6 text-center flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold text-blue-600 dark:text-blue-400'>ISST AI Tutor</h1>
          {currentSessionId && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Session: {currentSessionId}</p>
          )}
        </div>
        <Button
          onClick={toggleTheme}
          variant='ghost'
          size='sm'
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          icon={theme === 'dark' ? <Sun /> : <Moon />}
        />
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
                <span className='text-xs font-semibold'>{msg.type === 'user' ? 'You' : 'Assistant'}</span>
                <span className='text-xs opacity-70 ml-2'>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {msg.content && <p className='text-sm whitespace-pre-wrap'>{msg.content}</p>}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className='mt-2 grid grid-cols-1 gap-2'>
                  {msg.attachments.map((attachment, index) => (
                    <div key={index} className='p-2 border dark:border-gray-600 rounded-md'>
                      {attachment.type.startsWith('image/') ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className='max-w-full h-auto rounded-md max-h-60 object-contain'
                        />
                      ) : (
                        <div className='flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md'>
                          <Paperclip size={20} className='mr-2 flex-shrink-0' />
                          <span className='text-sm truncate'>
                            {attachment.name} ({attachment.type})
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      {error && (
        <div className='mb-2 p-3 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm'>
          {error}
        </div>
      )}

      {/* Usar el componente ChatInput aquí */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isProcessing={isLoading || !currentSessionId}
        placeholder={currentSessionId ? 'Escribe tu pregunta o adjunta archivos...' : 'Inicializando sesión...'}
      />

      {/* El siguiente bloque <form> fue reemplazado por ChatInput y debe ser eliminado si aún existe. */}
      {/* Este bloque fue eliminado para evitar duplicados. */}

      {!currentSessionId && (
        <p className='text-xs text-center text-gray-400 dark:text-gray-600 mt-1'>Initializing session...</p>
      )}
    </div>
  );
};

export default ChatPage;
