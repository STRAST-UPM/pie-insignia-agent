import React, { useState } from 'react';
import { Attachment } from '../types';
import ImageModal from './ui/ImageModal';

interface FileAttachmentsProps {
  attachments: Attachment[];
  isUserMessage?: boolean;
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({ attachments, isUserMessage = false }) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  const isImageFile = (type: string) => type.startsWith('image/');

  const handleFileClick = (attachment: Attachment) => {
    if (isImageFile(attachment.type)) {
      setSelectedImage({ src: attachment.url, alt: attachment.name });
    }
  };

  if (!attachments?.length) return null;
  return (
    <>
      <div className='mt-3 flex flex-wrap gap-2'>
        {attachments.map((attachment, index) => {
          const isImage = isImageFile(attachment.type);

          return (
            <div
              key={`${attachment.name}-${index}`}
              onClick={() => handleFileClick(attachment)}
              className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium shadow-soft transition-all duration-200 ${
                isImage ? 'cursor-pointer hover:shadow-medium' : ''
              } ${
                isUserMessage
                  ? `bg-white/20 text-white ${isImage ? 'hover:bg-white/30' : ''}`
                  : `bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-dark-200 dark:to-dark-100 text-neutral-700 dark:text-dark-700 ${
                      isImage
                        ? 'hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-950 dark:hover:to-primary-900'
                        : ''
                    }`
              }`}
            >
              <span className='truncate max-w-[200px]'>{attachment.name}</span>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <ImageModal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageSrc={selectedImage.src}
          imageAlt={selectedImage.alt}
        />
      )}
    </>
  );
};

export default FileAttachments;
