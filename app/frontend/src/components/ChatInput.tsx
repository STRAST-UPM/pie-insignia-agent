import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, Send } from 'lucide-react';
import Button from './ui/Button';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void; // Changed to accept an array of files
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const newFiles = Array.from(event.target.files).filter(
      (file) => !selectedFiles.some((selectedFile) => selectedFile.name === file.name)
    );

    if (newFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileNameToRemove: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileNameToRemove));
  };

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && selectedFiles.length === 0) || isProcessing) return;

    onSendMessage(trimmedMessage, selectedFiles);
    setMessage('');
    setSelectedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, selectedFiles, isProcessing, onSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='relative bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4'
    >
      {selectedFiles.length > 0 && (
        <div className='mb-2 flex flex-wrap gap-2'>
          {selectedFiles.map((file) => (
            <div
              key={file.name}
              className='flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm'
            >
              <span>{file.name}</span>
              <button
                type='button'
                onClick={() => removeFile(file.name)}
                className='ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='flex items-start'>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isProcessing}
          rows={1}
          className='flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-y-auto transition-all duration-200 hide-scrollbar'
        />
        <Button
          type='button'
          onClick={triggerFileInput}
          variant='primary'
          size='sm'
          aria-label='Attach files'
          disabled={isProcessing}
          icon={<Paperclip size={20} />}
        />
        <input
          type='file'
          accept='image/*,application/pdf'
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
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
        />
      </div>
    </form>
  );
};

export default ChatInput;
