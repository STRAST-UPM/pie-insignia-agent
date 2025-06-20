import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, imageAlt }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return createPortal(
    <div
      className='fixed inset-0 z-[9999] bg-black bg-opacity-80 flex items-center justify-center p-4'
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className='relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors'
          aria-label='Close image'
        >
          <X size={20} className='text-gray-600' />
        </button>
        <img
          src={imageSrc}
          alt={imageAlt}
          className='max-w-full max-h-[85vh] w-auto h-auto object-contain block mx-auto'
        />
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
