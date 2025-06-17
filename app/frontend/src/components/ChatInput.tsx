import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send } from 'lucide-react';
import Button from './ui/Button';

interface Attachment {
  name: string;
  url: string;
  type: string;
}

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Changed to an array of Files
  const [filePreviews, setFilePreviews] = useState<Attachment[]>([]); // Changed to an array of Attachment for previews
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

    if (newFiles.length === 0) return;

    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prevPreviews) => [
          ...prevPreviews,
          { name: file.name, url: reader.result as string, type: file.type },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileNameToRemove: string) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileNameToRemove));
    setFilePreviews((prevPreviews) => prevPreviews.filter((preview) => preview.name !== fileNameToRemove));
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && selectedFiles.length === 0) || isProcessing) return;

    onSendMessage(trimmedMessage, selectedFiles);
    setMessage('');
    setSelectedFiles([]);
    setFilePreviews([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

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
      {filePreviews.length > 0 && (
        <div className='mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
          {filePreviews.map((file) => (
            <div key={file.name} className='p-2 border dark:border-gray-500 rounded-md flex flex-col items-center'>
              {file.type.startsWith('image/') ? (
                <img src={file.url} alt={file.name} className='max-h-24 max-w-full rounded-md mb-1 object-contain' />
              ) : (
                <div className='text-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md w-full'>
                  <Paperclip size={24} className='mx-auto mb-1' />
                  <p className='text-xs truncate w-full'>{file.name}</p>
                </div>
              )}
              <Button
                onClick={() => removeFile(file.name)}
                variant='ghost'
                size='sm'
                className='mt-1 text-red-500 hover:text-red-700 w-full text-xs'
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className='flex items-center gap-2'>
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
