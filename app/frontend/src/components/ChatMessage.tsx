import React from 'react';
import { MessageType } from '../types';
import { formatDate } from '../utils/helpers';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp: Date;
  imageUrl?: string; // Añadido para la imagen
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, type, timestamp, imageUrl, isTyping = false }) => (
  <div className={`flex w-full mb-4 ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`flex max-w-[80%] ${type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          type === 'user' ? 'bg-blue-100 text-blue-600 ml-2' : 'bg-purple-100 text-purple-600 mr-2'
        }`}
      >
        {type === 'user' ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div>
        <div
          className={`p-3 rounded-lg shadow-sm ${
            type === 'user'
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white border border-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none'
          }`}
        >
          {content && <div dangerouslySetInnerHTML={{ __html: formatMessageContent(content) }} />}
          {imageUrl && (
            <div className={`mt-2 ${!content ? 'm-0' : ''}`}>
              <img src={imageUrl} alt='Adjunto' className='max-w-full h-auto rounded-md max-h-60 object-contain' />
            </div>
          )}

          {isTyping && (
            <div className='flex space-x-1 mt-1'>
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className='w-2 h-2 rounded-full bg-gray-300 animate-bounce'
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className={`text-xs text-gray-500 mt-1 ${type === 'user' ? 'text-right' : 'text-left'}`}>
          {formatDate(timestamp)}
        </div>
      </div>
    </div>
  </div>
);

// Convert markdown-like syntax to HTML
const formatMessageContent = (content: string): string =>
  content
    .replace(
      /```([a-z]*)\n([\s\S]*?)\n```/g,
      (_match, _lang, code) =>
        `<pre class="bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto my-2 text-sm"><code>${code}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">$1</code>')
    .replace(/\n/g, '<br>');

export default ChatMessage;
