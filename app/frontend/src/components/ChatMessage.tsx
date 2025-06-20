import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageType } from '../types';
import { formatDate } from '../utils/helpers';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ content, type, timestamp }) => {
  const isUser = type === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-blue-100 text-blue-600 ml-2 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-purple-100 text-purple-600 mr-2 dark:bg-purple-900 dark:text-purple-300'
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div>
          <div
            className={`p-3 rounded-lg shadow-sm transition-colors ${
              isUser
                ? 'bg-blue-600 text-white rounded-br-none dark:bg-blue-500'
                : 'bg-white border border-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-bl-none'
            }`}
          >
            {content && (
              <div className='prose dark:prose-invert max-w-none prose-sm'>
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatDate(timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
