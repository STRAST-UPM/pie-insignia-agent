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

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const currentFiles = [...selectedFiles];
      const currentPreviews = [...filePreviews];

      newFiles.forEach((file) => {
        // Prevent adding duplicate files by name (simple check)
        if (!currentFiles.some((f) => f.name === file.name)) {
          currentFiles.push(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            currentPreviews.push({
              name: file.name,
              url: reader.result as string,
              type: file.type,
            });
            setFilePreviews([...currentPreviews]); // Update previews
          };
          reader.readAsDataURL(file);
        }
      });
      setSelectedFiles(currentFiles);
      // Clear the input value to allow selecting the same file again if removed and re-added
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileNameToRemove: string) => {
    // Renamed from clearImage and updated to remove a specific file
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileNameToRemove));
    setFilePreviews((prevPreviews) => prevPreviews.filter((preview) => preview.name !== fileNameToRemove));
  };

  const handleSendMessageInternal = () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    onSendMessage(message, selectedFiles.length > 0 ? selectedFiles : undefined);
    setMessage('');
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if ((trimmedMessage || selectedFiles.length > 0) && !isProcessing) {
      handleSendMessageInternal();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='relative bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 transition-all duration-200'
    >
      {filePreviews.length > 0 && (
        <div className='mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg max-w-full mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
          {filePreviews.map((file, index) => (
            <div key={index} className='p-2 border dark:border-gray-500 rounded-md flex flex-col items-center'>
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
                className='mt-1 text-red-500 w-full text-xs'
              >
                Remove File
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className='flex items-center gap-2 max-w-4xl mx-auto'>
        <Button
          type='button'
          onClick={triggerFileInput}
          variant='primary'
          className='h-12 w-12 p-3 rounded-full flex-shrink-0'
          aria-label='Attach files' // Updated aria-label
          disabled={isProcessing}
          icon={<Paperclip size={18} />}
        />
        <input
          type='file'
          accept='image/*,application/pdf'
          multiple // Added multiple attribute
          onChange={handleFileChange} // Renamed handler
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
          className='flex-grow h-12 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-hidden transition-all duration-200' // Ajustar altura uniforme
        />
        <Button
          type='submit'
          disabled={(!message.trim() && selectedFiles.length === 0) || isProcessing} // Updated condition
          isLoading={isProcessing}
          variant='primary'
          className='h-12 w-12 p-3 rounded-full flex-shrink-0' // Ajustar tamaño uniforme
          aria-label='Send message'
          icon={<Send size={18} />} // Restaurar el ícono explícito
        />
      </div>
    </form>
  );
};

export default ChatInput;
