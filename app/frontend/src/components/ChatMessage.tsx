import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageType, Attachment } from '../types';
import { formatDate } from '../utils/helpers';
import { User, Bot } from 'lucide-react';
import FileAttachments from './FileAttachments';

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp: Date;
  attachments?: Attachment[];
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ content, type, timestamp, attachments }) => {
  const isUser = type === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-medium ${
            isUser
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white ml-3 dark:from-primary-400 dark:to-primary-500'
              : 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white mr-3 dark:from-secondary-400 dark:to-secondary-500'
          }`}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        <div className='min-w-0 flex-1'>
          <div
            className={`p-4 rounded-2xl shadow-soft backdrop-blur-sm transition-all duration-300 hover:shadow-medium ${
              isUser
                ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-lg dark:from-primary-500 dark:to-primary-600'
                : 'bg-white border-2 border-neutral-100 dark:bg-dark-100 dark:text-dark-900 dark:border-dark-200 rounded-bl-lg'
            }`}
          >
            {content && (
              <div
                className={`prose max-w-none prose-sm ${isUser ? 'prose-invert' : 'prose-neutral dark:prose-invert'}`}
              >
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}

            {attachments && attachments.length > 0 && (
              <FileAttachments attachments={attachments} isUserMessage={isUser} />
            )}
          </div>

          <div
            className={`text-xs text-neutral-500 dark:text-dark-500 mt-2 font-medium ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {formatDate(timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
