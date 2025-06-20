import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, Send } from 'lucide-react';
import Button from './ui/Button';
import { debounce } from '../utils/helpers';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isProcessing?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isProcessing = false,
  placeholder = 'Ask anything about your studies...',
}) => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced textarea resize for better performance
  const debouncedResize = useCallback(
    debounce(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, 100),
    []
  );

  useEffect(() => {
    debouncedResize();
  }, [message, debouncedResize]);
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return;

      const newFiles = Array.from(event.target.files).filter(
        (file) => !selectedFiles.some((selectedFile) => selectedFile.name === file.name)
      );

      if (newFiles.length > 0) {
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }

      // Clear input to allow same file selection again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [selectedFiles]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback((fileNameToRemove: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileNameToRemove));
  }, []);
  const handleSendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && selectedFiles.length === 0) || isProcessing) return;

    onSendMessage(trimmedMessage, selectedFiles);
    setMessage('');
    setSelectedFiles([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, selectedFiles, isProcessing, onSendMessage]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSendMessage();
    },
    [handleSendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );
  return (
    <form
      onSubmit={handleSubmit}
      className='relative glass-effect border-t-2 border-neutral-200 dark:border-dark-200 p-6 rounded-t-2xl'
    >
      {selectedFiles.length > 0 && (
        <div className='mb-4 flex flex-wrap gap-3'>
          {selectedFiles.map((file) => (
            <div
              key={file.name}
              className='flex items-center bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-dark-200 dark:to-dark-100 rounded-xl px-4 py-2 text-sm shadow-soft'
            >
              <span className='truncate max-w-[200px] font-medium text-neutral-700 dark:text-dark-700'>
                {file.name}
              </span>
              <button
                type='button'
                onClick={() => removeFile(file.name)}
                className='ml-3 text-neutral-500 hover:text-error-500 dark:text-dark-500 dark:hover:text-error-400 transition-colors duration-200 text-lg font-semibold'
                aria-label={`Remove ${file.name}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}{' '}
      <div className='flex items-end gap-4'>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isProcessing}
          rows={1}
          className='flex-grow p-4 border-2 border-neutral-200 dark:border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-100 dark:text-dark-900 placeholder-neutral-500 dark:placeholder-dark-500 resize-none overflow-y-auto transition-all duration-300 hide-scrollbar shadow-soft bg-white'
        />
        <Button
          type='button'
          onClick={triggerFileInput}
          variant='outline'
          size='sm'
          aria-label='Attach files'
          disabled={isProcessing}
          icon={<Paperclip size={20} />}
          className='rounded-xl border-2 hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-500 dark:hover:bg-primary-950 h-[56px] w-[56px] flex-shrink-0'
        />
        <input
          type='file'
          accept='image/*,application/pdf'
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className='hidden'
          disabled={isProcessing}
        />
        <Button
          type='submit'
          disabled={(!message.trim() && selectedFiles.length === 0) || isProcessing}
          isLoading={isProcessing}
          variant='primary'
          size='sm'
          aria-label='Send message'
          icon={<Send size={20} />}
          className='h-[56px] w-[56px] flex-shrink-0'
        />
      </div>
    </form>
  );
};

export default React.memo(ChatInput);
